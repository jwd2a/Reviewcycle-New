import type {
  Comment,
  CreateCommentRequest,
  ReviewCycleConfig,
  CommentCreatedPayload,
  CommentUpdatedPayload,
  CommentDeletedPayload,
} from '@reviewcycle/shared';
import { createId } from '@paralleldrive/cuid2';
import { ApiClient } from './ApiClient.js';
import { WebSocketManager } from './WebSocketManager.js';

const STORAGE_KEY = 'reviewcycle:comments';

export class StateManager {
  private localComments: Map<string, Comment>;
  private listeners: Set<() => void>;
  private apiClient: ApiClient | null;
  private wsManager: WebSocketManager | null;
  private mode: 'development' | 'production';

  constructor(config: ReviewCycleConfig) {
    this.mode = config.mode || 'development';
    this.localComments = new Map();
    this.listeners = new Set();

    if (this.mode === 'production') {
      // Production mode: Use API + WebSocket
      this.apiClient = new ApiClient(config);
      this.wsManager = new WebSocketManager(config);
      this.setupWebSocketHandlers();
      this.wsManager.connect();
    } else {
      // Development mode: Use localStorage
      this.apiClient = null;
      this.wsManager = null;
      this.loadFromLocalStorage();
    }
  }

  async getComments(url?: string): Promise<Comment[]> {
    if (this.apiClient) {
      try {
        const comments = await this.apiClient.getComments(url);
        // Update local cache
        comments.forEach((c) => this.localComments.set(c.id, c));
        return comments.filter((c) => !c.parentId);
      } catch (error) {
        console.error('Failed to fetch comments from API:', error);
        // Fallback to cache
        return this.getCommentsFromCache(url);
      }
    } else {
      return this.getCommentsFromCache(url);
    }
  }

  async getComment(id: string): Promise<Comment | undefined> {
    if (this.apiClient) {
      try {
        const comment = await this.apiClient.getComment(id);
        this.localComments.set(comment.id, comment);
        return comment;
      } catch (error) {
        console.error('Failed to fetch comment from API:', error);
        return this.localComments.get(id);
      }
    } else {
      return this.localComments.get(id);
    }
  }

  async getThread(threadId: string): Promise<Comment[]> {
    if (this.apiClient) {
      try {
        const comments = await this.apiClient.getThread(threadId);
        comments.forEach((c) => this.localComments.set(c.id, c));
        return comments;
      } catch (error) {
        console.error('Failed to fetch thread from API:', error);
        return this.getThreadFromCache(threadId);
      }
    } else {
      return this.getThreadFromCache(threadId);
    }
  }

  async addComment(request: CreateCommentRequest): Promise<Comment> {
    if (this.apiClient) {
      try {
        // Optimistic update: create temporary comment
        const tempId = `temp_${Date.now()}`;
        const tempComment = this.createTempComment(tempId, request);
        this.localComments.set(tempId, tempComment);
        this.notifyListeners();

        // Send to API
        const comment = await this.apiClient.createComment(request);

        // Replace temp comment with real one
        this.localComments.delete(tempId);
        this.localComments.set(comment.id, comment);
        this.notifyListeners();

        return comment;
      } catch (error) {
        console.error('Failed to create comment:', error);
        // Remove temp comment on error
        const tempId = `temp_${Date.now()}`;
        this.localComments.delete(tempId);
        this.notifyListeners();
        throw error;
      }
    } else {
      return this.addCommentLocal(request);
    }
  }

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment | undefined> {
    if (this.apiClient) {
      const existing = this.localComments.get(id);
      try {
        // Optimistic update
        if (existing) {
          const optimistic = { ...existing, ...updates, updatedAt: new Date().toISOString() };
          this.localComments.set(id, optimistic);
          this.notifyListeners();
        }

        // Send to API
        const comment = await this.apiClient.updateComment(id, updates);

        // Update with server response
        this.localComments.set(comment.id, comment);
        this.notifyListeners();

        return comment;
      } catch (error) {
        console.error('Failed to update comment:', error);
        // Revert optimistic update
        if (existing) {
          this.localComments.set(id, existing);
          this.notifyListeners();
        }
        throw error;
      }
    } else {
      return this.updateCommentLocal(id, updates);
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    if (this.apiClient) {
      try {
        const deletedIds = await this.apiClient.deleteComment(id);

        // Remove from cache
        deletedIds.forEach((deletedId) => this.localComments.delete(deletedId));
        this.notifyListeners();

        return deletedIds.length > 0;
      } catch (error) {
        console.error('Failed to delete comment:', error);
        throw error;
      }
    } else {
      return this.deleteCommentLocal(id);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy(): void {
    if (this.wsManager) {
      this.wsManager.disconnect();
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.wsManager) return;

    this.wsManager.on('comment.created', (payload: CommentCreatedPayload) => {
      const { comment } = payload;
      console.log('WebSocket: Comment created', comment.id);

      // Only update if it's not from this client (filter by checking if temp comment exists)
      const hasTempComment = Array.from(this.localComments.keys()).some((key) =>
        key.startsWith('temp_')
      );
      if (!hasTempComment) {
        this.localComments.set(comment.id, comment);
        this.notifyListeners();
      }
    });

    this.wsManager.on('comment.updated', (payload: CommentUpdatedPayload) => {
      const { comment } = payload;
      console.log('WebSocket: Comment updated', comment.id);
      this.localComments.set(comment.id, comment);
      this.notifyListeners();
    });

    this.wsManager.on('comment.deleted', (payload: CommentDeletedPayload) => {
      const { deletedIds } = payload;
      console.log('WebSocket: Comments deleted', deletedIds);
      deletedIds.forEach((id: string) => this.localComments.delete(id));
      this.notifyListeners();
    });
  }

  // Helper methods for cache operations
  private getCommentsFromCache(url?: string): Comment[] {
    let comments = Array.from(this.localComments.values());

    if (url) {
      comments = comments.filter((c) => c.url === url);
    }

    return comments.filter((c) => !c.parentId);
  }

  private getThreadFromCache(threadId: string): Comment[] {
    const comments = Array.from(this.localComments.values());
    return comments.filter((c) => c.threadId === threadId);
  }

  private createTempComment(tempId: string, request: CreateCommentRequest): Comment {
    const now = new Date().toISOString();
    let threadId = tempId;
    if (request.parentId) {
      const parent = this.localComments.get(request.parentId);
      threadId = parent?.threadId || request.parentId;
    }

    return {
      id: tempId,
      text: request.text,
      url: request.url,
      authorName: request.authorName,
      authorEmail: request.authorEmail,
      elementSelector: request.elementSelector,
      elementXPath: request.elementXPath,
      elementText: request.elementText,
      boundingRect: request.boundingRect,
      domContext: request.domContext,
      computedStyles: request.computedStyles,
      parentId: request.parentId,
      threadId,
      resolved: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Development mode methods (localStorage)
  private addCommentLocal(request: CreateCommentRequest): Comment {
    const now = new Date().toISOString();
    const id = createId();

    let threadId = id;
    if (request.parentId) {
      const parent = this.localComments.get(request.parentId);
      threadId = parent?.threadId || request.parentId;
    }

    const comment: Comment = {
      id,
      text: request.text,
      url: request.url,
      authorName: request.authorName,
      authorEmail: request.authorEmail,
      elementSelector: request.elementSelector,
      elementXPath: request.elementXPath,
      elementText: request.elementText,
      boundingRect: request.boundingRect,
      domContext: request.domContext,
      computedStyles: request.computedStyles,
      parentId: request.parentId,
      threadId,
      resolved: false,
      createdAt: now,
      updatedAt: now,
    };

    this.localComments.set(id, comment);
    this.saveToLocalStorage();
    this.notifyListeners();

    return comment;
  }

  private updateCommentLocal(id: string, updates: Partial<Comment>): Comment | undefined {
    const comment = this.localComments.get(id);
    if (!comment) return undefined;

    const updated: Comment = {
      ...comment,
      ...updates,
      id: comment.id,
      updatedAt: new Date().toISOString(),
    };

    this.localComments.set(id, updated);
    this.saveToLocalStorage();
    this.notifyListeners();

    return updated;
  }

  private deleteCommentLocal(id: string): boolean {
    const deleted = this.localComments.delete(id);
    if (deleted) {
      // Also delete replies
      const replies = Array.from(this.localComments.values()).filter((c) => c.parentId === id);
      replies.forEach((reply) => this.localComments.delete(reply.id));

      this.saveToLocalStorage();
      this.notifyListeners();
    }
    return deleted;
  }

  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const comments = JSON.parse(data) as Comment[];
        comments.forEach((comment) => {
          this.localComments.set(comment.id, comment);
        });
      }
    } catch (error) {
      console.error('Failed to load comments from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      const comments = Array.from(this.localComments.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comments to localStorage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  clear(): void {
    this.localComments.clear();
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }
}
