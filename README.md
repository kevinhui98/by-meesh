# By Meesh

Catering management app for Michelle's catering studio. React + Vite frontend
backed by Firestore. No server, no auth.

## Architecture

```
artifacts/catering-app         React + Vite + Tailwind (the only thing users see)
lib/api-client-react           Generated React Query hooks (Orval) + a Firestore
                               backend shim that answers /api/* requests in-browser
```

The generated hooks still think they are calling a REST API. A backend handler
registered at startup (`src/lib/firebase.ts`) intercepts every `/api/*` fetch
and routes it to Firestore reads/writes. Aggregates (event cost, dashboard
summary, procurement list) are computed client-side from the raw collections.

**Firestore collections**

| Collection   | Doc id               | Contents                                  |
| ------------ | -------------------- | ----------------------------------------- |
| `dishes`     | `String(id)`         | Dish incl. ingredients and supplies       |
| `events`     | `String(id)`         | Catering request                          |
| `menus`      | `String(eventId)`    | `{ eventId, entries[] }`                  |
| `_counters`  | collection name      | `{ value }` — monotonic id allocator      |

Numeric ids come from a counter doc bumped via `runTransaction`.

## Local dev

Prereqs: Node 24, pnpm 10.

```bash
pnpm install
```

### 1. Firebase project

Go to https://console.firebase.google.com, create a project (or pick an
existing one), then:

- **Build → Firestore Database → Create database** (start in test mode —
  matches our open rules).
- **Project settings → General** → scroll to "Your apps" → add a **Web app** →
  copy the config values.

### 2. Env file

Create `artifacts/catering-app/.env.local` with the values from the Firebase
console:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### 3. Run

```bash
pnpm --filter @workspace/catering-app run dev
```

Opens on http://localhost:5173. The app talks directly to your Firestore from
the browser — no backend process needed.

### Don't want to touch the cloud?

Use the Firestore emulator instead:

```bash
npx firebase-tools emulators:start --only firestore
```

Then add one line to `artifacts/catering-app/src/lib/firebase.ts` right after
`getFirestore(app)`:

```ts
import { connectFirestoreEmulator } from "firebase/firestore";
if (import.meta.env.DEV) connectFirestoreEmulator(db, "127.0.0.1", 8080);
```

## Build & deploy

```bash
pnpm --filter @workspace/catering-app run build
```

Output lands in `artifacts/catering-app/dist/public`. Deploy to Firebase
Hosting:

```bash
firebase deploy --only hosting,firestore:rules
```

`firebase.json` at the repo root already points `hosting.public` at the build
output and sets an SPA rewrite. `firestore.rules` is wide open — **tighten
before going to production** (App Check or callable Functions).

## What's not in use

The repo still contains an Express + Postgres + Drizzle backend
(`artifacts/api-server`, `lib/db`, `lib/api-spec`, `lib/api-zod`) and a
`mockup-sandbox` design playground. The catering-app no longer talks to any of
them — all data goes straight to Firestore. They can be deleted when you're
sure you won't need them.

`replit.md` is stale (references the old Clerk + Postgres stack) and should be
removed or rewritten once the legacy packages are gone.

## Workspace commands

| Command                 | Does                                        |
| ----------------------- | ------------------------------------------- |
| `pnpm install`          | Install all workspace deps                  |
| `pnpm run typecheck`    | Typecheck every package                     |
| `pnpm run build`        | Typecheck + build every package             |
