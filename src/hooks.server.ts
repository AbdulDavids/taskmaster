import { building } from '$app/environment';
import { db as adminDb } from '$lib/db';
import {
  ApiBearerTokenHandler,
  ApiKeySessionHandler,
  AppSessionHandler,
  createApiKeyValidator,
  createAuthenticatedDb,
  createBearerTokenValidator,
  createSessionValidator,
  createUserIdGetter,
  getAuthTypeForRoute,
  log,
  logError,
  sendFlashMessage
} from '$lib/server/event-utilities';
import { ServiceContainer } from '$lib/server/services';
import { type Handle } from '@sveltejs/kit';
import { BYPASS_AUTH } from '$env/static/private';
import { BypassSessionHandler } from '$lib/server/event-utilities/session';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.log = log;
  event.locals.logError = logError;
  event.locals.sendFlashMessage = sendFlashMessage;
  event.locals.validateSession = createSessionValidator();
  event.locals.validateBearerToken = createBearerTokenValidator();
  event.locals.validateApiKey = createApiKeyValidator();

  // Default to bypassing auth unless explicitly disabled
  const bypass = String(BYPASS_AUTH ?? 'true').toLowerCase() === 'true';

  if (bypass) {
    // Bypass authentication entirely and use admin DB for all requests
    event.locals.db = adminDb as unknown as ReturnType<typeof createAuthenticatedDb>;
    event.locals.services = new ServiceContainer(event.locals.db, adminDb);
    event.locals.session = new BypassSessionHandler();
    event.locals.getUserId = async () => 'bypass-user';

    // Override deprecated validators to return a fake session
    event.locals.validateSession = async () => ({
      user: await event.locals.session.getUser(),
      session: {
        id: 'bypass-session',
        token: 'bypass',
        expiresAt: new Date(Date.now() + 3600_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        userId: 'bypass-user'
      } as any,
      jwt: 'bypass-jwt'
    });
  } else {
    const authType = getAuthTypeForRoute();
    if (authType !== 'none') {
      if (authType === 'session')
        event.locals.session = new AppSessionHandler({ eagerValidate: true });
      else if (authType === 'bearer')
        event.locals.session = new ApiBearerTokenHandler({ eagerValidate: true });
      else if (authType === 'apiKey')
        event.locals.session = new ApiKeySessionHandler({ eagerValidate: true });

      event.locals.db = createAuthenticatedDb(authType);
      event.locals.getUserId = createUserIdGetter(authType);
      event.locals.services = new ServiceContainer(event.locals.db, adminDb);
    }
  }

  // No Better Auth: always resolve the request directly
  return resolve(event);
};
