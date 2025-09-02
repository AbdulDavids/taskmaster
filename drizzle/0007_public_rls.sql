-- Switch RLS policies from role "authenticated" to PUBLIC
-- Projects
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "projects";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "projects";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "projects";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "projects";
CREATE POLICY "crud-authenticated-policy-select" ON "projects" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((select auth.user_id() = "projects"."created_by"));
CREATE POLICY "crud-authenticated-policy-insert" ON "projects" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((select auth.user_id() = "projects"."created_by"));
CREATE POLICY "crud-authenticated-policy-update" ON "projects" AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((select auth.user_id() = "projects"."created_by")) WITH CHECK ((select auth.user_id() = "projects"."created_by"));
CREATE POLICY "crud-authenticated-policy-delete" ON "projects" AS PERMISSIVE FOR DELETE TO PUBLIC USING ((select auth.user_id() = "projects"."created_by"));

-- Tasks
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "tasks";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "tasks";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "tasks";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "tasks";
CREATE POLICY "crud-authenticated-policy-select" ON "tasks" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((select auth.user_id() = "tasks"."created_by"));
CREATE POLICY "crud-authenticated-policy-insert" ON "tasks" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((select auth.user_id() = "tasks"."created_by"));
CREATE POLICY "crud-authenticated-policy-update" ON "tasks" AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((select auth.user_id() = "tasks"."created_by")) WITH CHECK ((select auth.user_id() = "tasks"."created_by"));
CREATE POLICY "crud-authenticated-policy-delete" ON "tasks" AS PERMISSIVE FOR DELETE TO PUBLIC USING ((select auth.user_id() = "tasks"."created_by"));

-- Task dependencies
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "task_dependencies";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "task_dependencies";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "task_dependencies";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "task_dependencies";
CREATE POLICY "crud-authenticated-policy-select" ON "task_dependencies" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((select auth.user_id() = "task_dependencies"."created_by"));
CREATE POLICY "crud-authenticated-policy-insert" ON "task_dependencies" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((select auth.user_id() = "task_dependencies"."created_by"));
CREATE POLICY "crud-authenticated-policy-update" ON "task_dependencies" AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((select auth.user_id() = "task_dependencies"."created_by")) WITH CHECK ((select auth.user_id() = "task_dependencies"."created_by"));
CREATE POLICY "crud-authenticated-policy-delete" ON "task_dependencies" AS PERMISSIVE FOR DELETE TO PUBLIC USING ((select auth.user_id() = "task_dependencies"."created_by"));

-- OAuth applications
DROP POLICY IF EXISTS "crud-authenticated-policy-select" ON "oauth_applications";
DROP POLICY IF EXISTS "crud-authenticated-policy-insert" ON "oauth_applications";
DROP POLICY IF EXISTS "crud-authenticated-policy-update" ON "oauth_applications";
DROP POLICY IF EXISTS "crud-authenticated-policy-delete" ON "oauth_applications";
CREATE POLICY "crud-authenticated-policy-select" ON "oauth_applications" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((select auth.user_id() = "oauth_applications"."user_id"));
CREATE POLICY "crud-authenticated-policy-insert" ON "oauth_applications" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((select auth.user_id() = "oauth_applications"."user_id"));
CREATE POLICY "crud-authenticated-policy-update" ON "oauth_applications" AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((select auth.user_id() = "oauth_applications"."user_id")) WITH CHECK ((select auth.user_id() = "oauth_applications"."user_id"));
CREATE POLICY "crud-authenticated-policy-delete" ON "oauth_applications" AS PERMISSIVE FOR DELETE TO PUBLIC USING ((select auth.user_id() = "oauth_applications"."user_id"));
