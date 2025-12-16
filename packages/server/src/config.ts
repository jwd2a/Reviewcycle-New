import { config } from 'dotenv';

config();

export interface ServerConfig {
  nodeEnv: string;
  port: number;
  host: string;
  databaseUrl: string;
  allowedOrigins: string[];
  apiKeyPrefix: string;
}

function getConfig(): ServerConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  const databaseUrl = process.env.DATABASE_URL;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const apiKeyPrefix = process.env.API_KEY_PREFIX || 'rc_proj_';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return {
    nodeEnv,
    port,
    host,
    databaseUrl,
    allowedOrigins,
    apiKeyPrefix,
  };
}

export const serverConfig = getConfig();
