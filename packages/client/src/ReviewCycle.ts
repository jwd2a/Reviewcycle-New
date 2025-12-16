import { h, render } from 'preact';
import { ReviewCycleConfig } from '@reviewcycle/shared';
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

  constructor(config: ReviewCycleConfig) {
    this.validateConfig(config);
    this.config = {
      mode: 'development',
      baseUrl: 'https://api.reviewcycle.dev',
      ...config,
    };

    this.stateManager = new StateManager(this.config.mode!);
    this.elementSelector = new ElementSelector();
  }

  init(): void {
    if (this.initialized) {
      console.warn('ReviewCycle is already initialized');
      return;
    }

    this.injectOverlay();
    this.initialized = true;
  }

  destroy(): void {
    if (!this.initialized) return;

    this.elementSelector.deactivate();

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

    // Mount Preact app
    render(
      h(App, {
        config: this.config,
        stateManager: this.stateManager,
        elementSelector: this.elementSelector,
      }),
      container
    );

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
