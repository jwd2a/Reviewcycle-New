import { Comment, CreateCommentRequest } from '@reviewcycle/shared';
import { createId } from '@paralleldrive/cuid2';

const STORAGE_KEY = 'reviewcycle:comments';

export class StateManager {
  private localComments: Map<string, Comment>;
  private listeners: Set<() => void>;

  constructor(_mode: 'development' | 'production') {
    this.localComments = new Map();
    this.listeners = new Set();
    this.loadFromLocalStorage();
  }

  async getComments(url?: string): Promise<Comment[]> {
    let comments = Array.from(this.localComments.values());

    if (url) {
      comments = comments.filter((c) => c.url === url);
    }

    // Filter to root comments only
    return comments.filter((c) => !c.parentId);
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return this.localComments.get(id);
  }

  async getThread(threadId: string): Promise<Comment[]> {
    const comments = Array.from(this.localComments.values());
    return comments.filter((c) => c.threadId === threadId);
  }

  async addComment(request: CreateCommentRequest): Promise<Comment> {
    const now = new Date().toISOString();
    const id = createId();

    // Determine thread ID
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

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.localComments.get(id);
    if (!comment) return undefined;

    const updated: Comment = {
      ...comment,
      ...updates,
      id: comment.id, // Prevent ID from being changed
      updatedAt: new Date().toISOString(),
    };

    this.localComments.set(id, updated);
    this.saveToLocalStorage();
    this.notifyListeners();

    return updated;
  }

  async deleteComment(id: string): Promise<boolean> {
    const deleted = this.localComments.delete(id);
    if (deleted) {
      // Also delete replies
      const replies = Array.from(this.localComments.values()).filter(
        (c) => c.parentId === id
      );
      replies.forEach((reply) => this.localComments.delete(reply.id));

      this.saveToLocalStorage();
      this.notifyListeners();
    }
    return deleted;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
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

  clear(): void {
    this.localComments.clear();
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }
}
