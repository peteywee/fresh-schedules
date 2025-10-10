# Fresh Schedules — Master Copilot Project Pack (`*.place.*` edition)

> Single source of truth for Copilot to understand the **entire repo**, our **guardrails**, and the **placeholder policy**.  
> **DO NOT** commit secrets. Any hardcoded value becomes a placeholder and affected files are tagged with `*.place.*` for visibility.

## 0) Objective (CEO KPI)
- After onboarding, a manager must be able to build and publish a week’s schedule in **< 5 minutes**.
- Onboarding → first schedule in **< 15 minutes**.

## 1) Stack & Layout (LOCKED)
- Frontend: **Next.js 14 App Router**, React 18, TypeScript 5, Tailwind CSS
- API: **Express** (Node 20), CORS, Pino
- Data: **Firebase** — Auth, Firestore, Messaging (FCM)
- Auth providers: **Email Link**, **Google**
- Validation: **Zod**
- Monorepo: pnpm workspaces
  - `apps/web` (Next.js)
  - `services/api` (Express)
  - `packages/types` (Zod schemas)
- CI: GitHub Actions (`main`, `develop` only)
- Forbidden: Vite/CRA, Admin SDK in client, secrets in repo.

## 2) Branch/Governance
- `main`: production-only, docs blocked, green CI mandatory.
- `develop`: active integration, docs blocked.
- `notes`: docs-only (Bibles/WT/Guides/Notes/Todos).

## 3) File Ending Rules (STRICT)
- Bibles → `docs/bibles/*.bible.md`
- Walkthroughs → `docs/wt/*.wt.md`
- Guides → `docs/guides/*.guide.md`
- Research → `docs/research/*.r.md`
- Diagrams → `docs/diagrams/*.mermaid.md` / `*.drawio`
- Notes → `notes/*.note.md` / `*.scratch.md|*.scratch.txt`
- Todos → `todos/*.todo.md`
- Forbidden on `main`/`develop`. Enforced by guard scripts and CI.

## 4) Placeholder Policy — `*.place.*`
If any file contains **hardcoded** configuration, credentials, project IDs, API keys, endpoints, or tenant-specific constants:
1. **Replace the value** with `__PLACEHOLDER__` or an env read.
2. **Rename** the file to include `.place.` before the extension, e.g.  
   - `client.ts` → `client.place.ts`  
   - `config.json` → `config.place.json`
3. At the top of the file, include a comment block:
   ```
   // PLACEHOLDER: This file contains values that MUST be replaced via environment variables or secrets.
   // Do not commit real values. Follow .env.local.example and services/api/.env example.
   ```
4. Add a matching entry to `TODO: Replace placeholders` list in this pack.

## 5) Directories & Key Files (authoritative)
- `apps/web/`
  - `app/page.tsx` — Home (links to Sign In / Dashboard)
  - `app/(auth)/signin/page.tsx` — Google + Email Link sign-in
  - `app/schedule/page.tsx` — Weekly schedule grid (MVP)
  - `src/components/app/schedule-calendar.tsx` — week grid UI
  - `src/components/app/hours-chart.tsx` — manager hours summary
  - `src/components/ui/*` — shadcn ui primitives
  - `src/lib/env.ts` — Zod-validated client env
  - `src/lib/firebase/client.ts` — Client SDK init (no secrets)
  - `src/lib/messaging.ts` — FCM token + foreground listener
- `services/api/`
  - `src/index.ts` — Express app (health, /api/shifts)
  - `src/firebase.place.ts` — **Admin init placeholders** (MUST BE replaced by env)
  - `src/routes/shifts.ts` — create shift (zod-validated); TODO Firestore write
- `packages/types/`
  - `src/index.ts` — Zod schemas: Org, Event, Shift, Timesheet
- `firestore.rules` — Org-scoped RBAC (admin/manager/staff)

## 6) Environment & Secrets
- Client: `NEXT_PUBLIC_FIREBASE_*` (validated in `env.ts`).
- Server: `FIREBASE_ADMIN_*`, `LEDGER_SALT` — **never** in repo, only in env.
- Provide `.env.local.example` and `services/api/.env.example` with placeholders.

## 7) Acceptance Criteria (for any Copilot output)
- **What/Why** stated at top of each answer.
- Includes **Acceptance Criteria** and **Success Criteria**.
- Provides **complete files** (paths, imports), runnable with pnpm.
- No secrets. Any hardcoded config → placeholder + `.place.` rename.
- `pnpm -r build` passes locally and in CI for `develop`.
- If UI: route renders in Next.js.
- If API: endpoint documented with example curl.

## 8) Success Criteria (sprint KPI)
- Manager creates 5 shifts across a week and publishes in **≤ 5 minutes**.
- Staff sees shifts after publish; receives FCM when schedule changes.

## 9) TODO: Replace placeholders
- `services/api/src/firebase.place.ts` — initialize Admin SDK from env
- Optional: `apps/web/src/lib/messaging.place.ts` VAPID key source if we separate

## 10) Prompt Template (use inside Copilot Chat)
```
You are coding in Fresh Schedules (Next.js + Express + Firebase). Follow THIS PACK strictly.
Task: <describe feature>
Constraints: Next.js App Router, Firebase client only on web, Admin SDK only in API.
Deliverables: full file contents with correct paths/imports.
Acceptance Criteria: <bullet list>
Success Criteria: <bullet list>
NEVER embed secrets. Use env or placeholders and rename file with `.place.`.
```
## 11) Required local & CI steps (enforcement)

1. Run the placeholder scanner to tag any file with hardcoded config before pushing:

  ```bash
  chmod +x .zip/scan_and_tag_placeholders.sh
  .zip/scan_and_tag_placeholders.sh .
  ```

  - The scanner will create `.place.` copies and add a header comment. Review and move values to env.

2. Install the pre-commit size guard locally (optional but recommended):

  ```bash
  chmod +x scripts/pre-commit-size-guard.sh
  ln -sf ../../scripts/pre-commit-size-guard.sh .git/hooks/pre-commit
  ```

3. CI must run these checks on PRs to `develop`:
  - `pnpm -w install --frozen-lockfile`
  - `pnpm -r --filter=... typecheck` (workspace typecheck)
  - Run `scripts/pre-commit-size-guard.sh` in CI to block large files
  - Run `node .zip/scan_and_tag_placeholders.sh .` and fail the PR if new `.place.` files are not reviewed

4. If placeholders are detected, create a follow-up ticket to replace the placeholders with env variables and move secrets to the CI secret store.

## 12) Enforcement Checklist for Copilot outputs

- Always run the placeholder scanner and ensure no hardcoded secrets exist in generated files.
- If you generate configuration or credentials, emit the file as `.place.` and include the header comment.
- All docs generated for `develop` or `main` must use the file-ending rules; otherwise output a `notes/*.note.md` variant for drafts.
- When adding new scripts that can create large files, also add a matching entry to `scripts/pre-commit-size-guard.sh` patterns.
