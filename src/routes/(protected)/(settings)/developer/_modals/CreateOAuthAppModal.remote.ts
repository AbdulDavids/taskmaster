import { command, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { RegisterOAuthAppRequest } from './CreateOAuthAppModal.schemas';

export const registerOAuthApp = command(RegisterOAuthAppRequest, async (data) => {
  const { locals, request } = getRequestEvent();
  await locals.validateSession();

  locals.sendFlashMessage({ title: 'Unavailable', description: 'OAuth is disabled.' });
  error(501, 'OAuth is disabled');
});
