import type {
  ReviewCycleConfig,
  WebSocketMessage,
  AuthMessage,
  WebSocketEventType,
} from 'reviewcycle-shared';

type EventHandler = (payload: any) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private baseReconnectDelay = 1000;
  private listeners = new Map<WebSocketEventType, Set<EventHandler>>();
  private wsUrl: string;
  private apiKey: string;
  private reconnectTimeout: number | null = null;
  private isIntentionallyClosed = false;

  constructor(config: ReviewCycleConfig) {
    // Convert HTTP(S) URL to WebSocket URL
    const baseUrl = config.baseUrl || 'http://localhost:3000';
    this.wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
    this.apiKey = config.apiKey;
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;

        // Send authentication message
        this.send({
          type: 'auth',
          apiKey: this.apiKey,
        } as AuthMessage);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.ws = null;

        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('WebSocket intentionally disconnected');
  }

  on(eventType: WebSocketEventType, handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
  }

  off(eventType: WebSocketEventType, handler: EventHandler): void {
    this.listeners.get(eventType)?.delete(handler);
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('WebSocket message received:', message.type);

    const handlers = this.listeners.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.payload);
        } catch (error) {
          console.error(`Error in WebSocket handler for ${message.type}:`, error);
        }
      });
    }

    // Handle auth success
    if (message.type === 'auth_success') {
      console.log('WebSocket authenticated:', message.payload);
    }

    // Handle auth error
    if (message.type === 'auth_error') {
      console.error('WebSocket authentication failed:', message.payload);
      this.isIntentionallyClosed = true; // Don't reconnect on auth failure
      this.ws?.close();
    }

    // Handle general errors
    if (message.type === 'error') {
      console.error('WebSocket error:', message.payload);
    }
  }

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed) {
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectAttempts++;

    console.log(
      `Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimeout = window.setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
