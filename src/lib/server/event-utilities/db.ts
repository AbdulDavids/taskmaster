import { getRequestEvent } from '$app/server';
import { DATABASE_AUTHENTICATED_URL, DATABASE_URL } from '$env/static/private';
import { combinedSchemas } from '$lib/db';
import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';

const sessionAuthenticator = async (): Promise<string> => {
  const { locals } = getRequestEvent();
  const session = await locals.validateSession();
  return session.jwt;
};

const bearerAuthenticator = async (): Promise<string> => {
  const { locals } = getRequestEvent();
  const { jwt } = await locals.validateBearerToken();
  return jwt;
};

export const createAuthenticatedDb = (strategy: 'session' | 'bearer'): AuthenticatedDbClient => {
  let authenticator: () => Promise<string>;
  if (strategy === 'session') {
    authenticator = sessionAuthenticator;
  } else if (strategy === 'bearer') {
    authenticator = bearerAuthenticator;
  } else {
    throw new Error('Invalid authentication strategy');
  }

  // Local-dev fallback: optionally bypass Neon JWT auth and use service connection
  if (process.env.USE_AUTH_DB !== 'true') {
    return drizzle(neon(DATABASE_URL), {
      schema: combinedSchemas
    }) as unknown as AuthenticatedDbClient;
  }

  return drizzle(neon(DATABASE_AUTHENTICATED_URL), {
    schema: combinedSchemas
  }).$withAuth(authenticator);
};

export type AuthenticatedDbClient = ReturnType<
  NeonHttpDatabase<typeof combinedSchemas>['$withAuth']
>;
