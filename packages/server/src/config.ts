import { config } from 'dotenv';

config();

export interface ServerConfig {
  nodeEnv: string;
  port: number;
  host: string;
  databaseUrl: string;
  allowedOrigins: string[];
  apiKeyPrefix: string;
  adminApiKey: string;
  clerkSecretKey?: string;
  clerkPublishableKey?: string;
  defaultProjectId?: string;
}

function getConfig(): ServerConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  const databaseUrl = process.env.DATABASE_URL;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const apiKeyPrefix = process.env.API_KEY_PREFIX || 'rc_proj_';
  const adminApiKey = process.env.ADMIN_API_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  const defaultProjectId = process.env.DEFAULT_PROJECT_ID || 'rc_proj_demo123';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (!adminApiKey) {
    throw new Error('ADMIN_API_KEY environment variable is required');
  }

  return {
    nodeEnv,
    port,
    host,
    databaseUrl,
    allowedOrigins,
    apiKeyPrefix,
    adminApiKey,
    clerkSecretKey,
    clerkPublishableKey,
    defaultProjectId,
  };
}

export const serverConfig = getConfig();
