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
| `OWNER_USER_ID` | Replit Secrets | **Required.** Michelle's Clerk user ID (e.g. `user_abc123`). All owner-dashboard API endpoints return 503 until this is set. Find your user ID in the Clerk dashboard → Users. |

> The app is single-owner. Any authenticated Clerk user whose ID does not match `OWNER_USER_ID` receives a 403 Forbidden. If `OWNER_USER_ID` is unset, all private endpoints fail with 503 (fail-closed security default).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
