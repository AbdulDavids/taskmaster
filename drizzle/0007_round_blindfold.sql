ALTER TABLE "api_keys" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "task_dependencies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "created_by" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "created_by" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "task_dependencies" ALTER COLUMN "created_by" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_by" DROP DEFAULT;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-select" ON "api_keys" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-insert" ON "api_keys" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-update" ON "api_keys" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-delete" ON "api_keys" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-select" ON "projects" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-insert" ON "projects" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-update" ON "projects" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-delete" ON "projects" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-select" ON "task_dependencies" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-insert" ON "task_dependencies" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-update" ON "task_dependencies" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-delete" ON "task_dependencies" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-select" ON "tasks" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-insert" ON "tasks" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-update" ON "tasks" CASCADE;--> statement-breakpoint
DROP POLICY "crud-authenticated-policy-delete" ON "tasks" CASCADE;