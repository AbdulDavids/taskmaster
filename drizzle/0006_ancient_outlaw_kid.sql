CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(255) NOT NULL,
	"key_prefix" varchar(12) NOT NULL,
	"key_hash" text NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_by" text DEFAULT (auth.user_id()) NOT NULL,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	CONSTRAINT "uk_api_key_hash" UNIQUE("key_hash")
);
--> statement-breakpoint
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "api_keys" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "api_keys"."created_by"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "api_keys" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "api_keys"."created_by"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "api_keys" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "api_keys"."created_by")) WITH CHECK ((select auth.user_id() = "api_keys"."created_by"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "api_keys" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "api_keys"."created_by"));