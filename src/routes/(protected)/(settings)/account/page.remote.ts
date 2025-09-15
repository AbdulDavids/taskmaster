import { form, getRequestEvent } from '$app/server';
import { sendFlashMessage } from '$lib/server/event-utilities';
import { error, redirect } from '@sveltejs/kit';

export const deleteUserAccount = form(async () => {
  const { request, locals } = getRequestEvent();

  locals.sendFlashMessage({
    title: 'Unavailable',
    description: 'Account deletion is disabled in no-auth mode.'
  });
  return redirect(302, '/');
});
