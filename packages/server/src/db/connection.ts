import pg from 'pg';
import { serverConfig } from '../config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: serverConfig.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('PostgreSQL client connected');
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (serverConfig.nodeEnv === 'development') {
    console.log('Executed query', { text, duration, rows: result.rowCount });
  }

  return result;
}

export async function getClient() {
  return await pool.connect();
}

export async function closePool() {
  await pool.end();
}
