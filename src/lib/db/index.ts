import { DATABASE_URL, DATABASE_URL_UNPOOLED } from '$env/static/private';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as authExtensions from './schemas/auth-extensions.js';
import * as authSchemas from './schemas/auth.js';
import * as schemas from './schemas/schema.js';

export const combinedSchemas = { ...schemas, ...authSchemas, ...authExtensions };

const pickUnpooled = (url?: string | undefined | null): string | undefined => {
  if (!url) return url as undefined;
  // Prefer non-pooler endpoint for neon-http driver
  return url.replace('-pooler.', '.');
};

const NEON_HTTP_URL =
  DATABASE_URL_UNPOOLED || pickUnpooled(DATABASE_URL) || DATABASE_URL;

export const db = drizzle(neon(NEON_HTTP_URL), {
  schema: combinedSchemas
});
