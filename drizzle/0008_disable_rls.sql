-- Disable RLS and drop related policies on application tables

-- Projects
ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "projects";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "projects";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "projects";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "projects";--> statement-breakpoint

-- Task dependencies
ALTER TABLE "task_dependencies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "task_dependencies";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "task_dependencies";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "task_dependencies";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "task_dependencies";--> statement-breakpoint

-- Tasks
ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "tasks";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "tasks";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "tasks";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "tasks";--> statement-breakpoint

-- API Keys
ALTER TABLE "apikeys" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "apikeys";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "apikeys";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "apikeys";--> statement-breakpoint
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "apikeys";--> statement-breakpoint

