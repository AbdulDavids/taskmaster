import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/db';
import { tasks } from '$lib/db/schemas/schema';
import { CreateTaskRequest } from './CreateTaskModal.schemas';

export const createTask = command(CreateTaskRequest, async (request) => {
  const { locals } = getRequestEvent();
  const { user } = await locals.validateSession();

  const [newTask] = await db
    .insert(tasks)
    .values({
      title: request.title,
      description: request.description,
      project_id: request.project_id,
      created_by: user.id
    })
    .returning();

  return newTask;
});
