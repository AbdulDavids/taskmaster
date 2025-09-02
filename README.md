# Taskmaster

A modern SvelteKit application that demonstrates a clean, secure stack for projects and tasks with first-class API access.

## What is Taskmaster?

Taskmaster is a full-stack Todo/Project app that you deploy and host yourself (e.g., on Vercel). It includes:

- A web UI for managing projects and tasks
- A built-in HTTP API (under `/api`) intended for automation, MCP tools, and integrations
- API keys you generate inside the app (Settings → Developer) to call your own instance

This is not a standalone, multi-tenant public API. You deploy your own Taskmaster instance, then use its API with keys you create in that instance.

## 🚀 One‑click Deploy (Vercel + Neon)

Deploy to Vercel with Neon in minutes. You’ll end with a production URL and API key auth working out of the box.

1. Fork this repo and import it into Vercel
2. In Neon, create a project. Copy the service connection URL as `DATABASE_URL`.
3. In Vercel Project → Settings → Environment Variables, add:

   - `PUBLIC_BETTER_AUTH_URL` = `https://<your-vercel-alias>.vercel.app`
   - `BETTER_AUTH_URL` = `https://<your-vercel-alias>.vercel.app`
   - `BETTER_AUTH_SECRET` = long random hex
   - `DATABASE_URL` = `postgresql://neondb_owner:...`

   The production config should look like this:

   ![Vercel Env Vars](./static/vercel-env-reference.png)

4. Trigger a deploy (push to `main` or use Vercel CLI)
5. Initialize the database (from your local dev machine, one-time):

   ```bash
   bun run db:init     # roles, function, grants
   bun run migrate     # drizzle migrations
   ```

6. Rotating `BETTER_AUTH_SECRET`? Clear JWKS and redeploy:

   ```bash
   bun run db:reset-jwks
   # then redeploy via Vercel
   ```

## 🛠 Tech Stack

This application leverages modern web development tools and frameworks:

- **Frontend**: [Svelte 5](https://svelte.dev) + [SvelteKit 2.x](https://kit.svelte.dev)
- **UI Framework**: [Skeleton UI](https://skeleton.dev) + [TailwindCSS 4.x](https://tailwindcss.com)
- **Authentication**: [Better Auth](https://better-auth.com) with email/password and OIDC support
- **Database**: [PostgreSQL](https://postgresql.org) with [Drizzle ORM](https://orm.drizzle.team)
- **Deployment**: [Vercel](https://vercel.com) with [Neon](https://neon.tech) database
- **Development**: TypeScript, Vite, ESLint, Prettier

## ✨ Key Features

- 🔐 **Full Authentication System** - Email/password auth with Better Auth. This enables Client Credentials, Authorization Code, and Dynamic Client Registration flows.
- 📚 **OpenAPI Documentation** - Auto-generated API documentation (`/api/openapi.yaml`)
- 🤖 **AI-Powered Development** - Optimized for efficient development with Claude Code

## 🏗 AI-Powered Development

This project includes a comprehensive `CLAUDE.md` file that enables efficient AI-powered development workflows. The configuration provides Claude Code with:

- Complete project architecture understanding
- Development command shortcuts
- Database operation guidance
- API development best practices
- Remote functions implementation patterns

Simply use [Claude Code](https://claude.ai/code) with this repository for intelligent code assistance, refactoring, and feature development.

## 🚦 Local Development (Bun)

### Prerequisites

- Bun 1.2+
- Neon (or any PostgreSQL) connection string

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <your-repo-url>
   cd taskmaster
   bun install
   ```

2. **Create local env file (matches production domain)**

   ```bash
   cp .env.example .env.local
   ```

   Then set the following (example values shown):

   ```env
   # Better Auth
   BETTER_AUTH_SECRET=change_me_in_prod
   # Use your Vercel alias host to avoid issuer mismatch in Better Auth
   BETTER_AUTH_URL=https://<your-vercel-alias>.vercel.app
   PUBLIC_BETTER_AUTH_URL=https://<your-vercel-alias>.vercel.app

   # Database (service connection; Neon)
   DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require
   ```

   Notes:
   - Keep `BETTER_AUTH_URL` and `PUBLIC_BETTER_AUTH_URL` set to the same origin you’re using (your Vercel alias) so JWKS issuer stays consistent.

3. **Initialize and migrate the database**

   ```bash
   # Provision role/schema/function needed for RLS and JWT context (safe to re-run)
   bun run db:init

   # Apply all migrations
   bun run migrate
   ```

4. **Start the dev server**

   ```bash
   bun dev
   ```

   Visit `http://localhost:5173` and sign up. Create a project to get started.

## 🏛 Architecture Notes

### Remote Functions

This project uses SvelteKit's experimental remote functions feature for type-safe server-client communication:

- **Component-adjacent pattern**: Each component has its own `Component.remote.ts` and `Component.schemas.ts` files
- **Co-located architecture**: Remote functions, schemas, and components stay together for better maintainability
- **Validation utilities**: Zod schemas with error handling helpers in `/src/lib/util.server.ts`

### Authentication Flow

- **Better Auth Server**: Configured in `src/lib/auth.ts`
- **SvelteKit Integration**: Handled via `src/hooks.server.ts`
- **Database Schemas**: Auth tables in `src/lib/db/schemas/auth.ts`
- **OIDC Provider**: Custom implementation in `src/lib/oidc-provider/`

### API Keys for Programmatic/MCP Access

- Create via Settings → Developer → API Keys → New Key
- Keys are returned once and stored hashed (SHA‑256) server‑side
- Prefix format: `tm_<prefix>_...` for easy identification
- Revoke from the same page; revoked keys are rejected

Client usage (example header):

You can authenticate in any of the following ways:

```http
# Recommended for tools/Gram
Authorization: Bearer tm_xxx_yyy

# Also supported
X-API-Key: tm_xxx_yyy
Authorization: ApiKey tm_xxx_yyy
```

Example:

```bash
curl -s https://<your-vercel-alias>.vercel.app/api/projects \
  -H "Authorization: Bearer tm_xxx_yyy"
```

### Database Structure

- User management and authentication tables
- OAuth applications and tokens
- Session management with caching
- JSON Web Key Sets for token signing

## 📋 Available Commands

### Development

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build

### Code Quality

- `bun run check` - TypeScript checking with svelte-kit sync
- `bun run check:watch` - Continuous type checking
- `bun run lint` - Lint with Prettier + ESLint
- `bun run format` - Format code with Prettier
- `bun run test` - Run tests with Vitest

### Database

- `bun run db:init` - Create `authenticated` role, `auth.user_id()` function, grants
- `bun run migrate` - Run Drizzle migrations
- `bunx drizzle-kit studio` - Open Drizzle Studio

### Operations

- `bun run db:reset-jwks` - Clear JWKS (use when rotating BETTER_AUTH_SECRET)

### Deployment (CLI)

- `bun run build` - Build the app (Vite/SvelteKit)
- `vercel deploy --prod` - Deploy to production

## 📖 API Documentation

OpenAPI spec is at `static/openapi.yaml` and follows the working pattern used by this repo historically. It documents Bearer auth and endpoint contracts that match the deployed app. Update this file whenever endpoints or auth change, and keep the server URL pointed at your Vercel alias.

## 🤝 Contributing

This project follows modern development practices with comprehensive linting, formatting, and type checking. The `CLAUDE.md` configuration ensures consistent development patterns when using AI assistance.
