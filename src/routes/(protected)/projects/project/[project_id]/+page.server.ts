import { db } from '$lib/db';
import { projects } from '$lib/db/schemas/schema';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { user } = await locals.validateSession();
  
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, params.project_id),
      eq(projects.created_by, user.id)
    ),
    with: {
      task: {
        orderBy: (fields, { asc }) => [asc(fields.created_at)]
      }
    }
  });

  if (!project) {
    error(404, { message: 'Project not found' });
  }

  return {
    project
  };
};
