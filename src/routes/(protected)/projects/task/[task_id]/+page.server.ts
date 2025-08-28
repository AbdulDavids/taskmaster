import { db } from '$lib/db';
import { tasks } from '$lib/db/schemas/schema';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { user } = await locals.validateSession();
  
  const task = await db.query.tasks.findFirst({
    where: and(
      eq(tasks.id, params.task_id),
      eq(tasks.created_by, user.id)
    ),
    with: {
      project: { columns: { id: true, name: true } },
      dependencies: { with: { dependsOnTask: true } },
      dependents: { with: { task: true } }
    }
  });

  if (!task) {
    error(404, 'Task not found');
  }

  return {
    task
  };
};
