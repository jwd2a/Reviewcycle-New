import type { Comment, CreateCommentRequest, ReviewCycleConfig } from 'reviewcycle-shared';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: any
  ) {
    super(body.error || 'API request failed');
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private projectId: string;
  private getToken?: () => Promise<string | null>;

  constructor(config: ReviewCycleConfig, getToken?: () => Promise<string | null>) {
    this.baseUrl = config.baseUrl || 'https://api.reviewcycle.dev';
    this.apiKey = config.apiKey;
    this.projectId = config.projectId || config.apiKey;
    this.getToken = getToken;
  }

  async getComments(url?: string): Promise<Comment[]> {
    const params = new URLSearchParams();
    if (url) params.set('url', url);

    const response = await this.fetch(
      `/api/projects/${this.projectId}/comments?${params}`
    );
    return response.comments;
  }

  async getComment(id: string): Promise<Comment> {
    const response = await this.fetch(
      `/api/projects/${this.projectId}/comments/${id}`
    );
    return response.comment;
  }

  async createComment(request: CreateCommentRequest): Promise<Comment> {
    const response = await this.fetch(
      `/api/projects/${this.projectId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.comment;
  }

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
    const response = await this.fetch(
      `/api/projects/${this.projectId}/comments/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
    return response.comment;
  }

  async deleteComment(id: string): Promise<string[]> {
    const response = await this.fetch(
      `/api/projects/${this.projectId}/comments/${id}`,
      { method: 'DELETE' }
    );
    return response.deletedIds;
  }

  async getThread(threadId: string): Promise<Comment[]> {
    const response = await this.fetch(
      `/api/projects/${this.projectId}/threads/${threadId}`
    );
    return response.comments;
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<any> {
    // Try to get Clerk token first, fall back to API key
    let authToken = this.apiKey;
    if (this.getToken) {
      const clerkToken = await this.getToken();
      if (clerkToken) {
        authToken = clerkToken;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      ...options.headers as Record<string, string>,
    };

    // Add project ID header when using Clerk auth
    if (authToken !== this.apiKey) {
      headers['x-project-id'] = this.projectId;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data);
    }

    return data;
  }
}
