import { tasks, taskStatusEnum } from '$lib/db/schemas/schema.js';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import z from 'zod';
import { validateRequest } from '../_helpers.js';
import { validateAuthHeader } from '../_helpers.js';
import type { RequestHandler } from './$types.js';

export const PUT: RequestHandler = async ({ locals, request }) => {
  const validToken = await validateAuthHeader(request.headers.get('Authorization'));
  if (!validToken) return new Response('Unauthorized', { status: 401 });
  const authedUserId = (validToken as { userId?: string }).userId;
  if (!authedUserId) return new Response('Invalid token', { status: 400 });
  const { body, params } = await validateRequest({
    paramsSchema: z.object({ id: z.string().uuid() }),
    bodySchema: z.object({
      title: z.string().max(255).optional(),
      description: z.string().max(500).optional(),
      status: z.enum(taskStatusEnum.enumValues).optional(),
      project_id: z.string().uuid().optional()
    })
  });

  // Check if there are any fields to update
  if (Object.keys(body).length === 0) {
    return json({ message: 'No fields provided for update' }, { status: 400 });
  }

  // Update the task
  try {
    const result = await locals.db
      .update(tasks)
      .set(body)
      .where(and(eq(tasks.id, params.id), eq(tasks.created_by, authedUserId)))
      .returning();
    if (result.length === 0) {
      return new Response('Not Found', { status: 404 });
    }
    return json(result[0]);
  } catch (e) {
    locals.logError(e);
    return json({ message: 'Database error', error: (e as Error).message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  const validToken = await validateAuthHeader(request.headers.get('Authorization'));
  if (!validToken) return new Response('Unauthorized', { status: 401 });
  const authedUserId = (validToken as { userId?: string }).userId;
  if (!authedUserId) return new Response('Invalid token', { status: 400 });
  const { params } = await validateRequest({
    paramsSchema: z.object({ id: z.string().uuid() })
  });
  const result = await locals.db
    .delete(tasks)
    .where(and(eq(tasks.id, params.id), eq(tasks.created_by, authedUserId)));
  if (result.rowCount === 0) return new Response('Not Found', { status: 404 });
  return new Response(null, { status: 204 });
};
