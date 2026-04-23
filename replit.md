# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Required Environment Variables

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | Replit Secrets | PostgreSQL connection string (auto-set by Replit DB) |
| `CLERK_SECRET_KEY` | Replit Secrets | Clerk backend secret (from Clerk dashboard) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Replit Secrets | Clerk frontend publishable key |
| `OWNER_USER_ID` | Replit Secrets | **Required for production.** Michelle's Clerk user ID (e.g. `user_abc123`). In development any authenticated user may access owner routes; in production all owner endpoints return 503 until this is set. Find your ID in the Clerk dashboard → Users. |

> **Authorization behavior:**
> - **Development** (`NODE_ENV=development`, default): any signed-in Clerk user can access owner routes. Set `OWNER_USER_ID` to restrict to a specific account.
> - **Production**: if `OWNER_USER_ID` is not set, all private endpoints return 503. If set, only the matching Clerk user ID is allowed; all others get 403.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
