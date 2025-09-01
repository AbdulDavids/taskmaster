import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // Create role 'authenticated' if it does not exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated LOGIN;
        ELSE
          ALTER ROLE authenticated LOGIN;
        END IF;
      END$$;
    `);

    // Create schema 'auth' if it does not exist and grant access
    await client.query(`CREATE SCHEMA IF NOT EXISTS auth;`);
    await client.query(`GRANT USAGE ON SCHEMA auth TO authenticated;`);

    // Create or replace function auth.user_id() that reads JWT sub claim from Neon request context
    await client.query(`
      CREATE OR REPLACE FUNCTION auth.user_id() RETURNS text
      LANGUAGE sql STABLE AS $$
        SELECT COALESCE((current_setting('request.jwt.claims', true))::json ->> 'sub', NULL);
      $$;
    `);

    // Ensure the role can access the schema and tables (RLS still enforces row-level access)
    await client.query(`GRANT USAGE ON SCHEMA public TO authenticated;`);
    await client.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;`
    );
    await client.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;`
    );

    // Ensure function execution by authenticated
    await client.query(`GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated;`);

    console.log('Database auth role, schema grants, and function initialized.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
