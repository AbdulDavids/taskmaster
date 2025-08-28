import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/db';
import { projects } from '$lib/db/schemas/schema';
import { CreateProjectRequest } from './CreateProjectModal.schemas';

export const createProject = command(CreateProjectRequest, async (request) => {
  const { locals } = getRequestEvent();
  const { user } = await locals.validateSession();

  const [result] = await db
    .insert(projects)
    .values({ 
      ...request,
      created_by: user.id 
    })
    .returning();

  return result;
});
