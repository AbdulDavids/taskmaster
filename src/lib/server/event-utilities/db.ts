import { getRequestEvent } from '$app/server';
import { DATABASE_URL } from '$env/static/private';
import { combinedSchemas } from '$lib/db';
import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';

// In simplified mode we do not require Neon JWT auth at the DB layer.
// We still validate the session at the app layer and filter by user id.

export const createAuthenticatedDb = (_strategy: 'session' | 'bearer'): AuthenticatedDbClient => {
  return drizzle(neon(DATABASE_URL), {
    schema: combinedSchemas
  }) as unknown as AuthenticatedDbClient;
};

export type AuthenticatedDbClient = ReturnType<
  NeonHttpDatabase<typeof combinedSchemas>['$withAuth']
>;
