import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = await locals.validateSession();
  const projects = await locals.db.query.projects.findMany({
    where: (t, { eq }) => eq(t.created_by, user.id)
  });

  return {
    user,
    projects
  };
};
