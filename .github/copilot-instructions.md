# Copilot Instructions — Fresh Schedules (Top Shelf Service LLC)

## Identity (NO AMBIGUITY)
- Framework: **Next.js 14 (App Router)**, React 18, TypeScript 5
- API: **Express** (Node 20), CORS, Pino
- Data: **Firebase** (Client: Auth/Firestore; Server: Admin SDK)
- Styling: Tailwind CSS (shadcn/ui optional)
- Tooling: **pnpm** workspaces, ESLint, Prettier
- CI: GitHub Actions (lint/typecheck/test/build)
- Branches: **main** (prod), **develop** (active), **notes** (docs only)
> Never scaffold with Vite/CRA.

## Output Rules
1) Provide **complete files** with paths/imports.
2) Start with brief **What & Why**.
3) Include **Acceptance Criteria** + **Success Criteria**.
4) Add a **TODO list** (with file paths) when follow-ups exist.
5) Work on **develop**; do not place docs on main/develop.
6) No secrets; Admin SDK never in client code.
7) Use pnpm commands; provide exact run/verify steps.
8) If logic: add a minimal test or stub + exact path.

## Structure
- `apps/web` — Next.js App Router
- `services/api` — Express API (src/index.ts)
- `packages/types` — shared types & zod schemas
- `scripts/` — automation (guards, doc generator)
- CI runs on `main` and `develop` only.

## Patterns
- **Next.js**: Server Components by default; client components only when needed.
- **API**: Typed endpoints, centralized errors, `/health`, `/status`, `/__/probe`, `/hierarchy/echo`.
- **Firebase (client)**: Auth + Firestore only.
- **Firebase (server)**: Admin SDK from env JSON; never commit keys.
- **RBAC**: admin|manager|staff checks in API and Firestore rules.
- **PWA**: SW behind a feature flag.

## Definition of Done
- `pnpm install` + `pnpm build` pass in CI.
- ESLint + TS checks pass.
- If UI: Next.js route renders.
- If API: endpoint documented + curl example.
- If Data/Rules: exact paths + indexes listed.

## Forbidden
- Vite/CRA or any non-Next scaffolding
- Admin SDK in client code
- Pseudo code without runnable files
- Docs/notes/todos on main/develop (guard will fail)
