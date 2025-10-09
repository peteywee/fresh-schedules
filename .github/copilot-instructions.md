# Copilot Instructions — Fresh Schedules (Top Shelf Service LLC)

## Project Identity (NO AMBIGUITY)
- Framework: **Next.js 14 (App Router)**, React 18, TypeScript 5
- API: **Express** (Node 20), CORS, Pino
- Data: **Firebase** (Client: Auth/Firestore; Server: Admin SDK)
- Styling: Tailwind CSS (optional shadcn/ui)
- Tooling: **pnpm** workspaces, ESLint, Prettier
- CI: GitHub Actions (lint/typecheck/test/build)
- Branch model: **main** (prod, clean), **develop** (active), **notes** (docs only)

> Never scaffold with Vite, CRA, or any stack other than the above.

## Ground Rules for Copilot Outputs
1. **Give complete files**, correct paths, and imports. No “snippets only” unless asked.
2. **Explain What & Why** briefly at the top of each answer before code.
3. **Include Acceptance Criteria** and **Success Criteria** for the change.
4. **Add a TODO list** when there are follow-ups, with file paths.
5. **Target develop** (do not change `main` rules/branch).
6. **Security**: Never embed secrets. Do not use Admin SDK in client code.
7. **DX**: Keep commands pnpm-first. Show precise commands to run and verify.
8. **Testing**: If adding logic, include a minimal test or a test stub + exact path.
9. **No placeholders** like `<your-api-key>` in committed code; use `.env` with `VITE_*` for client and `FIREBASE_*`/JSON for server.

## Directory Norms (expected)
- `apps/web` — Next.js App Router, `app/` pages, `src/` libs
- `services/api` — Express entry at `src/index.ts`
- `packages/types` — shared types/schemas (`src/index.ts`)
- `scripts/` — automation; `scripts/guard-main.sh` enforced in CI
- CI runs only on `main` and `develop` (not `notes`)

## Patterns to Follow
- **Next.js**: Use Server Components by default; Client Components only when needed. Keep API calls in server routes or the Express API; avoid client secret use.
- **Express**: Typed handlers, centralized error responses, health endpoints (`/health`, `/status`).
- **Firebase**:
  - Client: `initializeApp` + `getAuth` + `getFirestore` (no admin here).
  - Server: `firebase-admin` initialized from env JSON, never from file on disk.
- **RBAC**: Roles (`admin|manager|staff`) checked both in API and Firestore rules.
- **PWA**: Service worker behind a feature flag; safe updates.

## Definition of Done (Every PR)
- `pnpm install` succeeds; `pnpm build` is green in CI.
- ESLint + TypeScript checks pass.
- If UI: compiles under Next.js App Router; pages/routes correct.
- If API: endpoint documented; curl example included; returns stable JSON.
- If Data/Rules: exact collections/paths and indexes listed.

## Forbidden
- Vite, CRA, or any scaffolding that isn’t **Next.js 14**.
- Mixing Admin SDK into client bundles.
- “Pseudo code” without runnable files.
- Writing docs/notes into `main` (guard will fail).

— End of rules —
