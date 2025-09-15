import { getRequestEvent } from '$app/server';
import {
  DATABASE_AUTHENTICATED_URL,
  DATABASE_URL_UNPOOLED,
  DATABASE_AUTHENTICATED_URL_UNPOOLED
} from '$env/static/private';
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

const apiKeyAuthenticator = async (): Promise<string> => {
  const { locals } = getRequestEvent();
  const session = await locals.validateApiKey();
  return session.jwt;
};

export const createAuthenticatedDb = (
  strategy: 'session' | 'bearer' | 'apiKey'
): AuthenticatedDbClient => {
  const pickUnpooled = (url?: string | undefined | null): string | undefined => {
    if (!url) return url as undefined;
    return url.replace('-pooler.', '.');
  };

  const connectionUrl =
    DATABASE_AUTHENTICATED_URL_UNPOOLED ||
    pickUnpooled(DATABASE_AUTHENTICATED_URL) ||
    // final fallback to general unpooled DB URL if specific one not provided
    DATABASE_URL_UNPOOLED ||
    DATABASE_AUTHENTICATED_URL;

  let authenticator: () => Promise<string>;
  if (strategy === 'session') {
    authenticator = sessionAuthenticator;
  } else if (strategy === 'bearer') {
    authenticator = bearerAuthenticator;
  } else if (strategy === 'apiKey') {
    authenticator = apiKeyAuthenticator;
  } else {
    throw new Error('Invalid authentication strategy');
  }

  return drizzle(neon(connectionUrl), {
    schema: combinedSchemas
  }).$withAuth(authenticator);
};

export type AuthenticatedDbClient = ReturnType<
  NeonHttpDatabase<typeof combinedSchemas>['$withAuth']
>;
