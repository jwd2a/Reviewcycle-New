import { query } from '../db/connection.js';

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export async function getProjectByApiKey(apiKey: string): Promise<Project | null> {
  const result = await query<Project>(
    'SELECT * FROM projects WHERE id = $1',
    [apiKey]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function getAllProjects(): Promise<Project[]> {
  const result = await query<Project>('SELECT * FROM projects ORDER BY created_at DESC');
  return result.rows;
}
