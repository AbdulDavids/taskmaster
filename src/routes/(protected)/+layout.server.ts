import { db } from '$lib/db';
import { projects } from '$lib/db/schemas/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = await locals.validateSession();
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.created_by, user.id)
  });

  return {
    user,
    projects: userProjects
  };
};
