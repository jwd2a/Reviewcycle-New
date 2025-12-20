export interface ReviewCycleConfig {
  apiKey: string;
  projectId?: string;
  mode?: 'development' | 'production';
  baseUrl?: string;
}

export interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementInfo {
  tag: string;
  id?: string;
  classes?: string[];
  text?: string;
}

export interface DOMContext {
  ancestorPath: ElementInfo[];
  siblings: ElementInfo[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  text: string;
  url: string;
  userId?: string;
  user?: User; // Populated user object (for display)
  authorName?: string; // Legacy field, kept for backward compatibility
  authorEmail?: string;
  elementSelector?: string;
  elementXPath?: string;
  elementText?: string;
  elementId?: string; // Unique ID added to element when comment is created
  boundingRect?: BoundingRect;
  domContext?: DOMContext;
  computedStyles?: Record<string, string>;
  clickOffset?: { x: number; y: number }; // Precise click position relative to element
  parentId?: string;
  threadId: string;
  resolved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  text: string;
  url: string;
  authorName?: string;
  authorEmail?: string;
  elementSelector?: string;
  elementXPath?: string;
  elementText?: string;
  elementId?: string; // Unique ID added to element when comment is created
  boundingRect?: BoundingRect;
  domContext?: DOMContext;
  computedStyles?: Record<string, string>;
  clickOffset?: { x: number; y: number }; // Precise click position relative to element
  parentId?: string;
}

export interface ElementContext {
  selector: string;
  xpath: string;
  boundingRect: BoundingRect;
  computedStyles: Record<string, string>;
  textContent?: string;
  elementId?: string; // Unique ID added to element when comment is created
  attributes: Record<string, string>;
  ancestorPath: ElementInfo[];
  siblings: ElementInfo[];
  clickOffset?: { x: number; y: number }; // Precise click position relative to element
}

export interface GeneratedPrompt {
  text: string;
  tokensUsed: number;
  model: string;
}

// WebSocket Message Types
export type WebSocketEventType =
  | 'auth'
  | 'auth_success'
  | 'auth_error'
  | 'comment.created'
  | 'comment.updated'
  | 'comment.deleted'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: unknown;
  timestamp?: string;
}

export interface AuthMessage {
  type: 'auth';
  apiKey: string;
}

export interface AuthSuccessMessage {
  type: 'auth_success';
  projectId: string;
}

export interface CommentCreatedPayload {
  comment: Comment;
  url: string;
}

export interface CommentUpdatedPayload {
  comment: Comment;
  url: string;
}

export interface CommentDeletedPayload {
  commentId: string;
  deletedIds: string[];
  url: string;
}
