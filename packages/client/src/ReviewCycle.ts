import { h, render } from 'preact';
import { ReviewCycleConfig } from 'reviewcycle-shared';
import { ClerkProvider } from '@clerk/clerk-react';
import { StateManager } from './services/StateManager.js';
import { ElementSelector } from './services/ElementSelector.js';
import { App } from './components/App.js';
import { getInjectedStyles } from './utils/styles.js';

export default class ReviewCycle {
  private config: ReviewCycleConfig;
  private overlay: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private stateManager: StateManager;
  private elementSelector: ElementSelector;
  private initialized = false;
  private clerkPublishableKey: string | null = null;

  constructor(config: ReviewCycleConfig) {
    this.validateConfig(config);
    this.config = {
      mode: 'development',
      baseUrl: 'https://api.reviewcycle.dev',
      ...config,
    };

    // Create token getter for Clerk auth
    const getToken = async () => {
      // Access Clerk instance from window (available after ClerkProvider mounts)
      const clerk = (window as any).Clerk;
      console.log('[ReviewCycle] Getting token, Clerk available:', !!clerk);

      if (clerk) {
        console.log('[ReviewCycle] Clerk session:', !!clerk.session);
        if (clerk.session) {
          try {
            const token = await clerk.session.getToken();
            console.log('[ReviewCycle] Got Clerk token:', token ? 'yes' : 'no');
            return token;
          } catch (error) {
            console.error('[ReviewCycle] Failed to get Clerk token:', error);
            return null;
          }
        }
      }
      console.log('[ReviewCycle] No Clerk session, using API key');
      return null;
    };

    this.stateManager = new StateManager(this.config, getToken);
    this.elementSelector = new ElementSelector();
  }

  async init(): Promise<void> {
    if (this.initialized) {
      console.warn('ReviewCycle is already initialized');
      return;
    }

    // Fetch Clerk publishable key from API
    await this.fetchConfig();

    this.injectOverlay();
    this.initialized = true;
  }

  destroy(): void {
    if (!this.initialized) return;

    this.elementSelector.deactivate();
    this.stateManager.destroy();

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.shadowRoot = null;
    }

    this.initialized = false;
  }

  private validateConfig(config: ReviewCycleConfig): void {
    if (!config.apiKey) {
      throw new Error('ReviewCycle: apiKey is required');
    }

    if (!config.apiKey.startsWith('rc_proj_')) {
      console.warn('ReviewCycle: API key format should be "rc_proj_..."');
    }
  }

  private async fetchConfig(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/config`);
      if (!response.ok) {
        console.error('Failed to fetch ReviewCycle config:', response.statusText);
        return;
      }
      const data = await response.json();
      this.clerkPublishableKey = data.clerkPublishableKey || null;
    } catch (error) {
      console.error('Failed to fetch ReviewCycle config:', error);
    }
  }

  private injectOverlay(): void {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'reviewcycle-root';

    // Create shadow DOM for isolation
    this.shadowRoot = this.overlay.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = getInjectedStyles();
    this.shadowRoot.appendChild(style);

    // Create container for Preact app
    const container = document.createElement('div');
    this.shadowRoot.appendChild(container);

    // Mount Preact app with optional Clerk wrapper
    const app = h(App, {
      config: this.config,
      stateManager: this.stateManager,
      elementSelector: this.elementSelector,
      clerkPublishableKey: this.clerkPublishableKey,
    });

    // Wrap with ClerkProvider if publishable key is available
    const rootElement = this.clerkPublishableKey
      ? h(ClerkProvider, { publishableKey: this.clerkPublishableKey }, app)
      : app;

    render(rootElement, container);

    // Append to body
    document.body.appendChild(this.overlay);
  }

  // Public API for programmatic access
  async getComments() {
    return this.stateManager.getComments(window.location.href);
  }

  async addComment(text: string) {
    return this.stateManager.addComment({
      text,
      url: window.location.href,
    });
  }
}
