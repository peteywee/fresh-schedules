# Fresh Schedules — Master Copilot Project Pack (`*.place.*` edition)

> Single source of truth for Copilot to understand the entire repo, our
> guardrails, and the placeholder policy. Never commit secrets. Any
> hardcoded value becomes a placeholder and the file is tagged with
> `*.place.*` for visibility.

## 0. Objective (CEO KPI)

- After onboarding, a manager publishes a week’s schedule in under five minutes.
- Onboarding → first schedule in under fifteen minutes.

## 1. Stack & Layout (Locked)

- Frontend: Next.js 14 App Router, React 18, TypeScript 5, Tailwind CSS.
- API: Express (Node 20) with CORS and Pino logging.
- Data: Firebase Auth, Firestore, Messaging (FCM).
- Auth providers: Email Link and Google.
- Validation: Zod.
- Monorepo: pnpm workspaces:
  - `apps/web` (Next.js)
  - `services/api` (Express)
  - `packages/types` (shared schemas)
- CI: GitHub Actions on `main` and `develop`.
- Forbidden: Vite/CRA, Admin SDK in client code, secrets in the repo.

## 2. Branch Governance

- `main`: production only, docs blocked, CI must stay green.
- `develop`: active integration, docs blocked to protect production.
- `notes`: docs-only (Bibles, walkthroughs, guides, research, todos).

## 3. File Ending Rules (Strict)

- Bibles → `docs/bibles/*.bible.md`
- Walkthroughs → `docs/wt/*.wt.md`
- Guides → `docs/guides/*.guide.md`
- Research → `docs/research/*.r.md`
- Diagrams → `docs/diagrams/*.mermaid.md` or `*.drawio`
- Notes → `notes/*.note.md`, `*.scratch.md`, or `*.scratch.txt`
- Todos → `todos/*.todo.md`
- Docs are forbidden on `main` and `develop`; guard scripts and CI enforce this.

## 4. Placeholder Policy (`*.place.*`)

If a file contains hardcoded configuration, credentials, project IDs, API keys,
or tenant-specific constants:

1. Replace the value with `__PLACEHOLDER__` or read from the environment.
2. Rename the file to include `.place.` before the extension, for example:
   - `client.ts` → `client.place.ts`
   - `config.json` → `config.place.json`
3. Add a header comment:

   ```ts
   // PLACEHOLDER: Replace these values with environment variables or secrets.
   // Never commit real credentials. Follow .env.local.example guidance.
   ```

4. Add a matching entry to the “TODO: Replace placeholders” list.

## 5. Directories & Key Files (Authoritative)

- `apps/web/`
  - `app/page.tsx` — Home (links to Sign In / Dashboard)
  - `app/(auth)/signin/page.tsx` — Google + Email Link sign-in
  - `app/schedule/page.tsx` — Weekly schedule grid MVP
  - `src/components/app/schedule-calendar.tsx` — week grid UI
  - `src/components/app/hours-chart.tsx` — manager hours summary
  - `src/components/ui/*` — shadcn/ui primitives
  - `src/lib/env.ts` — Zod-validated client env loader
  - `src/lib/firebase/client.ts` — Client SDK init (no secrets)
  - `src/lib/messaging.ts` — FCM token + foreground listener
- `services/api/`
  - `src/index.ts` — Express app (health, `/api/shifts`)
  - `src/firebase.ts` — Admin SDK initialization using environment variables
  - `src/routes/shifts.ts` — Create shift (Zod validated); Firestore write TODO
- `packages/types/`
  - `src/index.ts` — Zod schemas: Org, Event, Shift, Timesheet
- `firestore.rules` — Org-scoped RBAC (admin, manager, staff)

## 6. Environment & Secrets

- Client: `NEXT_PUBLIC_FIREBASE_*` (validated in `env.ts`).
- Server: `FIREBASE_ADMIN_*`, `LEDGER_SALT` — never stored in the repo.
- Provide `.env.local.example` and `services/api/.env.example` with placeholders.

## 7. Acceptance Criteria (for Copilot output)

- Include What/Why summary at the top of each answer.
- Provide Acceptance Criteria and Success Criteria.
- Return complete files with paths and imports, compatible with pnpm.
- Never embed secrets; use placeholders and rename files with `.place.`.
- `pnpm -r build` passes locally and in CI for `develop`.
- UI output renders within Next.js.
- API output includes an endpoint description with a `curl` example.

## 8. Success Criteria (Sprint KPI)

- Manager creates five shifts across a week and publishes in five minutes.
- Staff sees shifts after publish and receives FCM notifications on changes.

## 9. Environment-Based Configuration

All placeholder files have been replaced with proper implementations:

- `services/api/src/firebase.ts` — Firebase Admin SDK initialized from environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
- `apps/web/src/lib/messaging.ts` — FCM registration with VAPID key from `NEXT_PUBLIC_FIREBASE_VAPID_KEY` environment variable.

No `.place.` files remain in the repository. All sensitive configuration is loaded from environment variables following security best practices.

## 10. Prompt Template (use in Copilot Chat)

```text
You are coding in Fresh Schedules (Next.js + Express + Firebase). Follow this
pack strictly.
Task: <describe feature>
Constraints: Next.js App Router, Firebase client only on web, Admin SDK only in
API.
Deliverables: full file contents with correct paths/imports.
Acceptance Criteria: <bullet list>
Success Criteria: <bullet list>
Never embed secrets. Use env or placeholders and rename the file with `.place.`.
```

## 11. Required Local & CI Steps (Enforcement)

1. Run the placeholder scanner before pushing to tag hardcoded config:

   ```bash
   chmod +x .zip/scan_and_tag_placeholders.sh
   .zip/scan_and_tag_placeholders.sh .
   ```

   - The scanner creates `.place.` copies and adds header comments. Move values
     into environment variables.

2. Install the pre-commit size guard locally (optional but recommended):

   ```bash
   chmod +x scripts/pre-commit-size-guard.sh
   ln -sf ../../scripts/pre-commit-size-guard.sh .git/hooks/pre-commit
   ```

3. CI must run these checks on PRs to `develop`:
   - `pnpm -w install --frozen-lockfile`
   - `pnpm -r --filter=... typecheck`
   - `scripts/pre-commit-size-guard.sh`
   - `node .zip/scan_and_tag_placeholders.sh .` to flag new `.place.` files

4. If placeholders remain, open a follow-up ticket to move values to env and to
   update the CI secret store.

## 12. Enforcement Checklist for Copilot Output

- Run the placeholder scanner and confirm no hardcoded secrets exist.
- Emit configuration with `.place.` suffix plus warning header if secrets are
  required.
- Keep docs on `develop` consistent with file-ending rules; drafts belong in
  `notes/`.
- When adding scripts that might create large files, update
  `scripts/pre-commit-size-guard.sh` patterns accordingly.
