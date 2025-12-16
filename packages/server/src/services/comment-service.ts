import { createId } from '@paralleldrive/cuid2';
import { query, getClient } from '../db/connection.js';
import type { Comment, CreateCommentRequest } from '@reviewcycle/shared';

interface DbComment {
  id: string;
  project_id: string;
  text: string;
  url: string;
  author_name: string | null;
  author_email: string | null;
  element_selector: string | null;
  element_xpath: string | null;
  element_text: string | null;
  bounding_rect: any;
  dom_context: any;
  computed_styles: any;
  parent_id: string | null;
  thread_id: string;
  resolved: boolean;
  created_at: Date;
  updated_at: Date;
}

function dbCommentToComment(dbComment: DbComment): Comment {
  return {
    id: dbComment.id,
    text: dbComment.text,
    url: dbComment.url,
    authorName: dbComment.author_name || undefined,
    authorEmail: dbComment.author_email || undefined,
    elementSelector: dbComment.element_selector || undefined,
    elementXPath: dbComment.element_xpath || undefined,
    elementText: dbComment.element_text || undefined,
    boundingRect: dbComment.bounding_rect || undefined,
    domContext: dbComment.dom_context || undefined,
    computedStyles: dbComment.computed_styles || undefined,
    parentId: dbComment.parent_id || undefined,
    threadId: dbComment.thread_id,
    resolved: dbComment.resolved,
    createdAt: dbComment.created_at.toISOString(),
    updatedAt: dbComment.updated_at.toISOString(),
  };
}

export async function getComments(
  projectId: string,
  url?: string
): Promise<Comment[]> {
  let queryText = `
    SELECT * FROM comments
    WHERE project_id = $1 AND parent_id IS NULL
  `;
  const params: any[] = [projectId];

  if (url) {
    queryText += ` AND url = $2`;
    params.push(url);
  }

  queryText += ` ORDER BY created_at DESC`;

  const result = await query<DbComment>(queryText, params);
  return result.rows.map(dbCommentToComment);
}

export async function getComment(
  projectId: string,
  commentId: string
): Promise<Comment | null> {
  const result = await query<DbComment>(
    `SELECT * FROM comments WHERE project_id = $1 AND id = $2`,
    [projectId, commentId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return dbCommentToComment(result.rows[0]);
}

export async function getThread(
  projectId: string,
  threadId: string
): Promise<Comment[]> {
  const result = await query<DbComment>(
    `SELECT * FROM comments
     WHERE project_id = $1 AND thread_id = $2
     ORDER BY created_at ASC`,
    [projectId, threadId]
  );

  return result.rows.map(dbCommentToComment);
}

export async function createComment(
  projectId: string,
  request: CreateCommentRequest
): Promise<Comment> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const commentId = createId();
    let threadId = commentId;

    // If this is a reply, get the thread ID from the parent
    if (request.parentId) {
      const parentResult = await client.query<DbComment>(
        `SELECT thread_id FROM comments WHERE project_id = $1 AND id = $2`,
        [projectId, request.parentId]
      );

      if (parentResult.rows.length === 0) {
        throw new Error('Parent comment not found');
      }

      threadId = parentResult.rows[0].thread_id;
    }

    const result = await client.query<DbComment>(
      `INSERT INTO comments (
        id, project_id, text, url,
        author_name, author_email,
        element_selector, element_xpath, element_text,
        bounding_rect, dom_context, computed_styles,
        parent_id, thread_id, resolved
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *`,
      [
        commentId,
        projectId,
        request.text,
        request.url,
        request.authorName || null,
        request.authorEmail || null,
        request.elementSelector || null,
        request.elementXPath || null,
        request.elementText || null,
        request.boundingRect ? JSON.stringify(request.boundingRect) : null,
        request.domContext ? JSON.stringify(request.domContext) : null,
        request.computedStyles ? JSON.stringify(request.computedStyles) : null,
        request.parentId || null,
        threadId,
        false,
      ]
    );

    await client.query('COMMIT');

    return dbCommentToComment(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateComment(
  projectId: string,
  commentId: string,
  updates: Partial<Comment>
): Promise<Comment | null> {
  const allowedUpdates = ['text', 'resolved', 'authorName', 'authorEmail'];
  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramIndex = 1;

  if (updates.text !== undefined) {
    updateFields.push(`text = $${paramIndex++}`);
    updateValues.push(updates.text);
  }
  if (updates.resolved !== undefined) {
    updateFields.push(`resolved = $${paramIndex++}`);
    updateValues.push(updates.resolved);
  }
  if (updates.authorName !== undefined) {
    updateFields.push(`author_name = $${paramIndex++}`);
    updateValues.push(updates.authorName);
  }
  if (updates.authorEmail !== undefined) {
    updateFields.push(`author_email = $${paramIndex++}`);
    updateValues.push(updates.authorEmail);
  }

  if (updateFields.length === 0) {
    return getComment(projectId, commentId);
  }

  updateValues.push(projectId, commentId);

  const result = await query<DbComment>(
    `UPDATE comments
     SET ${updateFields.join(', ')}
     WHERE project_id = $${paramIndex++} AND id = $${paramIndex++}
     RETURNING *`,
    updateValues
  );

  if (result.rows.length === 0) {
    return null;
  }

  return dbCommentToComment(result.rows[0]);
}

export async function deleteComment(
  projectId: string,
  commentId: string
): Promise<string[]> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Get all comment IDs that will be deleted (parent + children)
    const selectResult = await client.query<{ id: string }>(
      `WITH RECURSIVE comment_tree AS (
        SELECT id FROM comments
        WHERE project_id = $1 AND id = $2
        UNION ALL
        SELECT c.id FROM comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
        WHERE c.project_id = $1
      )
      SELECT id FROM comment_tree`,
      [projectId, commentId]
    );

    const deletedIds = selectResult.rows.map(row => row.id);

    if (deletedIds.length === 0) {
      await client.query('ROLLBACK');
      return [];
    }

    // Delete the comment (cascading delete will handle children)
    await client.query(
      `DELETE FROM comments WHERE project_id = $1 AND id = $2`,
      [projectId, commentId]
    );

    await client.query('COMMIT');

    return deletedIds;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
