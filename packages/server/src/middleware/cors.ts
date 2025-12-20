import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import { serverConfig } from '../config.js';

export async function configureCors(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: serverConfig.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-project-id'],
  });
}
