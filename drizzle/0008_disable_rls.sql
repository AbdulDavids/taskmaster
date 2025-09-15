-- Disable RLS and drop auth-based policies to run without auth entirely

-- Projects
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "projects";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "projects";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "projects";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "projects";
ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;

-- Tasks
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "tasks";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "tasks";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "tasks";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "tasks";
ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;

-- Task dependencies
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "task_dependencies";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "task_dependencies";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "task_dependencies";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "task_dependencies";
ALTER TABLE "task_dependencies" DISABLE ROW LEVEL SECURITY;

-- OAuth applications
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "oauth_applications";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "oauth_applications";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "oauth_applications";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "oauth_applications";
ALTER TABLE "oauth_applications" DISABLE ROW LEVEL SECURITY;

-- API keys
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "apikeys";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "apikeys";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "apikeys";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "apikeys";
ALTER TABLE "apikeys" DISABLE ROW LEVEL SECURITY;

