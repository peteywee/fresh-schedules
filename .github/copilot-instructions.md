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

— End of rules —

## File Ending Rules (STRICT)

- Project Bibles → `*.bible.md` in `docs/bibles/`
- Walkthroughs → `*.wt.md` in `docs/wt/`
- Guides → `*.guide.md` in `docs/guides/`
- Research → `*.r.md` in `docs/research/`
- Diagrams → `*.mermaid.md` / `*.drawio` in `docs/diagrams/`
- Notes → `*.note.md` / `*.scratch.md` / `*.scratch.txt` in `notes/`
- To-Dos → `*.todo.md` in `todos/`

Forbidden generic endings on `main` and `develop`: `*.md`, `*.txt`, `*.docx` unless the file matches the specific allowed patterns above. Only `README.md` and `CHANGELOG.md` are allowed on code branches.

If generating documentation programmatically, ensure filenames and paths match the allowed patterns exactly. Any violation should be rejected by the guard script.

## Suggestions & Recommended Actions

- Always install SDKs outside the repository (recommended path: `$HOME/google-cloud-sdk`). Do NOT unpack archives into the repository working tree.
- Keep lockfiles (e.g., `pnpm-lock.yaml`) committed and use `pnpm install --frozen-lockfile` in CI for deterministic builds.
- Add a pre-commit guard (example provided in `scripts/pre-commit-size-guard.sh`) to block large staged files and common SDK archives.
- For transient large files, prefer `git lfs` or an external artifact store rather than committing binaries to code branches.
- Documentation that must land on `develop` or `main` should follow the strict file-ending rules above; use the `notes` branch for drafts and working notes.

Example pre-commit installation:

```bash
chmod +x scripts/pre-commit-size-guard.sh
ln -sf ../../scripts/pre-commit-size-guard.sh .git/hooks/pre-commit
```

If you want me to: I can commit the guard script and the docs to `develop` and create a PR, or instead create a `notes` branch for in-progress docs. Ask and I'll proceed.
