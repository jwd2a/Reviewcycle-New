import { query } from '../db/connection.js';
import type { User } from 'reviewcycle-shared';

interface UpsertUserData {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export async function upsertUser(userData: UpsertUserData): Promise<User> {
  const { id, email, name, avatarUrl } = userData;

  const result = await query(
    `INSERT INTO users (id, email, name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id)
     DO UPDATE SET
       email = EXCLUDED.email,
       name = EXCLUDED.name,
       avatar_url = EXCLUDED.avatar_url,
       updated_at = NOW()
     RETURNING id, email, name, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"`,
    [id, email, name || null, avatarUrl || null]
  );

  return result.rows[0];
}

export async function getUser(userId: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, name, avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}
