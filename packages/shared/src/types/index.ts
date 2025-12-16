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

export interface Comment {
  id: string;
  text: string;
  url: string;
  authorName?: string;
  authorEmail?: string;
  elementSelector?: string;
  elementXPath?: string;
  elementText?: string;
  boundingRect?: BoundingRect;
  domContext?: DOMContext;
  computedStyles?: Record<string, string>;
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
  boundingRect?: BoundingRect;
  domContext?: DOMContext;
  computedStyles?: Record<string, string>;
  parentId?: string;
}

export interface ElementContext {
  selector: string;
  xpath: string;
  boundingRect: BoundingRect;
  computedStyles: Record<string, string>;
  textContent?: string;
  attributes: Record<string, string>;
  ancestorPath: ElementInfo[];
  siblings: ElementInfo[];
}

export interface GeneratedPrompt {
  text: string;
  tokensUsed: number;
  model: string;
}
