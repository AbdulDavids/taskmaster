-- Ensure an `auth` schema and helper exist before RLS policies run
-- This supports environments without a built-in `auth` schema (e.g. vanilla Neon)

-- Create schema if missing
CREATE SCHEMA IF NOT EXISTS auth;

-- Create a helper that returns the current user's id from JWT claims if available
-- Falls back to current_user to avoid NULL in non-authenticated contexts
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),                                  -- common claim location
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'),                  -- claims JSON
    NULLIF(current_setting('request.jwt.claims.sub', true), ''),                                 -- alt location
    NULLIF(current_setting('jwt.claims.sub', true), ''),                                         -- other proxies
    current_user::text                                                                           -- safe fallback
  );
$$;

-- Ensure the role referenced by policies exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOINHERIT;
  END IF;
END$$;

