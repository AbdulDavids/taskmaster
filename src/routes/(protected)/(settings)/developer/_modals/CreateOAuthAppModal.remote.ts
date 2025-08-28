import { command, getRequestEvent } from '$app/server';
import { auth } from '$lib/auth';
import { error } from '@sveltejs/kit';
import { RegisterOAuthAppRequest } from './CreateOAuthAppModal.schemas';

export const registerOAuthApp = command(RegisterOAuthAppRequest, async (data) => {
  const { locals, request } = getRequestEvent();
  await locals.validateSession();

  try {
    // Determine grant types and response types based on whether redirect URL is provided
    const hasRedirectUri = data.redirectUrl && data.redirectUrl.trim() !== '';
    const grant_types = hasRedirectUri 
      ? ['client_credentials', 'authorization_code']
      : ['client_credentials'];
    const response_types = hasRedirectUri 
      ? ['token', 'code']
      : ['token'];
    const redirect_uris = hasRedirectUri ? [data.redirectUrl] : [];

    const result = await auth.api.registerOAuthApplication({
      body: {
        client_name: data.name,
        redirect_uris,
        grant_types,
        token_endpoint_auth_method: 'client_secret_basic',
        response_types
      },
      headers: [['cookie', request.headers.get('cookie')!]]
    });
    return result;
  } catch (err) {
    console.error('Failed to register OAuth application:', err);
    error(500, 'Failed to register OAuth application');
  }
});
