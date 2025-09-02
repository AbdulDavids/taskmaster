import { apiKeys } from '$lib/db/schemas/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.validateSession();
  const [apps, apiKeys] = await Promise.all([
    locals.db.query.oauthApplications.findMany({
      where: (t, { eq }) => eq(t.userId, user.id)
    }),
    locals.db.query.apiKeys.findMany({
      where: (t, { eq }) => eq(t.created_by, user.id),
      orderBy: (t, { desc }) => [desc(t.created_at)]
    })
  ]);
  return { apps, apiKeys };
};

export const actions: Actions = {
  revoke_key: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    if (typeof id !== 'string') return fail(400, { message: 'Invalid key id' });
    await locals.validateSession();
    await locals.db.update(apiKeys).set({ revoked: true }).where(eq(apiKeys.id, id));
    return { success: true } as const;
  }
};
