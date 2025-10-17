# Copilot Instructions — Fresh Schedules

## Branch Policy (STRICT)
- Only two long-lived branches: `develop` and `main`.
- `develop` may include code plus docs/notes/todos/`*.place.*` scaffolding.
- `main` is production-only; never commit docs/notes/todos or any `*.place.*` placeholder files there.

## Architecture Overview
- Monorepo managed by `pnpm` (`pnpm-workspace.yaml`) with Next.js app (`apps/web`), Express API (`services/api`), shared packages (`packages/*`), and automation scripts (`scripts`).
- Frontend is Next.js 14 App Router; legacy `pages/` folder exists only for compatibility but new work lives under `apps/web/app`.
- Server layer is a minimal Express service exposing `/api/shifts` and health endpoints, relying on Firebase Admin via a stubbed `.place.ts` module.
- Shared Zod schemas/types live in `packages/types`; always reuse them instead of redefining request/response shapes.

## Frontend Patterns
- UI primitives live in `apps/web/src/components/ui` with `fs-*` CSS utility classes defined in `app/globals.css`; prefer these styles over Tailwind utility bursts.
- App-level components such as `ScheduleWizard` and `SignInExperience` are colocated in `apps/web/src/components/app` and `app/(auth)`; compose them with the `Card` and `Button` components and lucide-react icons.
- State management today is local React state; persist new data by wiring clients to the API rather than adding ad-hoc local storage.
- Firebase client setup is centralized in `apps/web/src/lib/firebase/client.ts`; load config by importing `firebaseConfig` from `lib/env`, which hard-fails if public env vars are missing.

## API Service Patterns
- `services/api/src/index.ts` boots Express with CORS + JSON and mounts routers under `/api/*`; add new routes via factory functions similar to `createShiftRouter`.
- Input validation must use Zod schemas from `@fresh-schedules/schemas`; enforce role-based access with the `x-role` header pattern shown in `routes/shifts.ts`.
- Firestore access is currently a placeholder (`firebase.place.ts`); wrap real Admin SDK wiring behind that module and return friendly `{ ok, persisted }` responses.

## Shared Packages & Tooling
- `packages/types` exports Zod schemas (`createShiftInput`, `roleEnum`, etc.); update both schema and inferred types when the contract changes.
- `packages/mcp-server` is a local helper service for surfacing repo context; keep its REST surface minimal and update docs when endpoints change.
- Scripts in `scripts/` automate release flows; avoid editing without understanding deployment expectations in `critical-failure.*` and `run-integration-and-deploy.sh`.

## Environment & Secrets
- `.place.ts` files (e.g., `messaging.place.ts`, `firebase.place.ts`) flag code that must be parameterized; replace hardcoded secrets with env lookups and leave the `.place.` suffix until production-ready.
- Next.js expects a `.env.local` supplying all `NEXT_PUBLIC_FIREBASE_*` vars validated in `lib/env.ts`; missing values will throw during import, so guard lazy imports in server components.
- Server env should provide Firebase Admin credentials before calling Firestore; treat auth header names (`x-role`) as case-sensitive in integrations.

## Developer Workflows
- Install dependencies with `pnpm -w install`; add packages using `pnpm --filter <workspace> add <pkg>`.
- Frontend dev server: `pnpm --filter @apps/web dev` (port 3000). API dev server: `pnpm --filter @services/api dev` (port 3333).
- Type checks: `pnpm --filter @apps/web typecheck`, `pnpm --filter @services/api typecheck`.
- Build verification before PRs: `pnpm -r build` (required by policy) and ensure Express emits compiled output under `services/api/dist`.

## Testing Expectations
- Playwright tests live in `apps/web/tests/e2e`; run via `pnpm --filter @apps/web test:e2e`. Update assertions to match actual button copy (e.g., "Continue with Google") when UI changes.
- No unit test harness is set up yet; when adding one, co-locate configs under each package and document commands here.

## Output Requirements
1. Provide complete files with correct paths and imports.
2. Include What/Why, Acceptance Criteria, and Success Criteria when summarizing work.
3. CI must pass `pnpm -r build` locally before marking tasks done.
4. Docs/notes/todos belong only on `develop`; never add them to `main`.
