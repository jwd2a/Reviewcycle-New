import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { serverConfig } from '../config.js';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { statusCode = 500, message, code } = error;

  const response: ErrorResponse = {
    error: message || 'Internal server error',
    code: code || 'INTERNAL_ERROR',
  };

  // Include stack trace in development
  if (serverConfig.nodeEnv === 'development') {
    response.details = error.stack;
  }

  request.log.error(error);

  reply.code(statusCode).send(response);
}
