import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import * as commentService from '../services/comment-service.js';
import { roomManager } from '../websocket/rooms.js';
import type {
  CreateCommentRequest,
  Comment,
  CommentCreatedPayload,
  CommentUpdatedPayload,
  CommentDeletedPayload,
} from '@reviewcycle/shared';

export async function commentRoutes(fastify: FastifyInstance) {
  // All comment routes require authentication
  fastify.addHook('preHandler', authMiddleware);

  // GET /api/projects/:projectId/comments?url={url}
  fastify.get<{
    Params: { projectId: string };
    Querystring: { url?: string };
  }>('/api/projects/:projectId/comments', async (request, reply) => {
    const { projectId } = request.params;
    const { url } = request.query;

    // Verify project ID matches authenticated project
    if (projectId !== request.projectId) {
      return reply.code(403).send({
        error: 'Access denied to this project',
        code: 'FORBIDDEN',
      });
    }

    const comments = await commentService.getComments(projectId, url);

    return { comments };
  });

  // POST /api/projects/:projectId/comments
  fastify.post<{
    Params: { projectId: string };
    Body: CreateCommentRequest;
  }>('/api/projects/:projectId/comments', async (request, reply) => {
    const { projectId } = request.params;
    const commentRequest = request.body;

    if (projectId !== request.projectId) {
      return reply.code(403).send({
        error: 'Access denied to this project',
        code: 'FORBIDDEN',
      });
    }

    // Validate required fields
    if (!commentRequest.text || !commentRequest.url) {
      return reply.code(400).send({
        error: 'Missing required fields: text, url',
        code: 'VALIDATION_ERROR',
      });
    }

    try {
      const comment = await commentService.createComment(projectId, commentRequest);

      // Broadcast to WebSocket clients
      const payload: CommentCreatedPayload = {
        comment,
        url: comment.url,
      };
      roomManager.broadcast(projectId, {
        type: 'comment.created',
        payload,
        timestamp: new Date().toISOString(),
      });

      return reply.code(201).send({ comment });
    } catch (error: any) {
      if (error.message === 'Parent comment not found') {
        return reply.code(404).send({
          error: 'Parent comment not found',
          code: 'PARENT_NOT_FOUND',
        });
      }
      throw error;
    }
  });

  // GET /api/projects/:projectId/comments/:id
  fastify.get<{
    Params: { projectId: string; id: string };
  }>('/api/projects/:projectId/comments/:id', async (request, reply) => {
    const { projectId, id } = request.params;

    if (projectId !== request.projectId) {
      return reply.code(403).send({
        error: 'Access denied to this project',
        code: 'FORBIDDEN',
      });
    }

    const comment = await commentService.getComment(projectId, id);

    if (!comment) {
      return reply.code(404).send({
        error: 'Comment not found',
        code: 'NOT_FOUND',
      });
    }

    return { comment };
  });

  // PATCH /api/projects/:projectId/comments/:id
  fastify.patch<{
    Params: { projectId: string; id: string };
    Body: Partial<Comment>;
  }>('/api/projects/:projectId/comments/:id', async (request, reply) => {
    const { projectId, id } = request.params;
    const updates = request.body;

    if (projectId !== request.projectId) {
      return reply.code(403).send({
        error: 'Access denied to this project',
        code: 'FORBIDDEN',
      });
    }

    const comment = await commentService.updateComment(projectId, id, updates);

    if (!comment) {
      return reply.code(404).send({
        error: 'Comment not found',
        code: 'NOT_FOUND',
      });
    }

    // Broadcast to WebSocket clients
    const payload: CommentUpdatedPayload = {
      comment,
      url: comment.url,
    };
    roomManager.broadcast(projectId, {
      type: 'comment.updated',
      payload,
      timestamp: new Date().toISOString(),
    });

    return { comment };
  });

  // DELETE /api/projects/:projectId/comments/:id
  fastify.delete<{
    Params: { projectId: string; id: string };
  }>('/api/projects/:projectId/comments/:id', async (request, reply) => {
    const { projectId, id } = request.params;

    if (projectId !== request.projectId) {
      return reply.code(403).send({
        error: 'Access denied to this project',
        code: 'FORBIDDEN',
      });
    }

    // Get comment before deletion to get URL for broadcast
    const commentToDelete = await commentService.getComment(projectId, id);

    const deletedIds = await commentService.deleteComment(projectId, id);

    if (deletedIds.length === 0) {
      return reply.code(404).send({
        error: 'Comment not found',
        code: 'NOT_FOUND',
      });
    }

    // Broadcast to WebSocket clients
    if (commentToDelete) {
      const payload: CommentDeletedPayload = {
        commentId: id,
        deletedIds,
        url: commentToDelete.url,
      };
      roomManager.broadcast(projectId, {
        type: 'comment.deleted',
        payload,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true, deletedIds };
  });

  // GET /api/projects/:projectId/threads/:threadId
  fastify.get<{
    Params: { projectId: string; threadId: string };
  }>('/api/projects/:projectId/threads/:threadId', async (request, reply) => {
    const { projectId, threadId } = request.params;

    if (projectId !== request.projectId) {
      return reply.code(403).send({
        error: 'Access denied to this project',
        code: 'FORBIDDEN',
      });
    }

    const comments = await commentService.getThread(projectId, threadId);

    return { comments };
  });
}
