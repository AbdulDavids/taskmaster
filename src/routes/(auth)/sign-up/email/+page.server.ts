import { authClient } from '$lib/auth-client';
import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions } from './$types';
import { SignUpSchema } from './data.schema';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    locals.log('Sign up action triggered for');
    const form = await superValidate(request, zod(SignUpSchema));

    if (!form.valid) return fail(400, { form });

    try {
      const result = await authClient.signUp.email({
        name: form.data.name,
        email: form.data.email,
        password: form.data.password
      });
      locals.log('Sign up successful:', result);
    } catch (error) {
      locals.logError('Sign up error:', error);

      if (!(error instanceof APIError))
        return message(form, 'An unexpected error occurred', { status: 500 });

      if (error.message) {
        return message(form, error.message, { status: 400 });
      }

      return message(form, 'An unexpected error occurred', { status: 500 });
    }

    locals.log('Sign up successful, redirecting to /sign-in');
    redirect(302, '/sign-in');
  }
};
