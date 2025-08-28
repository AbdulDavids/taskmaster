import { getRequestEvent } from '$app/server';
import { DATABASE_URL } from '$env/static/private';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as authRelations from './schemas/auth-relations.js';
import * as authSchemas from './schemas/auth.js';
import * as schemas from './schemas/schema.js';

const combinedSchemas = { ...schemas, ...authSchemas, ...authRelations };

export const db = drizzle(neon(DATABASE_URL), {
  schema: combinedSchemas
});

export function buildAuthenticatedDbClient() {
  // Use the authenticated URL if available, otherwise fall back to the regular DATABASE_URL
  const authenticatedUrl = process.env.DATABASE_AUTHENTICATED_URL || DATABASE_URL;
  const db = drizzle(neon(authenticatedUrl), {
    schema: combinedSchemas
  });

  const dbWithAuth = db.$withAuth(async () => {
    const { locals } = getRequestEvent();
    const session = await locals.validateSession();
    return session.jwt;
  });

  return dbWithAuth;
}

export type AuthentictedDbClient = ReturnType<typeof buildAuthenticatedDbClient>;
