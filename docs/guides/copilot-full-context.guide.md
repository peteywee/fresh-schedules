# Copilot Full Context Book (.place.)

> Generated from repo: `/home/patrick/fresh-schedules/fresh-root` on 2025-10-09T13:59:51.869Z
> This file inlines the file tree and text-file contents (masked), for Copilot to read as a single source.
> Any literals that look like secrets/config are replaced with __PLACEHOLDER__.

## Important
- Do **not** commit real secrets.
- Treat this file as documentation. Keep under version control on the **notes** branch if needed.

## File Tree (filtered)

```
.github/copilot-instructions.md
.github/workflows/ci.yml
.github/workflows/guard-content.yml
.vscode/tasks.json
.zip/CopilotProjectPack.place.md
.zip/copilot-instructions.compiled.place.md
README.md
addon/CONTEXT_README.place.md
addon/build_copilot_context.mjs
addon/tmp/CONTEXT_README.place.md
addon/tmp/build_copilot_context.mjs
apps/web/app/layout.tsx
apps/web/app/page.tsx
apps/web/app/schedule/page.tsx
apps/web/next-env.d.ts
apps/web/next.config.js
apps/web/package.json
apps/web/pages/_app.tsx
apps/web/pages/_document.tsx
apps/web/tsconfig.json
build_copilot_context.mjs
docs/FIREBASE_SETUP.md
docs/REPO_CLEANUP.md
docs/guides/copilot-project-pack.guide.md
docs/guides/prevent-large-files.guide.md
docs/guides/repo-cleanup.guide.md
firestore.indexes.json
firestore.rules
functions/.eslintrc.js
functions/package-lock.json
functions/package.json
functions/src/index.ts
functions/tsconfig.dev.json
functions/tsconfig.json
package.json
packages/types/package.json
packages/types/src/index.ts
pnpm-lock.yaml
pnpm-workspace.yaml
scripts/new-doc.mjs
services/api/package.json
services/api/src/index.ts
services/api/tsconfig.json
```

### .github/copilot-instructions.md

```md
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

```

### .github/workflows/ci.yml

```yml
name: CI
on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main", "develop"]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

```

### .github/workflows/guard-content.yml

```yml
name: Guard Main Content
on:
  pull_request:
    branches: ["main"]
jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Reject docs/notes/todos on main
        run: bash scripts/guard-main.sh main

```

### .vscode/tasks.json

```json
{
  "version": "2.0.0",
  "inputs": [
    {
      "id": "doctype",
      "type": "pickString",
      "description": "Choose document type",
      "options": ["bible", "wt", "guide", "research", "note", "todo", "scratch", "mermaid"],
      "default": "note"
    },
    {
      "id": "slug",
      "type": "promptString",
      "description": "Slug (kebab-case)",
      "default": "new-item"
    }
  ],
  "tasks": [
    { "label": "dev:web", "type": "shell", "command": "pnpm dev:web", "isBackground": true },
    { "label": "dev:api", "type": "shell", "command": "pnpm dev:api", "isBackground": true },
    { "label": "build", "type": "shell", "command": "pnpm build" },
    { "label": "typecheck", "type": "shell", "command": "pnpm typecheck" },
    { "label": "lint", "type": "shell", "command": "pnpm lint" },
    { "label": "test", "type": "shell", "command": "pnpm test" },
    { "label": "New Doc", "type": "shell", "command": "node scripts/new-doc.mjs ${input:doctype} ${input:slug}" }
  ]
}

```

### .zip/CopilotProjectPack.place.md

```md
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

```

### .zip/copilot-instructions.compiled.place.md

```md
# .github/copilot-instructions.md (compiled, reference)

- Framework: Next.js 14 App Router, React 18, TypeScript 5, Tailwind
- API: Express (Node 20), CORS, Pino
- Firebase: Auth, Firestore, Messaging; Providers: Email Link, Google
- Validation: Zod; Monorepo with pnpm
- Branches: main (prod), develop (active), notes (docs)
- File Ending Rules: strict (see Master Pack).
- Placeholder Policy: any hardcoded config => replace with __PLACEHOLDER__, rename file with `.place.` and add header comment.
- Output Rules:
  1) Complete files with paths/imports
  2) What/Why at top
  3) Acceptance & Success Criteria
  4) TODO when follow-ups exist
  5) No Vite/CRA; no secrets; Admin only on server
  6) Provide run steps (pnpm)
- Definition of Done:
  - pnpm -r build passes in CI (develop)
  - Routes render; endpoints respond; env validated
```

### README.md

```md
# Fresh Schedules

Compliance-first staff scheduling PWA (Top Shelf Service LLC).

## Branch policy
- **main**: production code only (protected, green CI required)
- **develop**: active integration (no docs/notes/todos)
- **notes**: personal docs/bibles/walkthroughs/research/todos

## Objective (CEO KPI)
- Onboarding → published first schedule: < 15 minutes
- Routine weekly scheduling after onboarding: **< 5 minutes**

See `.github/copilot-instructions.md` for repo-wide AI rules.

```

### addon/CONTEXT_README.place.md

```md

# Copilot Full Context Tools (.place.)

This toolkit lets you generate a **single markdown file** that contains:
- a filtered file tree of your repo
- the **inline contents** of **all text files** (masked for secrets)
- ready for Copilot to read without copy/paste sprawl

## Files
- `build_copilot_context.mjs` — Node script that walks your repo and builds **CopilotFullContext.place.md**
- `run_build_copilot_context.sh` — shell wrapper

## Usage
From your repo root:
```bash
# Copy these two files into your repo, then run:
bash run_build_copilot_context.sh .
# Output:
#   CopilotFullContext.place.md
```

The output is tagged `.place.` and replaces anything that looks like a secret/config with `__PLACEHOLDER__`.

## Notes
- Excluded directories: `.git`, `node_modules`, `.next`, `dist`, `build`, `coverage`, `.cache`, `.pnpm-store`, `.turbo`
- Per-file cap: 200KB (configurable in the script)
- Text file types included: md, txt, ts, tsx, js, jsx, json, yml, yaml, css, scss, html, rules, mjs, cjs, env, gitignore, editorconfig, prettierrc, eslintrc, tsconfig, npmrc.

```

### addon/build_copilot_context.mjs

```mjs

#!/usr/bin/env node
/**
 * build_copilot_context.mjs
 * Generate a single markdown file that encodes the repo:
 * - file tree
 * - per-file content (text files), fenced with path annotations
 * - masks secrets and hardcoded Firebase config into __PLACEHOLDER__
 * - tags output as *.place.*
 *
 * Usage:
 *   node build_copilot_context.mjs [repoRoot] [outputFile]
 * Example:
 *   node build_copilot_context.mjs . CopilotFullContext.place.md
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const repoRoot = path.resolve(process.argv[2] || '.');
const outFile = path.resolve(process.argv[3] || 'CopilotFullContext.place.md');

const EXCLUDE_DIRS = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.cache', '.pnpm-store', '.turbo'
]);

const TEXT_EXTS = new Set([
  '.md','.txt','.ts','.tsx','.js','.jsx','.json','.yml','.yaml','.css','.scss','.html','.rules','.mjs','.cjs','.env','.gitignore','.editorconfig','.prettierrc','.eslintrc','.tsconfig','.npmrc'
]);

const MAX_BYTES_PER_FILE = 200_000; // 200KB per file cap

const secretPatterns = [
  /apiKey:\s*['"]AIza[0-9A-Za-z_\-]+['"]/g,
  /appId:\s*['"]1:[0-9]+:web:[0-9a-fA-F]+['"]/g,
  /projectId:\s*['"][a-z0-9\-]+['"]/g,
  /authDomain:\s*['"][^'"]+firebaseapp\.com['"]/g,
  /messagingSenderId:\s*['"][0-9]+['"]/g,
  /\bFIREBASE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\bGOOGLE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\b[A-Za-z0-9_]*SECRET[A-Za-z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g
];

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXTS.has(ext)) return true;
  // fallback for dotfiles
  if (!ext && filePath.startsWith('.')) return true;
  return false;
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function maskSecrets(content) {
  let out = content;
  for (const re of secretPatterns) {
    out = out.replaceAll(re, (m) => {
      const hash = crypto.createHash('sha256').update(m).digest('hex').slice(0, 8);
      return m.replace(/:['"]?.*?['"]?$/, `: "__PLACEHOLDER__/*${hash}*/"`);
    });
  }
  return out;
}

function rel(p) {
  return path.relative(repoRoot, p) || '.';
}

function header() {
  return `# Copilot Full Context Book (.place.)\n\n` +
  `> Generated from repo: \`${repoRoot}\` on ${new Date().toISOString()}\n` +
  `> This file inlines the file tree and text-file contents (masked), for Copilot to read as a single source.\n` +
  `> Any literals that look like secrets/config are replaced with __PLACEHOLDER__.\n\n` +
  `## Important\n- Do **not** commit real secrets.\n- Treat this file as documentation. Keep under version control on the **notes** branch if needed.\n\n`;
}

function fileTree(files) {
  const lines = files.map(f => rel(f)).sort();
  return "## File Tree (filtered)\n\n```\n" + lines.join('\n') + "\n```\n\n";
}

function sectionForFile(file) {
  const r = rel(file);
  let data = fs.readFileSync(file);
  if (data.length > MAX_BYTES_PER_FILE) {
    data = data.slice(0, MAX_BYTES_PER_FILE);
  }
  let content = data.toString('utf-8');
  content = maskSecrets(content);
  const ext = path.extname(file).toLowerCase().replace(/^\./,'');
  const fence = ext || 'txt';
  return `### ${r}\n\n\`\`\`${fence}\n${content}\n\`\`\`\n\n`;
}

function main() {
  const all = Array.from(walk(repoRoot));
  const textFiles = all.filter(isTextFile);

  let md = header();
  md += fileTree(textFiles);

  for (const f of textFiles) {
    md += sectionForFile(f);
  }

  fs.writeFileSync(outFile, md, 'utf-8');
  console.log(`Wrote ${outFile}`);
}

main();

```

### addon/tmp/CONTEXT_README.place.md

```md

# Copilot Full Context Tools (.place.)

This toolkit lets you generate a **single markdown file** that contains:
- a filtered file tree of your repo
- the **inline contents** of **all text files** (masked for secrets)
- ready for Copilot to read without copy/paste sprawl

## Files
- `build_copilot_context.mjs` — Node script that walks your repo and builds **CopilotFullContext.place.md**
- `run_build_copilot_context.sh` — shell wrapper

## Usage
From your repo root:
```bash
# Copy these two files into your repo, then run:
bash run_build_copilot_context.sh .
# Output:
#   CopilotFullContext.place.md
```

The output is tagged `.place.` and replaces anything that looks like a secret/config with `__PLACEHOLDER__`.

## Notes
- Excluded directories: `.git`, `node_modules`, `.next`, `dist`, `build`, `coverage`, `.cache`, `.pnpm-store`, `.turbo`
- Per-file cap: 200KB (configurable in the script)
- Text file types included: md, txt, ts, tsx, js, jsx, json, yml, yaml, css, scss, html, rules, mjs, cjs, env, gitignore, editorconfig, prettierrc, eslintrc, tsconfig, npmrc.

```

### addon/tmp/build_copilot_context.mjs

```mjs
#!/usr/bin/env node
/**
 * build_copilot_context.mjs
 * Generate a single markdown file that encodes the repo:
 * - file tree
 * - per-file content (text files), fenced with path annotations
 * - masks secrets and hardcoded Firebase config into __PLACEHOLDER__
 * - tags output as *.place.*
 *
 * Usage:
 *   node build_copilot_context.mjs [repoRoot] [outputFile]
 * Example:
 *   node build_copilot_context.mjs . CopilotFullContext.place.md
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const repoRoot = path.resolve(process.argv[2] || '.');
const outFile = path.resolve(process.argv[3] || 'CopilotFullContext.place.md');

const EXCLUDE_DIRS = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.cache', '.pnpm-store', '.turbo'
]);

const TEXT_EXTS = new Set([
  '.md','.txt','.ts','.tsx','.js','.jsx','.json','.yml','.yaml','.css','.scss','.html','.rules','.mjs','.cjs','.env','.gitignore','.editorconfig','.prettierrc','.eslintrc','.tsconfig','.npmrc'
]);

const MAX_BYTES_PER_FILE = 200_000; // 200KB per file cap

const secretPatterns = [
  /apiKey:\s*['"]AIza[0-9A-Za-z_\-]+['"]/g,
  /appId:\s*['"]1:[0-9]+:web:[0-9a-fA-F]+['"]/g,
  /projectId:\s*['"][a-z0-9\-]+['"]/g,
  /authDomain:\s*['"][^'"]+firebaseapp\.com['"]/g,
  /messagingSenderId:\s*['"][0-9]+['"]/g,
  /\bFIREBASE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\bGOOGLE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\b[A-Za-z0-9_]*SECRET[A-Za-z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g
];

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXTS.has(ext)) return true;
  // fallback for dotfiles
  if (!ext && filePath.startsWith('.')) return true;
  return false;
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function maskSecrets(content) {
  let out = content;
  for (const re of secretPatterns) {
    out = out.replaceAll(re, (m) => {
      const hash = crypto.createHash('sha256').update(m).digest('hex').slice(0, 8);
      return m.replace(/:['"]?.*?['"]?$/, `: "__PLACEHOLDER__/*${hash}*/"`);
    });
  }
  return out;
}

function rel(p) {
  return path.relative(repoRoot, p) || '.';
}

function header() {
  return `# Copilot Full Context Book (.place.)\n\n` +
  `> Generated from repo: \`${repoRoot}\` on ${new Date().toISOString()}\n` +
  `> This file inlines the file tree and text-file contents (masked), for Copilot to read as a single source.\n` +
  `> Any literals that look like secrets/config are replaced with __PLACEHOLDER__.\n\n` +
  `## Important\n- Do **not** commit real secrets.\n- Treat this file as documentation. Keep under version control on the **notes** branch if needed.\n\n`;
}

function fileTree(files) {
  const lines = files.map(f => rel(f)).sort();
  return "## File Tree (filtered)\n\n```\n" + lines.join('\n') + "\n```\n\n";
}

function sectionForFile(file) {
  const r = rel(file);
  let data = fs.readFileSync(file);
  if (data.length > MAX_BYTES_PER_FILE) {
    data = data.slice(0, MAX_BYTES_PER_FILE);
  }
  let content = data.toString('utf-8');
  content = maskSecrets(content);
  const ext = path.extname(file).toLowerCase().replace(/^\./,'');
  const fence = ext || 'txt';
  return `### ${r}\n\n\`\`\`${fence}\n${content}\n\`\`\`\n\n`;
}

function main() {
  const all = Array.from(walk(repoRoot));
  const textFiles = all.filter(isTextFile);

  let md = header();
  md += fileTree(textFiles);

  for (const f of textFiles) {
    md += sectionForFile(f);
  }

  fs.writeFileSync(outFile, md, 'utf-8');
  console.log(`Wrote ${outFile}`);
}

main();

```

### apps/web/app/layout.tsx

```tsx
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Fresh Schedules',
  description: 'Scheduling PWA',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

```

### apps/web/app/page.tsx

```tsx
export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Fresh Schedules</h1>
      <p>App skeleton is live.</p>
    </main>
  );
}

```

### apps/web/app/schedule/page.tsx

```tsx
export const metadata = { title: 'Schedule' };
export default function SchedulePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Schedule</h1>
      <p>Placeholder route is present and valid.</p>
    </main>
  );
}

```

### apps/web/next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

```

### apps/web/next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;

```

### apps/web/package.json

```json
{
  "name": "@apps/web",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/node": "20.11.30",
    "@types/react": "18.2.64",
    "typescript": "5.5.4"
  }
}

```

### apps/web/pages/_app.tsx

```tsx
import type { AppProps } from 'next/app';
export default function AppWrapper({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

```

### apps/web/pages/_document.tsx

```tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

```

### apps/web/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "jsx": "preserve",
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "types": [
      "node"
    ],
    "allowJs": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

### build_copilot_context.mjs

```mjs
#!/usr/bin/env node
/**
 * build_copilot_context.mjs
 * Generate a single markdown file that encodes the repo:
 * - file tree
 * - per-file content (text files), fenced with path annotations
 * - masks secrets and hardcoded Firebase config into __PLACEHOLDER__
 * - tags output as *.place.*
 *
 * Usage:
 *   node build_copilot_context.mjs [repoRoot] [outputFile]
 * Example:
 *   node build_copilot_context.mjs . CopilotFullContext.place.md
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const repoRoot = path.resolve(process.argv[2] || '.');
const outFile = path.resolve(process.argv[3] || 'CopilotFullContext.place.md');

const EXCLUDE_DIRS = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.cache', '.pnpm-store', '.turbo'
]);

const TEXT_EXTS = new Set([
  '.md','.txt','.ts','.tsx','.js','.jsx','.json','.yml','.yaml','.css','.scss','.html','.rules','.mjs','.cjs','.env','.gitignore','.editorconfig','.prettierrc','.eslintrc','.tsconfig','.npmrc'
]);

const MAX_BYTES_PER_FILE = 200_000; // 200KB per file cap

const secretPatterns = [
  /apiKey:\s*['"]AIza[0-9A-Za-z_\-]+['"]/g,
  /appId:\s*['"]1:[0-9]+:web:[0-9a-fA-F]+['"]/g,
  /projectId:\s*['"][a-z0-9\-]+['"]/g,
  /authDomain:\s*['"][^'"]+firebaseapp\.com['"]/g,
  /messagingSenderId:\s*['"][0-9]+['"]/g,
  /\bFIREBASE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\bGOOGLE_[A-Z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g,
  /\b[A-Za-z0-9_]*SECRET[A-Za-z0-9_]*\s*=\s*['"][^'"]{8,}['"]/g
];

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXTS.has(ext)) return true;
  // fallback for dotfiles
  if (!ext && filePath.startsWith('.')) return true;
  return false;
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function maskSecrets(content) {
  let out = content;
  for (const re of secretPatterns) {
    out = out.replaceAll(re, (m) => {
      const hash = crypto.createHash('sha256').update(m).digest('hex').slice(0, 8);
      return m.replace(/:['"]?.*?['"]?$/, `: "__PLACEHOLDER__/*${hash}*/"`);
    });
  }
  return out;
}

function rel(p) {
  return path.relative(repoRoot, p) || '.';
}

function header() {
  return `# Copilot Full Context Book (.place.)\n\n` +
  `> Generated from repo: \`${repoRoot}\` on ${new Date().toISOString()}\n` +
  `> This file inlines the file tree and text-file contents (masked), for Copilot to read as a single source.\n` +
  `> Any literals that look like secrets/config are replaced with __PLACEHOLDER__.\n\n` +
  `## Important\n- Do **not** commit real secrets.\n- Treat this file as documentation. Keep under version control on the **notes** branch if needed.\n\n`;
}

function fileTree(files) {
  const lines = files.map(f => rel(f)).sort();
  return "## File Tree (filtered)\n\n```\n" + lines.join('\n') + "\n```\n\n";
}

function sectionForFile(file) {
  const r = rel(file);
  let data = fs.readFileSync(file);
  if (data.length > MAX_BYTES_PER_FILE) {
    data = data.slice(0, MAX_BYTES_PER_FILE);
  }
  let content = data.toString('utf-8');
  content = maskSecrets(content);
  const ext = path.extname(file).toLowerCase().replace(/^\./,'');
  const fence = ext || 'txt';
  return `### ${r}\n\n\`\`\`${fence}\n${content}\n\`\`\`\n\n`;
}

function main() {
  const all = Array.from(walk(repoRoot));
  const textFiles = all.filter(isTextFile);

  let md = header();
  md += fileTree(textFiles);

  for (const f of textFiles) {
    md += sectionForFile(f);
  }

  fs.writeFileSync(outFile, md, 'utf-8');
  console.log(`Wrote ${outFile}`);
}

main();

```

### docs/FIREBASE_SETUP.md

```md
Firebase & GCP setup notes

This document lists the recommended quick steps to configure Firebase and
Google Cloud for local development and CI for this repository.

1) Install CLIs

 - gcloud (Google Cloud SDK): https://cloud.google.com/sdk/docs/install
 - firebase-tools: npm i -g firebase-tools
 - google-github-actions/auth for GitHub workflows

2) Choose/create a GCP project

Pick an existing project or create one:

  gcloud projects create <PROJECT_ID> --name="Fresh Schedules dev"

3) Enable APIs

  gcloud services enable firebase.googleapis.com firestore.googleapis.com

4) Firebase initialization (in repo root)

  firebase login
  firebase init

Select: Firestore, Hosting (if using), Functions (if you plan serverless functions)

5) Create a CI service account (do NOT commit the key)

  gcloud iam service-accounts create ci-deployer --display-name="CI deployer"
  gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/firebase.admin"

  gcloud iam service-accounts keys create gcp-sa-key.json --iam-account=ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com

Store the contents of gcp-sa-key.json in your CI provider's secure secrets store.

6) GitHub Actions example (snippet)

  - name: Authenticate to GCP
    uses: google-github-actions/auth@v1
    with:
      credentials_json: ${{ secrets.GCP_SA_KEY }}

7) Firestore rules

This repo includes `firestore.rules`. Use `firebase deploy --only firestore:rules` to upload rules.

8) Security

 - Never commit service account JSON to the repository.
 - Use environment variables and GitHub secrets for credentials in CI.

9) Notes

If you'd like, I can:
 - Add a `firebase.json` and `.firebaserc` starter file (non-sensitive) into the repo.
 - Add a GitHub Actions job template to authenticate with a service account secret.

```

### docs/REPO_CLEANUP.md

```md
REPO CLEANUP
=============

What I removed
---------------
- `google-cloud-sdk/` (local SDK install inside the repo)
- `google-cloud-sdk-433.0.0-linux-x86_64.tar.gz` (SDK archive)
- workspace `node_modules/` directories (top-level and package/node_modules)
- `services/api/dist/` build output

Why
---
These files are large, generated, or easily re-created. Keeping them in the repository working tree caused a huge number of untracked files and excessive disk usage. They should be kept outside the repo or reinstalled as needed.

How to recreate
---------------
- google-cloud-sdk:
  1. Download the SDK from https://cloud.google.com/sdk/docs/install (or run the installer script).
  2. Install it outside the repository, for example:

     mkdir -p "$HOME/google-cloud-sdk"
     tar -xzf google-cloud-sdk-433.0.0-linux-x86_64.tar.gz -C "$HOME/google-cloud-sdk" --strip-components=1

  3. Run the included installer and initialize with `gcloud init`.

- node_modules:
  1. From the repository root run `pnpm install` (pnpm is used for this monorepo).
  2. To restore specific package dependencies, run `pnpm --filter <package> install`.

- services/api/dist:
  1. Rebuild with `pnpm -w -F services/api build` or run the project's build script per `package.json`.

Recommendations
---------------
- Do not install SDKs inside the repository. Use `~/google-cloud-sdk` or a system-level installation.
- Keep lockfiles (`pnpm-lock.yaml`) tracked (they are already committed).
- Consider adding a pre-commit check to block very large files or to warn when adding SDK archives.

Notes
-----
- I intentionally did NOT remove `.env.local` even though it was listed in the dry-run. Keep secrets out of version control.

```

### docs/guides/copilot-project-pack.guide.md

```md
```markdown
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

```

```

### docs/guides/prevent-large-files.guide.md

```md
# Preventing Large Files and SDKs in the Repo

This guide shows how to avoid accidentally committing large files, SDK archives, and `node_modules` into the repository.

Quick setup
-----------
1. Install the provided guard script as a Git pre-commit hook:

   ```bash
   chmod +x scripts/pre-commit-size-guard.sh
   ln -sf ../../scripts/pre-commit-size-guard.sh .git/hooks/pre-commit
   ```

2. (Optional) Install Husky and register the script in package.json hooks for the monorepo.

Why
---
Large archives and SDKs belong outside the repository. They increase clone size and produce many untracked files. The guard prevents common mistakes by blocking staged files over 5MB and common patterns like `*.tar.gz`, `*.zip`, `google-cloud-sdk*`, and any path containing `node_modules`.

Recreating removed artifacts
---------------------------
- Google Cloud SDK: Install to `$HOME/google-cloud-sdk` per the official docs.
- node_modules: Run `pnpm install` at repo root.

If you need to temporarily commit a large file (rare):
- Use `git lfs` for large binary assets, or
- Override locally with `MAX_BYTES=<bytes> git commit` (not recommended for team commits).

```

### docs/guides/repo-cleanup.guide.md

```md
# Repository Cleanup Guide

This guide documents what was removed from the working tree, why, and how to recreate the artifacts that were deleted.

What was removed
----------------
- `google-cloud-sdk/` (local SDK install inside the repository)
- `google-cloud-sdk-433.0.0-linux-x86_64.tar.gz` (SDK archive)
- workspace and package `node_modules/` (apps/web, functions, packages/types, services/api)
- `services/api/dist/` build output

Why
---
These files are large and generated; they do not belong in version control. They caused a large number of untracked files and excessive disk usage in the repo working tree. Keeping SDKs or large archives inside the repository is error-prone.

How to recreate
---------------
- google-cloud-sdk:
  1. Download and install the Google Cloud SDK outside the repository (recommended path: `$HOME/google-cloud-sdk`).
  2. Initialize with `gcloud init` and authenticate.

- node_modules:
  1. From the repository root run `pnpm install` to restore dependencies.
  2. To install only a package workspace: `pnpm --filter <package> install`.

- services/api/dist:
  1. Rebuild with the project's build script: `pnpm -w -F services/api build`.

Recommendations
---------------
- Move SDK installations out of the repository. Use `$HOME/google-cloud-sdk` or install system-wide.
- Keep lockfiles (`pnpm-lock.yaml`) tracked.
- Add a pre-commit hook to block adding archives or large files into the repo.

Notes
-----
- `.env.local` was intentionally NOT removed. Keep secrets and env files out of version control.

```

### firestore.indexes.json

```json
{
  "indexes": [],
  "fieldOverrides": []
}
```

### firestore.rules

```rules
/**
 * This file contains Firestore security rules; to avoid the JavaScript/TypeScript compiler trying to parse Firestore-specific keywords
 * (like `service` and `match`) when this file is included in a JS build, export the rules as a template string.
 *
 * Note: Keep this file as-is for local editing, but use your deployment process to feed the raw string into the Firebase CLI or CI job.
 */

module.exports = `
/**
 * @fileoverview Firestore Security Rules for Fresh Schedules.
 *
 * Core Philosophy: This ruleset enforces a strict ownership model for user data and a role-based model for corporations and organizations.  Administrative access is granted through a dedicated \`/roles_admin/{userId}\` collection.  All write operations require authentication, and access is controlled based on user roles and explicit relationships defined in the data.
 *
 * Data Structure:
 * - /corporations/{corporationId}: Stores corporation data, with 'adminId' indicating the administrator.
 * - /organizations/{organizationId}: Stores organization data, linked to a corporation or standalone, with 'managerId' indicating the manager.
 * - /users/{userId}: Stores user data.
 * - /invites/{inviteId}: Stores invite data for onboarding.
 * - /organizations/{organizationId}/schedules/{scheduleId}: Stores schedules for an organization.
 * - /organizations/{organizationId}/schedules/{scheduleId}/shifts/{shiftId}: Stores shifts for a schedule.
 * - /organizations/{organizationId}/messages/{messageId}: Stores messages within an organization.
 * - /roles_admin/{userId}: Stores UIDs of admin users.
 *
 * Key Security Decisions:
 * - User listing is disabled.
 * - Strict ownership is enforced for user documents and subcollections.
 * - Administrative privileges are granted via the \`/roles_admin/{userId}\` collection.
 * - Invites are used for onboarding, and a Cloud Function is recommended to validate invites during user registration.
 *
 * Denormalization for Authorization:
 * - The \`schedules\` collection under an organization includes a denormalized \`members\` field. This avoids \`get()\` calls in security rules.
 *
 * Structural Segregation:
 * - Private user data is stored under \`/users/{userId}\`, while organization and corporation data are stored in top-level collections.
 */
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper Functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return exists(/databases/$(database)/documents/roles_admin/$(request.auth.uid));
    }

    function isExistingOwner(userId) {
        return isOwner(userId) && resource != null;
    }

    /**
     * @description Rule for managing admin roles. Only admins can create admin roles.
     * @path /roles_admin/{userId}
     * @allow (create) - An admin user can create an admin role document for any user.
     *   Request: auth.uid = 'admin_user_id'
     *            resource.data.uid = 'new_admin_user_id'
     * @deny (create) - A non-admin user attempts to create an admin role document.
     *   Request: auth.uid = 'regular_user_id'
     *            resource.data.uid = 'new_admin_user_id'
     * @principle Enforces role-based access control for administrative privileges.
     */
    match /roles_admin/{userId} {
      allow get: if isAdmin();
      allow list: if false;

      allow create: if isAdmin();
      allow update: if false;
      allow delete: if isAdmin();
    }

    /**
     * @description Rule for managing corporation data. Only authenticated users can create corporations,
     *              and only the admin can update or delete.
     * @path /corporations/{corporationId}
     * @allow (create) - An authenticated user can create a new corporation.
     *   Request: auth.uid = 'user_abc'
     *            resource.data.adminId = 'user_abc'
     * @allow (get, list) - Any authenticated user can retrieve corporation data.
     *   Request: auth.uid = 'user_xyz'
     * @deny (update) - A non-admin user attempts to update a corporation.
     *   Request: auth.uid = 'user_xyz'
     *            resource.data.name = 'Updated Corporation Name'
     * @principle Enforces ownership for corporation management.
     */
    match /corporations/{corporationId} {
      allow get, list: if true;

      allow create: if isSignedIn() && request.resource.data.adminId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.adminId == request.auth.uid && resource != null;
      allow delete: if isSignedIn() && resource.data.adminId == request.auth.uid && resource != null;
    }

    /**
     * @description Rule for managing organization data. Only authenticated users can create organizations,
     *              and only the manager can update or delete.
     * @path /organizations/{organizationId}
     * @allow (create) - An authenticated user can create a new organization.
     *   Request: auth.uid = 'user_abc'
     *            resource.data.managerId = 'user_abc'
     * @allow (get, list) - Any authenticated user can retrieve organization data.
     *   Request: auth.uid = 'user_xyz'
     * @deny (update) - A non-manager user attempts to update an organization.
     *   Request: auth.uid = 'user_xyz'
     *            resource.data.name = 'Updated Organization Name'
     * @principle Enforces ownership for organization management.
     */
    match /organizations/{organizationId} {
      allow get, list: if true;

      allow create: if isSignedIn() && request.resource.data.managerId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.managerId == request.auth.uid && resource != null;
      allow delete: if isSignedIn() && resource.data.managerId == request.auth.uid && resource != null;
    }

    /**
     * @description Rule for managing user data. Users can only access their own data.
     * @path /users/{userId}
     * @allow (create) - A user can create their own user document.
     *   Request: auth.uid = 'user_abc'
     *            resource.data.id = 'user_abc'
     * @allow (get) - A user can retrieve their own user document.
     *   Request: auth.uid = 'user_abc'
     * @deny (update) - A user attempts to update another user's document.
     *   Request: auth.uid = 'user_xyz'
     *            resource.data.firstName = 'Updated Name'
     * @principle Enforces strict user-ownership for accessing user data.
     */
    match /users/{userId} {
      allow get: if isOwner(userId);
      allow list: if false;

      allow create: if isOwner(userId) && request.resource.data.id == request.auth.uid;
      allow update: if isExistingOwner(userId) && (request.resource.data.id == resource.data.id);
      allow delete: if isExistingOwner(userId);
    }

    /**
     * @description Rule for managing invite data. No write access granted.
     * @path /invites/{inviteId}
     * @allow (get) - Any authenticated user can read invite data.
     *   Request: auth.uid = 'user_abc'
     * @deny (create) - No one can create invites through direct Firestore writes.
     *   Request: auth.uid = 'user_xyz'
     *            resource.data.token = 'some_token'
     * @principle Read-only access to invite data. Invite creation should be handled server-side.
     */
    match /invites/{inviteId} {
      allow get, list: if true;

      allow create: if false;
      allow update: if false;
      allow delete: if false;
    }

    /**
     * @description Rule for managing schedule data within an organization.  Schedule management is restricted to authenticated users.
     * @path /organizations/{organizationId}/schedules/{scheduleId}
     * @allow (create) - An authenticated user can create a schedule.
     *   Request: auth.uid = 'user_abc'
     *            resource.data.organizationId = 'org123'
     * @allow (get, list) - Any authenticated user can retrieve schedule data.
     *   Request: auth.uid = 'user_xyz'
     * @deny (update) - A non-admin user attempts to update a schedule.
     */
    match /organizations/{organizationId}/schedules/{scheduleId} {
      allow get, list: if true;

      allow create: if isSignedIn() && request.resource.data.organizationId == organizationId;
      allow update: if isSignedIn() && request.resource.data.organizationId == organizationId && resource != null;
      allow delete: if isSignedIn() && request.resource.data.organizationId == organizationId && resource != null;
    }

    /**
     * @description Rule for managing shift data within a schedule.  Shift management is restricted to authenticated users.
     * @path /organizations/{organizationId}/schedules/{scheduleId}/shifts/{shiftId}
     * @allow (create) - An authenticated user can create a shift.
     *   Request: auth.uid = 'user_abc'
     *            resource.data.scheduleId = 'schedule123'
     * @allow (get, list) - Any authenticated user can retrieve shift data.
     *   Request: auth.uid = 'user_xyz'
     * @deny (update) - A non-admin user attempts to update a shift.
     */
    match /organizations/{organizationId}/schedules/{scheduleId}/shifts/{shiftId} {
      allow get, list: if true;

      allow create: if isSignedIn() && request.resource.data.scheduleId == scheduleId;
      allow update: if isSignedIn() && request.resource.data.scheduleId == scheduleId && resource != null;
      allow delete: if isSignedIn() && request.resource.data.scheduleId == scheduleId && resource != null;
    }

    /**
     * @description Rule for managing messages within an organization. Message management is restricted to authenticated users.
     * @path /organizations/{organizationId}/messages/{messageId}
     * @allow (create) - An authenticated user can create a message.
     *   Request: auth.uid = 'user_abc'
     *            resource.data.organizationId = 'org123'
     * @allow (get, list) - Any authenticated user can retrieve message data.
     *   Request: auth.uid = 'user_xyz'
     * @deny (update) - A non-admin user attempts to update a message.
     */
    match /organizations/{organizationId}/messages/{messageId} {
      allow get, list: if true;

      allow create: if isSignedIn() && request.resource.data.senderId == request.auth.uid && request.resource.data.organizationId == organizationId;
      allow update: if isSignedIn() && request.resource.data.organizationId == organizationId && resource != null;
      allow delete: if isSignedIn() && request.resource.data.organizationId == organizationId && resource != null;
    }
  }
}
`;
```

### functions/.eslintrc.js

```js
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
  },
};

```

### functions/package-lock.json

```json
{
  "name": "functions",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "functions",
      "dependencies": {
        "firebase-admin": "^12.6.0",
        "firebase-functions": "^6.0.1"
      },
      "devDependencies": {
        "@typescript-eslint/eslint-plugin": "^5.12.0",
        "@typescript-eslint/parser": "^5.12.0",
        "eslint": "^8.9.0",
        "eslint-config-google": "^0.14.0",
        "eslint-plugin-import": "^2.25.4",
        "firebase-functions-test": "^3.1.0",
        "typescript": "^5.7.3"
      },
      "engines": {
        "node": "22"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.27.1.tgz",
      "integrity": "sha512-cjQ7ZlQ0Mv3b47hABuTevyTuYN4i+loJKGeV9flcCgIK37cCXRh+L1bd3iBHlynerhQ7BhCkn2BPbQUL+rGqFg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.27.1",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.28.4",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.28.4.tgz",
      "integrity": "sha512-YsmSKC29MJwf0gF8Rjjrg5LQCmyh+j/nD8/eP7f+BeoQTKYqs9RoWbjGOdy0+1Ekr68RJZMUOPVQaQisnIo4Rw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.28.4",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.28.4.tgz",
      "integrity": "sha512-2BCOP7TN8M+gVDj7/ht3hsaO/B/n5oDbiAyyvnRlNOs+u1o+JWNYTQrmpuNp1/Wq2gcFrI01JAW+paEKDMx/CA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/code-frame": "^7.27.1",
        "@babel/generator": "^7.28.3",
        "@babel/helper-compilation-targets": "^7.27.2",
        "@babel/helper-module-transforms": "^7.28.3",
        "@babel/helpers": "^7.28.4",
        "@babel/parser": "^7.28.4",
        "@babel/template": "^7.27.2",
        "@babel/traverse": "^7.28.4",
        "@babel/types": "^7.28.4",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/core/node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.28.3",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.28.3.tgz",
      "integrity": "sha512-3lSpxGgvnmZznmBkCRnVREPUFJv2wrv9iAoFDvADJc0ypmdOxdUtcLeBgBJ6zE0PMeTKnxeQzyk0xTBq4Ep7zw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/parser": "^7.28.3",
        "@babel/types": "^7.28.2",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.27.2",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.27.2.tgz",
      "integrity": "sha512-2+1thGUUWWjLTYTHZWK1n8Yga0ijBz1XAhUXcKy81rd5g6yh7hGqMp45v7cadSbEHc9G3OTv45SyneRN3ps4DQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/compat-data": "^7.27.2",
        "@babel/helper-validator-option": "^7.27.1",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets/node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.28.0.tgz",
      "integrity": "sha512-+W6cISkXFa1jXsDEdYA8HeevQT/FULhxzR99pxphltZcVaugps53THCeiWA8SguxxpSp3gKPiuYfSWopkLQ4hw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.27.1.tgz",
      "integrity": "sha512-0gSFWUPNXNopqtIPQvlD5WgXYI5GY2kP2cCvoT8kczjbfcfuIljTbcWrulD1CIPIX2gt1wghbDy08yE1p+/r3w==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/traverse": "^7.27.1",
        "@babel/types": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.28.3",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.28.3.tgz",
      "integrity": "sha512-gytXUbs8k2sXS9PnQptz5o0QnpLL51SwASIORY6XaBKF88nsOT0Zw9szLqlSGQDP/4TljBAD5y98p2U1fqkdsw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-module-imports": "^7.27.1",
        "@babel/helper-validator-identifier": "^7.27.1",
        "@babel/traverse": "^7.28.3"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.27.1.tgz",
      "integrity": "sha512-1gn1Up5YXka3YYAHGKpbideQ5Yjf1tDa9qYcgysz+cNCXukyLl6DjPXhD3VRwSb8c0J9tA4b2+rHEZtc6R0tlw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.27.1.tgz",
      "integrity": "sha512-qMlSxKbpRlAridDExk92nSobyDdpPijUq2DW6oDnUqd0iOGxmQjyqhMIihI9+zv4LPyZdRje2cavWPbCbWm3eA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.27.1.tgz",
      "integrity": "sha512-D2hP9eA+Sqx1kBZgzxZh0y1trbuU+JoDkiEwqhQ36nodYqJwyEIhPSdMNd7lOm/4io72luTPWH20Yda0xOuUow==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.27.1.tgz",
      "integrity": "sha512-YvjJow9FxbhFFKDSuFnVCe2WxXk1zWc22fFePVNEaWJEu8IrZVlda6N0uHwzZrUM1il7NC9Mlp4MaJYbYd9JSg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.28.4",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.28.4.tgz",
      "integrity": "sha512-HFN59MmQXGHVyYadKLVumYsA9dBFun/ldYxipEjzA4196jpLZd8UjEEBLkbEkvfYreDqJhZxYAWFPtrfhNpj4w==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/template": "^7.27.2",
        "@babel/types": "^7.28.4"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.28.4",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.28.4.tgz",
      "integrity": "sha512-yZbBqeM6TkpP9du/I2pUZnJsRMGGvOuIrhjzC1AwHwW+6he4mni6Bp/m8ijn0iOuZuPI2BfkCoSRunpyjnrQKg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/types": "^7.28.4"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-syntax-async-generators": {
      "version": "7.8.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-async-generators/-/plugin-syntax-async-generators-7.8.4.tgz",
      "integrity": "sha512-tycmZxkGfZaxhMRbXlPXuVFpdWlXpir2W4AMhSJgRKzk/eDlIXOhb2LHWoLpDF7TEHylV5zNhykX6KAgHJmTNw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-bigint": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-bigint/-/plugin-syntax-bigint-7.8.3.tgz",
      "integrity": "sha512-wnTnFlG+YxQm3vDxpGE57Pj0srRU4sHE/mDkt1qv2YJJSeUAec2ma4WLUnUPeKjyrfntVwe/N6dCXpU+zL3Npg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-class-properties": {
      "version": "7.12.13",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-class-properties/-/plugin-syntax-class-properties-7.12.13.tgz",
      "integrity": "sha512-fm4idjKla0YahUNgFNLCB0qySdsoPiZP3iQE3rky0mBUtMZ23yDJ9SJdg6dXTSDnulOVqiF3Hgr9nbXvXTQZYA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.12.13"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-class-static-block": {
      "version": "7.14.5",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-class-static-block/-/plugin-syntax-class-static-block-7.14.5.tgz",
      "integrity": "sha512-b+YyPmr6ldyNnM6sqYeMWE+bgJcJpO6yS4QD7ymxgH34GBPNDM/THBh8iunyvKIZztiwLH4CJZ0RxTk9emgpjw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.14.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-import-attributes": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-import-attributes/-/plugin-syntax-import-attributes-7.27.1.tgz",
      "integrity": "sha512-oFT0FrKHgF53f4vOsZGi2Hh3I35PfSmVs4IBFLFj4dnafP+hIWDLg3VyKmUHfLoLHlyxY4C7DGtmHuJgn+IGww==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-import-meta": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-import-meta/-/plugin-syntax-import-meta-7.10.4.tgz",
      "integrity": "sha512-Yqfm+XDx0+Prh3VSeEQCPU81yC+JWZ2pDPFSS4ZdpfZhp4MkFMaDC1UqseovEKwSUpnIL7+vK+Clp7bfh0iD7g==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.10.4"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-json-strings": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-json-strings/-/plugin-syntax-json-strings-7.8.3.tgz",
      "integrity": "sha512-lY6kdGpWHvjoe2vk4WrAapEuBR69EMxZl+RoGRhrFGNYVK8mOPAW8VfbT/ZgrFbXlDNiiaxQnAtgVCZ6jv30EA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-jsx": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-jsx/-/plugin-syntax-jsx-7.27.1.tgz",
      "integrity": "sha512-y8YTNIeKoyhGd9O0Jiyzyyqk8gdjnumGTQPsz0xOZOQ2RmkVJeZ1vmmfIvFEKqucBG6axJGBZDE/7iI5suUI/w==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-logical-assignment-operators": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-logical-assignment-operators/-/plugin-syntax-logical-assignment-operators-7.10.4.tgz",
      "integrity": "sha512-d8waShlpFDinQ5MtvGU9xDAOzKH47+FFoney2baFIoMr952hKOLp1HR7VszoZvOsV/4+RRszNY7D17ba0te0ig==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.10.4"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-nullish-coalescing-operator": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-nullish-coalescing-operator/-/plugin-syntax-nullish-coalescing-operator-7.8.3.tgz",
      "integrity": "sha512-aSff4zPII1u2QD7y+F8oDsz19ew4IGEJg9SVW+bqwpwtfFleiQDMdzA/R+UlWDzfnHFCxxleFT0PMIrR36XLNQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-numeric-separator": {
      "version": "7.10.4",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-numeric-separator/-/plugin-syntax-numeric-separator-7.10.4.tgz",
      "integrity": "sha512-9H6YdfkcK/uOnY/K7/aA2xpzaAgkQn37yzWUMRK7OaPOqOpGS1+n0H5hxT9AUw9EsSjPW8SVyMJwYRtWs3X3ug==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.10.4"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-object-rest-spread": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-object-rest-spread/-/plugin-syntax-object-rest-spread-7.8.3.tgz",
      "integrity": "sha512-XoqMijGZb9y3y2XskN+P1wUGiVwWZ5JmoDRwx5+3GmEplNyVM2s2Dg8ILFQm8rWM48orGy5YpI5Bl8U1y7ydlA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-optional-catch-binding": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-optional-catch-binding/-/plugin-syntax-optional-catch-binding-7.8.3.tgz",
      "integrity": "sha512-6VPD0Pc1lpTqw0aKoeRTMiB+kWhAoT24PA+ksWSBrFtl5SIRVpZlwN3NNPQjehA2E/91FV3RjLWoVTglWcSV3Q==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-optional-chaining": {
      "version": "7.8.3",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-optional-chaining/-/plugin-syntax-optional-chaining-7.8.3.tgz",
      "integrity": "sha512-KoK9ErH1MBlCPxV0VANkXW2/dw4vlbGDrFgz8bmUsBGYkFRcbRwMh6cIJubdPrkxRwuGdtCk0v/wPTKbQgBjkg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.8.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-private-property-in-object": {
      "version": "7.14.5",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-private-property-in-object/-/plugin-syntax-private-property-in-object-7.14.5.tgz",
      "integrity": "sha512-0wVnp9dxJ72ZUJDV27ZfbSj6iHLoytYZmh3rFcxNnvsJF3ktkzLDZPy/mA17HGsaQT3/DQsWYX1f1QGWkCoVUg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.14.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-top-level-await": {
      "version": "7.14.5",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-top-level-await/-/plugin-syntax-top-level-await-7.14.5.tgz",
      "integrity": "sha512-hx++upLv5U1rgYfwe1xBQUhRmU41NEvpUvrp8jkrSCdvGSnM5/qdRMtylJ6PG5OFkBaHkbTAKTnd3/YyESRHFw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.14.5"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-typescript": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-typescript/-/plugin-syntax-typescript-7.27.1.tgz",
      "integrity": "sha512-xfYCBMxveHrRMnAWl1ZlPXOZjzkN82THFvLhQhFXFt81Z5HnN+EtUkZhv/zcKpmT3fzmWZB0ywiBrbC3vogbwQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.27.2",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.27.2.tgz",
      "integrity": "sha512-LPDZ85aEJyYSd18/DkjNh4/y1ntkE5KwUHWTiqgRxruuZL2F1yuHligVHLvcHY2vMHXttKFpJn6LwfI7cw7ODw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/code-frame": "^7.27.1",
        "@babel/parser": "^7.27.2",
        "@babel/types": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.28.4",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.28.4.tgz",
      "integrity": "sha512-YEzuboP2qvQavAcjgQNVgsvHIDv6ZpwXvcvjmyySP2DIMuByS/6ioU5G9pYrWHM6T2YDfc7xga9iNzYOs12CFQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/code-frame": "^7.27.1",
        "@babel/generator": "^7.28.3",
        "@babel/helper-globals": "^7.28.0",
        "@babel/parser": "^7.28.4",
        "@babel/template": "^7.27.2",
        "@babel/types": "^7.28.4",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.28.4",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.28.4.tgz",
      "integrity": "sha512-bkFqkLhh3pMBUQQkpVgWDWq/lqzc2678eUyDlTBhRqhCHFguYYGM0Efga7tYk4TogG/3x0EEl66/OQ+WGbWB/Q==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-string-parser": "^7.27.1",
        "@babel/helper-validator-identifier": "^7.27.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@bcoe/v8-coverage": {
      "version": "0.2.3",
      "resolved": "https://registry.npmjs.org/@bcoe/v8-coverage/-/v8-coverage-0.2.3.tgz",
      "integrity": "sha512-0hYQ8SB4Db5zvZB4axdMHGwEaQjkZzFjQiN9LVYvIFB2nSUHW9tYpxWriPrWDASIxiaXax83REcLxuSdnGPZtw==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@emnapi/core": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-1.5.0.tgz",
      "integrity": "sha512-sbP8GzB1WDzacS8fgNPpHlp6C9VZe+SJP3F90W9rLemaQj2PzIuTEl1qDOYQf58YIpyjViI24y9aPWCjEzY2cg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "dependencies": {
        "@emnapi/wasi-threads": "1.1.0",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.5.0.tgz",
      "integrity": "sha512-97/BJ3iXHww3djw6hYIfErCZFee7qCtrneuLa20UXFCOTCfBM2cvQHjWJ2EG0s0MtdNwInarqCTz35i4wWXHsQ==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/wasi-threads": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-1.1.0.tgz",
      "integrity": "sha512-WI0DdZ8xFSbgMjR1sFsKABJ/C5OnRrjT06JXbZKexJGrDuPTzZdDYfFlsgcCXCyf+suG5QU2e/y1Wo2V/OapLQ==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.9.0",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.9.0.tgz",
      "integrity": "sha512-ayVFHdtZ+hsq1t2Dy24wCmGXGe4q9Gu3smhLYALJrr473ZH27MsnSL+LKUlimp4BWJqMDMLmPpx/Q9R3OAlL4g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.12.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.1.tgz",
      "integrity": "sha512-CCZCDJuduB9OUkFkY2IgppNZMi2lBQgD2qzwXkEia16cge2pijY/aXi96CJMquDMn3nJdlPV1A5KrJEXwfLNzQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-2.1.4.tgz",
      "integrity": "sha512-269Z39MS6wVJtsoUl10L60WdkhJVdPG24Q4eZTH3nnF6lpvSShEK3wQjDX9JRWAUPvPh7COouPpU9IrqaZFvtQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ajv": "^6.12.4",
        "debug": "^4.3.2",
        "espree": "^9.6.0",
        "globals": "^13.19.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.1.0",
        "minimatch": "^3.1.2",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/js": {
      "version": "8.57.1",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-8.57.1.tgz",
      "integrity": "sha512-d9zaMRSTIKDLhctzH12MtXvJKSSUhaHcjV+2Z+GK+EEY7XKpP5yR4x+N3TAcHTcu963nIr+TMcCb4DBCYX1z6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      }
    },
    "node_modules/@fastify/busboy": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/@fastify/busboy/-/busboy-3.2.0.tgz",
      "integrity": "sha512-m9FVDXU3GT2ITSe0UaMA5rU3QkfC/UXtCU8y0gSN/GugTqtVldOBWIB5V6V3sbmenVZUIpU6f+mPEO2+m5iTaA==",
      "license": "MIT"
    },
    "node_modules/@firebase/app-check-interop-types": {
      "version": "0.3.2",
      "resolved": "https://registry.npmjs.org/@firebase/app-check-interop-types/-/app-check-interop-types-0.3.2.tgz",
      "integrity": "sha512-LMs47Vinv2HBMZi49C09dJxp0QT5LwDzFaVGf/+ITHe3BlIhUiLNttkATSXplc89A2lAaeTqjgqVkiRfUGyQiQ==",
      "license": "Apache-2.0"
    },
    "node_modules/@firebase/app-types": {
      "version": "0.9.2",
      "resolved": "https://registry.npmjs.org/@firebase/app-types/-/app-types-0.9.2.tgz",
      "integrity": "sha512-oMEZ1TDlBz479lmABwWsWjzHwheQKiAgnuKxE0pz0IXCVx7/rtlkx1fQ6GfgK24WCrxDKMplZrT50Kh04iMbXQ==",
      "license": "Apache-2.0"
    },
    "node_modules/@firebase/auth-interop-types": {
      "version": "0.2.3",
      "resolved": "https://registry.npmjs.org/@firebase/auth-interop-types/-/auth-interop-types-0.2.3.tgz",
      "integrity": "sha512-Fc9wuJGgxoxQeavybiuwgyi+0rssr76b+nHpj+eGhXFYAdudMWyfBHvFL/I5fEHniUM/UQdFzi9VXJK2iZF7FQ==",
      "license": "Apache-2.0"
    },
    "node_modules/@firebase/component": {
      "version": "0.6.9",
      "resolved": "https://registry.npmjs.org/@firebase/component/-/component-0.6.9.tgz",
      "integrity": "sha512-gm8EUEJE/fEac86AvHn8Z/QW8BvR56TBw3hMW0O838J/1mThYQXAIQBgUv75EqlCZfdawpWLrKt1uXvp9ciK3Q==",
      "license": "Apache-2.0",
      "dependencies": {
        "@firebase/util": "1.10.0",
        "tslib": "^2.1.0"
      }
    },
    "node_modules/@firebase/database": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/@firebase/database/-/database-1.0.8.tgz",
      "integrity": "sha512-dzXALZeBI1U5TXt6619cv0+tgEhJiwlUtQ55WNZY7vGAjv7Q1QioV969iYwt1AQQ0ovHnEW0YW9TiBfefLvErg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@firebase/app-check-interop-types": "0.3.2",
        "@firebase/auth-interop-types": "0.2.3",
        "@firebase/component": "0.6.9",
        "@firebase/logger": "0.4.2",
        "@firebase/util": "1.10.0",
        "faye-websocket": "0.11.4",
        "tslib": "^2.1.0"
      }
    },
    "node_modules/@firebase/database-compat": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/@firebase/database-compat/-/database-compat-1.0.8.tgz",
      "integrity": "sha512-OpeWZoPE3sGIRPBKYnW9wLad25RaWbGyk7fFQe4xnJQKRzlynWeFBSRRAoLE2Old01WXwskUiucNqUUVlFsceg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@firebase/component": "0.6.9",
        "@firebase/database": "1.0.8",
        "@firebase/database-types": "1.0.5",
        "@firebase/logger": "0.4.2",
        "@firebase/util": "1.10.0",
        "tslib": "^2.1.0"
      }
    },
    "node_modules/@firebase/database-types": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/@firebase/database-types/-/database-types-1.0.5.tgz",
      "integrity": "sha512-fTlqCNwFYyq/C6W7AJ5OCuq5CeZuBEsEwptnVxlNPkWCo5cTTyukzAHRSO/jaQcItz33FfYrrFk1SJofcu2AaQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@firebase/app-types": "0.9.2",
        "@firebase/util": "1.10.0"
      }
    },
    "node_modules/@firebase/logger": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@firebase/logger/-/logger-0.4.2.tgz",
      "integrity": "sha512-Q1VuA5M1Gjqrwom6I6NUU4lQXdo9IAQieXlujeHZWvRt1b7qQ0KwBaNAjgxG27jgF9/mUwsNmO8ptBCGVYhB0A==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "^2.1.0"
      }
    },
    "node_modules/@firebase/util": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@firebase/util/-/util-1.10.0.tgz",
      "integrity": "sha512-xKtx4A668icQqoANRxyDLBLz51TAbDP9KRfpbKGxiCAW346d0BeJe5vN6/hKxxmWwnZ0mautyv39JxviwwQMOQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "^2.1.0"
      }
    },
    "node_modules/@google-cloud/firestore": {
      "version": "7.11.6",
      "resolved": "https://registry.npmjs.org/@google-cloud/firestore/-/firestore-7.11.6.tgz",
      "integrity": "sha512-EW/O8ktzwLfyWBOsNuhRoMi8lrC3clHM5LVFhGvO1HCsLozCOOXRAlHrYBoE6HL42Sc8yYMuCb2XqcnJ4OOEpw==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@opentelemetry/api": "^1.3.0",
        "fast-deep-equal": "^3.1.1",
        "functional-red-black-tree": "^1.0.1",
        "google-gax": "^4.3.3",
        "protobufjs": "^7.2.6"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@google-cloud/paginator": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/@google-cloud/paginator/-/paginator-5.0.2.tgz",
      "integrity": "sha512-DJS3s0OVH4zFDB1PzjxAsHqJT6sKVbRwwML0ZBP9PbU7Yebtu/7SWMRzvO2J3nUi9pRNITCfu4LJeooM2w4pjg==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "arrify": "^2.0.0",
        "extend": "^3.0.2"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@google-cloud/projectify": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@google-cloud/projectify/-/projectify-4.0.0.tgz",
      "integrity": "sha512-MmaX6HeSvyPbWGwFq7mXdo0uQZLGBYCwziiLIGq5JVX+/bdI3SAq6bP98trV5eTWfLuvsMcIC1YJOF2vfteLFA==",
      "license": "Apache-2.0",
      "optional": true,
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@google-cloud/promisify": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@google-cloud/promisify/-/promisify-4.0.0.tgz",
      "integrity": "sha512-Orxzlfb9c67A15cq2JQEyVc7wEsmFBmHjZWZYQMUyJ1qivXyMwdyNOs9odi79hze+2zqdTtu1E19IM/FtqZ10g==",
      "license": "Apache-2.0",
      "optional": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@google-cloud/storage": {
      "version": "7.17.2",
      "resolved": "https://registry.npmjs.org/@google-cloud/storage/-/storage-7.17.2.tgz",
      "integrity": "sha512-6xN0KNO8L/LIA5zu3CJwHkJiB6n65eykBLOb0E+RooiHYgX8CSao6lvQiKT9TBk2gL5g33LL3fmhDodZnt56rw==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@google-cloud/paginator": "^5.0.0",
        "@google-cloud/projectify": "^4.0.0",
        "@google-cloud/promisify": "<4.1.0",
        "abort-controller": "^3.0.0",
        "async-retry": "^1.3.3",
        "duplexify": "^4.1.3",
        "fast-xml-parser": "^4.4.1",
        "gaxios": "^6.0.2",
        "google-auth-library": "^9.6.3",
        "html-entities": "^2.5.2",
        "mime": "^3.0.0",
        "p-limit": "^3.0.1",
        "retry-request": "^7.0.0",
        "teeny-request": "^9.0.0",
        "uuid": "^8.0.0"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@google-cloud/storage/node_modules/uuid": {
      "version": "8.3.2",
      "resolved": "https://registry.npmjs.org/uuid/-/uuid-8.3.2.tgz",
      "integrity": "sha512-+NYs2QeMWy+GWFOEm9xnn6HCDp0l7QBD7ml8zLUmJ+93Q5NF0NocErnwkTkXVFNiX3/fpC6afS8Dhb/gz7R7eg==",
      "license": "MIT",
      "optional": true,
      "bin": {
        "uuid": "dist/bin/uuid"
      }
    },
    "node_modules/@grpc/grpc-js": {
      "version": "1.14.0",
      "resolved": "https://registry.npmjs.org/@grpc/grpc-js/-/grpc-js-1.14.0.tgz",
      "integrity": "sha512-N8Jx6PaYzcTRNzirReJCtADVoq4z7+1KQ4E70jTg/koQiMoUSN1kbNjPOqpPbhMFhfU1/l7ixspPl8dNY+FoUg==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@grpc/proto-loader": "^0.8.0",
        "@js-sdsl/ordered-map": "^4.4.2"
      },
      "engines": {
        "node": ">=12.10.0"
      }
    },
    "node_modules/@grpc/grpc-js/node_modules/@grpc/proto-loader": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/@grpc/proto-loader/-/proto-loader-0.8.0.tgz",
      "integrity": "sha512-rc1hOQtjIWGxcxpb9aHAfLpIctjEnsDehj0DAiVfBlmT84uvR0uUtN2hEi/ecvWVjXUGf5qPF4qEgiLOx1YIMQ==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "lodash.camelcase": "^4.3.0",
        "long": "^5.0.0",
        "protobufjs": "^7.5.3",
        "yargs": "^17.7.2"
      },
      "bin": {
        "proto-loader-gen-types": "build/bin/proto-loader-gen-types.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/@grpc/proto-loader": {
      "version": "0.7.15",
      "resolved": "https://registry.npmjs.org/@grpc/proto-loader/-/proto-loader-0.7.15.tgz",
      "integrity": "sha512-tMXdRCfYVixjuFK+Hk0Q1s38gV9zDiDJfWL3h1rv4Qc39oILCu1TRTDt7+fGUI8K4G1Fj125Hx/ru3azECWTyQ==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "lodash.camelcase": "^4.3.0",
        "long": "^5.0.0",
        "protobufjs": "^7.2.5",
        "yargs": "^17.7.2"
      },
      "bin": {
        "proto-loader-gen-types": "build/bin/proto-loader-gen-types.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/@humanwhocodes/config-array": {
      "version": "0.13.0",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/config-array/-/config-array-0.13.0.tgz",
      "integrity": "sha512-DZLEEqFWQFiyK6h5YIeynKx7JlvCYWL0cImfSRXZ9l4Sg2efkFGTuFf6vzXjK1cq6IYkU+Eg/JizXw+TD2vRNw==",
      "deprecated": "Use @eslint/config-array instead",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanwhocodes/object-schema": "^2.0.3",
        "debug": "^4.3.1",
        "minimatch": "^3.0.5"
      },
      "engines": {
        "node": ">=10.10.0"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/object-schema": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/object-schema/-/object-schema-2.0.3.tgz",
      "integrity": "sha512-93zYdMES/c1D69yZiKDBj0V24vqNzB/koF26KPaagAfd3P/4gUlh3Dys5ogAK+Exi9QyzlD8x/08Zt7wIKcDcA==",
      "deprecated": "Use @eslint/object-schema instead",
      "dev": true,
      "license": "BSD-3-Clause"
    },
    "node_modules/@isaacs/cliui": {
      "version": "8.0.2",
      "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-8.0.2.tgz",
      "integrity": "sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "dependencies": {
        "string-width": "^5.1.2",
        "string-width-cjs": "npm:string-width@^4.2.0",
        "strip-ansi": "^7.0.1",
        "strip-ansi-cjs": "npm:strip-ansi@^6.0.1",
        "wrap-ansi": "^8.1.0",
        "wrap-ansi-cjs": "npm:wrap-ansi@^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@isaacs/cliui/node_modules/ansi-regex": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.2.2.tgz",
      "integrity": "sha512-Bq3SmSpyFHaWjPk8If9yc6svM8c56dB5BAtW4Qbw5jHTwwXXcTLoRMkpDJp6VL0XzlWaCHTXrkFURMYmD0sLqg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/@isaacs/cliui/node_modules/strip-ansi": {
      "version": "7.1.2",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.2.tgz",
      "integrity": "sha512-gmBGslpoQJtgnMAvOVqGZpEz9dyoKTCzy2nfz/n8aIFhN/jCE/rCmcxabB6jOOHV+0WNnylOxaxBQPSvcWklhA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "ansi-regex": "^6.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@istanbuljs/load-nyc-config/-/load-nyc-config-1.1.0.tgz",
      "integrity": "sha512-VjeHSlIzpv/NyD3N0YuHfXOPDIixcA1q2ZV98wsMqcYlPmv2n3Yb2lYP9XMElnaFVXg5A7YLTeLu6V84uQDjmQ==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "dependencies": {
        "camelcase": "^5.3.1",
        "find-up": "^4.1.0",
        "get-package-type": "^0.1.0",
        "js-yaml": "^3.13.1",
        "resolve-from": "^5.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/argparse": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-1.0.10.tgz",
      "integrity": "sha512-o5Roy6tNG4SL/FOkCAN6RzjiakZS25RLYFrcMttJqbdd8BWrnA+fGz57iN5Pb06pvBGvl5gQ0B48dJlslXvoTg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "sprintf-js": "~1.0.2"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/find-up": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-4.1.0.tgz",
      "integrity": "sha512-PpOwAdQ/YlXQ2vj8a3h8IipDuYRi3wceVQQGYWxNINccq40Anw7BlsEXCMbt1Zt+OLA6Fq9suIpIWD0OsnISlw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "locate-path": "^5.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml": {
      "version": "3.14.1",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-3.14.1.tgz",
      "integrity": "sha512-okMH7OXXJ7YrN9Ok3/SXrnu4iX9yOk+25nqX4imS2npuvTYDmo/QEZoqwZkYaIDk3jVvBOTOIEgEhaLOynBS9g==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "argparse": "^1.0.7",
        "esprima": "^4.0.0"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/locate-path": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-5.0.0.tgz",
      "integrity": "sha512-t7hw9pI+WvuwNJXwk5zVHpyhIqzg2qTlklJOf0mVxGSbe3Fp2VieZcduNYjaLDoy6p9uGpQEGWG87WpMKlNq8g==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "p-locate": "^4.1.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/p-limit": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-2.3.0.tgz",
      "integrity": "sha512-//88mFWSJx8lxCzwdAABTJL2MyWB12+eIY7MDL2SqLmAkeKU9qxRvWuSyTjm3FUmpBEMuFfckAIqEaVGUDxb6w==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "p-try": "^2.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/p-locate": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-4.1.0.tgz",
      "integrity": "sha512-R79ZZ/0wAxKGu3oYMlz8jy/kbhsNrS7SKZ7PxEHBgJ5+F2mtFW2fK2cOtBh1cHYkQsbzFV7I+EoRKe6Yt0oK7A==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "p-limit": "^2.2.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@istanbuljs/load-nyc-config/node_modules/resolve-from": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-5.0.0.tgz",
      "integrity": "sha512-qYg9KP24dD5qka9J47d0aVky0N+b4fTU89LN9iDnjB5waksiC49rvMB0PrUJQGoTmH50XPiqOvAjDfaijGxYZw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@istanbuljs/schema": {
      "version": "0.1.3",
      "resolved": "https://registry.npmjs.org/@istanbuljs/schema/-/schema-0.1.3.tgz",
      "integrity": "sha512-ZXRY4jNvVgSVQ8DL3LTcakaAtXwTVUxE81hslsyD2AtoXW/wVob10HkOJ1X/pAlcI7D+2YoZKg5do8G/w6RYgA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/@jest/console": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/console/-/console-30.2.0.tgz",
      "integrity": "sha512-+O1ifRjkvYIkBqASKWgLxrpEhQAAE7hY77ALLUufSk5717KfOShg6IbqLmdsLMPdUiFvA2kTs0R7YZy+l0IzZQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/types": "30.2.0",
        "@types/node": "*",
        "chalk": "^4.1.2",
        "jest-message-util": "30.2.0",
        "jest-util": "30.2.0",
        "slash": "^3.0.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/core": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/core/-/core-30.2.0.tgz",
      "integrity": "sha512-03W6IhuhjqTlpzh/ojut/pDB2LPRygyWX8ExpgHtQA8H/3K7+1vKmcINx5UzeOX1se6YEsBsOHQ1CRzf3fOwTQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/console": "30.2.0",
        "@jest/pattern": "30.0.1",
        "@jest/reporters": "30.2.0",
        "@jest/test-result": "30.2.0",
        "@jest/transform": "30.2.0",
        "@jest/types": "30.2.0",
        "@types/node": "*",
        "ansi-escapes": "^4.3.2",
        "chalk": "^4.1.2",
        "ci-info": "^4.2.0",
        "exit-x": "^0.2.2",
        "graceful-fs": "^4.2.11",
        "jest-changed-files": "30.2.0",
        "jest-config": "30.2.0",
        "jest-haste-map": "30.2.0",
        "jest-message-util": "30.2.0",
        "jest-regex-util": "30.0.1",
        "jest-resolve": "30.2.0",
        "jest-resolve-dependencies": "30.2.0",
        "jest-runner": "30.2.0",
        "jest-runtime": "30.2.0",
        "jest-snapshot": "30.2.0",
        "jest-util": "30.2.0",
        "jest-validate": "30.2.0",
        "jest-watcher": "30.2.0",
        "micromatch": "^4.0.8",
        "pretty-format": "30.2.0",
        "slash": "^3.0.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "peerDependencies": {
        "node-notifier": "^8.0.1 || ^9.0.0 || ^10.0.0"
      },
      "peerDependenciesMeta": {
        "node-notifier": {
          "optional": true
        }
      }
    },
    "node_modules/@jest/diff-sequences": {
      "version": "30.0.1",
      "resolved": "https://registry.npmjs.org/@jest/diff-sequences/-/diff-sequences-30.0.1.tgz",
      "integrity": "sha512-n5H8QLDJ47QqbCNn5SuFjCRDrOLEZ0h8vAHCK5RL9Ls7Xa8AQLa/YxAc9UjFqoEDM48muwtBGjtMY5cr0PLDCw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/environment": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/environment/-/environment-30.2.0.tgz",
      "integrity": "sha512-/QPTL7OBJQ5ac09UDRa3EQes4gt1FTEG/8jZ/4v5IVzx+Cv7dLxlVIvfvSVRiiX2drWyXeBjkMSR8hvOWSog5g==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/fake-timers": "30.2.0",
        "@jest/types": "30.2.0",
        "@types/node": "*",
        "jest-mock": "30.2.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/expect": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/expect/-/expect-30.2.0.tgz",
      "integrity": "sha512-V9yxQK5erfzx99Sf+7LbhBwNWEZ9eZay8qQ9+JSC0TrMR1pMDHLMY+BnVPacWU6Jamrh252/IKo4F1Xn/zfiqA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "expect": "30.2.0",
        "jest-snapshot": "30.2.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/expect-utils": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/expect-utils/-/expect-utils-30.2.0.tgz",
      "integrity": "sha512-1JnRfhqpD8HGpOmQp180Fo9Zt69zNtC+9lR+kT7NVL05tNXIi+QC8Csz7lfidMoVLPD3FnOtcmp0CEFnxExGEA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/get-type": "30.1.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/fake-timers": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/fake-timers/-/fake-timers-30.2.0.tgz",
      "integrity": "sha512-HI3tRLjRxAbBy0VO8dqqm7Hb2mIa8d5bg/NJkyQcOk7V118ObQML8RC5luTF/Zsg4474a+gDvhce7eTnP4GhYw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/types": "30.2.0",
        "@sinonjs/fake-timers": "^13.0.0",
        "@types/node": "*",
        "jest-message-util": "30.2.0",
        "jest-mock": "30.2.0",
        "jest-util": "30.2.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/get-type": {
      "version": "30.1.0",
      "resolved": "https://registry.npmjs.org/@jest/get-type/-/get-type-30.1.0.tgz",
      "integrity": "sha512-eMbZE2hUnx1WV0pmURZY9XoXPkUYjpc55mb0CrhtdWLtzMQPFvu/rZkTLZFTsdaVQa+Tr4eWAteqcUzoawq/uA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/globals": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/globals/-/globals-30.2.0.tgz",
      "integrity": "sha512-b63wmnKPaK+6ZZfpYhz9K61oybvbI1aMcIs80++JI1O1rR1vaxHUCNqo3ITu6NU0d4V34yZFoHMn/uoKr/Rwfw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/environment": "30.2.0",
        "@jest/expect": "30.2.0",
        "@jest/types": "30.2.0",
        "jest-mock": "30.2.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/pattern": {
      "version": "30.0.1",
      "resolved": "https://registry.npmjs.org/@jest/pattern/-/pattern-30.0.1.tgz",
      "integrity": "sha512-gWp7NfQW27LaBQz3TITS8L7ZCQ0TLvtmI//4OwlQRx4rnWxcPNIYjxZpDcN4+UlGxgm3jS5QPz8IPTCkb59wZA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@types/node": "*",
        "jest-regex-util": "30.0.1"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/reporters": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/reporters/-/reporters-30.2.0.tgz",
      "integrity": "sha512-DRyW6baWPqKMa9CzeiBjHwjd8XeAyco2Vt8XbcLFjiwCOEKOvy82GJ8QQnJE9ofsxCMPjH4MfH8fCWIHHDKpAQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@bcoe/v8-coverage": "^0.2.3",
        "@jest/console": "30.2.0",
        "@jest/test-result": "30.2.0",
        "@jest/transform": "30.2.0",
        "@jest/types": "30.2.0",
        "@jridgewell/trace-mapping": "^0.3.25",
        "@types/node": "*",
        "chalk": "^4.1.2",
        "collect-v8-coverage": "^1.0.2",
        "exit-x": "^0.2.2",
        "glob": "^10.3.10",
        "graceful-fs": "^4.2.11",
        "istanbul-lib-coverage": "^3.0.0",
        "istanbul-lib-instrument": "^6.0.0",
        "istanbul-lib-report": "^3.0.0",
        "istanbul-lib-source-maps": "^5.0.0",
        "istanbul-reports": "^3.1.3",
        "jest-message-util": "30.2.0",
        "jest-util": "30.2.0",
        "jest-worker": "30.2.0",
        "slash": "^3.0.0",
        "string-length": "^4.0.2",
        "v8-to-istanbul": "^9.0.1"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "peerDependencies": {
        "node-notifier": "^8.0.1 || ^9.0.0 || ^10.0.0"
      },
      "peerDependenciesMeta": {
        "node-notifier": {
          "optional": true
        }
      }
    },
    "node_modules/@jest/schemas": {
      "version": "30.0.5",
      "resolved": "https://registry.npmjs.org/@jest/schemas/-/schemas-30.0.5.tgz",
      "integrity": "sha512-DmdYgtezMkh3cpU8/1uyXakv3tJRcmcXxBOcO0tbaozPwpmh4YMsnWrQm9ZmZMfa5ocbxzbFk6O4bDPEc/iAnA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@sinclair/typebox": "^0.34.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/snapshot-utils": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/snapshot-utils/-/snapshot-utils-30.2.0.tgz",
      "integrity": "sha512-0aVxM3RH6DaiLcjj/b0KrIBZhSX1373Xci4l3cW5xiUWPctZ59zQ7jj4rqcJQ/Z8JuN/4wX3FpJSa3RssVvCug==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/types": "30.2.0",
        "chalk": "^4.1.2",
        "graceful-fs": "^4.2.11",
        "natural-compare": "^1.4.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/source-map": {
      "version": "30.0.1",
      "resolved": "https://registry.npmjs.org/@jest/source-map/-/source-map-30.0.1.tgz",
      "integrity": "sha512-MIRWMUUR3sdbP36oyNyhbThLHyJ2eEDClPCiHVbrYAe5g3CHRArIVpBw7cdSB5fr+ofSfIb2Tnsw8iEHL0PYQg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jridgewell/trace-mapping": "^0.3.25",
        "callsites": "^3.1.0",
        "graceful-fs": "^4.2.11"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/test-result": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/test-result/-/test-result-30.2.0.tgz",
      "integrity": "sha512-RF+Z+0CCHkARz5HT9mcQCBulb1wgCP3FBvl9VFokMX27acKphwyQsNuWH3c+ojd1LeWBLoTYoxF0zm6S/66mjg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/console": "30.2.0",
        "@jest/types": "30.2.0",
        "@types/istanbul-lib-coverage": "^2.0.6",
        "collect-v8-coverage": "^1.0.2"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/test-sequencer": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/test-sequencer/-/test-sequencer-30.2.0.tgz",
      "integrity": "sha512-wXKgU/lk8fKXMu/l5Hog1R61bL4q5GCdT6OJvdAFz1P+QrpoFuLU68eoKuVc4RbrTtNnTL5FByhWdLgOPSph+Q==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/test-result": "30.2.0",
        "graceful-fs": "^4.2.11",
        "jest-haste-map": "30.2.0",
        "slash": "^3.0.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/transform": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/transform/-/transform-30.2.0.tgz",
      "integrity": "sha512-XsauDV82o5qXbhalKxD7p4TZYYdwcaEXC77PPD2HixEFF+6YGppjrAAQurTl2ECWcEomHBMMNS9AH3kcCFx8jA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/core": "^7.27.4",
        "@jest/types": "30.2.0",
        "@jridgewell/trace-mapping": "^0.3.25",
        "babel-plugin-istanbul": "^7.0.1",
        "chalk": "^4.1.2",
        "convert-source-map": "^2.0.0",
        "fast-json-stable-stringify": "^2.1.0",
        "graceful-fs": "^4.2.11",
        "jest-haste-map": "30.2.0",
        "jest-regex-util": "30.0.1",
        "jest-util": "30.2.0",
        "micromatch": "^4.0.8",
        "pirates": "^4.0.7",
        "slash": "^3.0.0",
        "write-file-atomic": "^5.0.1"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jest/types": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/@jest/types/-/types-30.2.0.tgz",
      "integrity": "sha512-H9xg1/sfVvyfU7o3zMfBEjQ1gcsdeTMgqHoYdN79tuLqfTtuu7WckRA1R5whDwOzxaZAeMKTYWqP+WCAi0CHsg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/pattern": "30.0.1",
        "@jest/schemas": "30.0.5",
        "@types/istanbul-lib-coverage": "^2.0.6",
        "@types/istanbul-reports": "^3.0.4",
        "@types/node": "*",
        "@types/yargs": "^17.0.33",
        "chalk": "^4.1.2"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@js-sdsl/ordered-map": {
      "version": "4.4.2",
      "resolved": "https://registry.npmjs.org/@js-sdsl/ordered-map/-/ordered-map-4.4.2.tgz",
      "integrity": "sha512-iUKgm52T8HOE/makSxjqoWhe95ZJA1/G1sYsGev2JDKUSS14KAgg1LHb+Ba+IPow0xflbnSkOsZcO08C7w1gYw==",
      "license": "MIT",
      "optional": true,
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/js-sdsl"
      }
    },
    "node_modules/@napi-rs/wasm-runtime": {
      "version": "0.2.12",
      "resolved": "https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-0.2.12.tgz",
      "integrity": "sha512-ZVWUcfwY4E/yPitQJl481FjFo3K22D6qF0DuFH6Y/nbnE11GY5uguDxZMGXPQ8WQ0128MXQD7TnfHyK4oWoIJQ==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "dependencies": {
        "@emnapi/core": "^1.4.3",
        "@emnapi/runtime": "^1.4.3",
        "@tybys/wasm-util": "^0.10.0"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@opentelemetry/api": {
      "version": "1.9.0",
      "resolved": "https://registry.npmjs.org/@opentelemetry/api/-/api-1.9.0.tgz",
      "integrity": "sha512-3giAOQvZiH5F9bMlMiv8+GSPMeqg0dbaeo58/0SlA9sxSqZhnUtxzX9/2FzyhS9sWQf5S0GJE0AKBrFqjpeYcg==",
      "license": "Apache-2.0",
      "optional": true,
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/@pkgjs/parseargs": {
      "version": "0.11.0",
      "resolved": "https://registry.npmjs.org/@pkgjs/parseargs/-/parseargs-0.11.0.tgz",
      "integrity": "sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@pkgr/core": {
      "version": "0.2.9",
      "resolved": "https://registry.npmjs.org/@pkgr/core/-/core-0.2.9.tgz",
      "integrity": "sha512-QNqXyfVS2wm9hweSYD2O7F0G06uurj9kZ96TRQE5Y9hU7+tgdZwIkbAKc5Ocy1HxEY2kuDQa6cQ1WRs/O5LFKA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": "^12.20.0 || ^14.18.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/pkgr"
      }
    },
    "node_modules/@protobufjs/aspromise": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/aspromise/-/aspromise-1.1.2.tgz",
      "integrity": "sha512-j+gKExEuLmKwvz3OgROXtrJ2UG2x8Ch2YZUxahh+s1F2HZ+wAceUNLkvy6zKCPVRkU++ZWQrdxsUeQXmcg4uoQ==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/base64": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/base64/-/base64-1.1.2.tgz",
      "integrity": "sha512-AZkcAA5vnN/v4PDqKyMR5lx7hZttPDgClv83E//FMNhR2TMcLUhfRUBHCmSl0oi9zMgDDqRUJkSxO3wm85+XLg==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/codegen": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/@protobufjs/codegen/-/codegen-2.0.4.tgz",
      "integrity": "sha512-YyFaikqM5sH0ziFZCN3xDC7zeGaB/d0IUb9CATugHWbd1FRFwWwt4ld4OYMPWu5a3Xe01mGAULCdqhMlPl29Jg==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/eventemitter": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@protobufjs/eventemitter/-/eventemitter-1.1.0.tgz",
      "integrity": "sha512-j9ednRT81vYJ9OfVuXG6ERSTdEL1xVsNgqpkxMsbIabzSo3goCjDIveeGv5d03om39ML71RdmrGNjG5SReBP/Q==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/fetch": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@protobufjs/fetch/-/fetch-1.1.0.tgz",
      "integrity": "sha512-lljVXpqXebpsijW71PZaCYeIcE5on1w5DlQy5WH6GLbFryLUrBD4932W/E2BSpfRJWseIL4v/KPgBFxDOIdKpQ==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@protobufjs/aspromise": "^1.1.1",
        "@protobufjs/inquire": "^1.1.0"
      }
    },
    "node_modules/@protobufjs/float": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/float/-/float-1.0.2.tgz",
      "integrity": "sha512-Ddb+kVXlXst9d+R9PfTIxh1EdNkgoRe5tOX6t01f1lYWOvJnSPDBlG241QLzcyPdoNTsblLUdujGSE4RzrTZGQ==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/inquire": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@protobufjs/inquire/-/inquire-1.1.0.tgz",
      "integrity": "sha512-kdSefcPdruJiFMVSbn801t4vFK7KB/5gd2fYvrxhuJYg8ILrmn9SKSX2tZdV6V+ksulWqS7aXjBcRXl3wHoD9Q==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/path": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/path/-/path-1.1.2.tgz",
      "integrity": "sha512-6JOcJ5Tm08dOHAbdR3GrvP+yUUfkjG5ePsHYczMFLq3ZmMkAD98cDgcT2iA1lJ9NVwFd4tH/iSSoe44YWkltEA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/pool": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@protobufjs/pool/-/pool-1.1.0.tgz",
      "integrity": "sha512-0kELaGSIDBKvcgS4zkjz1PeddatrjYcmMWOlAuAPwAeccUrPHdUqo/J6LiymHHEiJT5NrF1UVwxY14f+fy4WQw==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/utf8": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@protobufjs/utf8/-/utf8-1.1.0.tgz",
      "integrity": "sha512-Vvn3zZrhQZkkBE8LSuW3em98c0FwgO4nxzv6OdSxPKJIEKY2bGbHn+mhGIPerzI4twdxaP8/0+06HBpwf345Lw==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@rtsao/scc": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@rtsao/scc/-/scc-1.1.0.tgz",
      "integrity": "sha512-zt6OdqaDoOnJ1ZYsCYGt9YmWzDXl4vQdKTyJev62gFhRGKdx7mcT54V9KIjg+d2wi9EXsPvAPKe7i7WjfVWB8g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@sinclair/typebox": {
      "version": "0.34.41",
      "resolved": "https://registry.npmjs.org/@sinclair/typebox/-/typebox-0.34.41.tgz",
      "integrity": "sha512-6gS8pZzSXdyRHTIqoqSVknxolr1kzfy4/CeDnrzsVz8TTIWUbOBr6gnzOmTYJ3eXQNh4IYHIGi5aIL7sOZ2G/g==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@sinonjs/commons": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/@sinonjs/commons/-/commons-3.0.1.tgz",
      "integrity": "sha512-K3mCHKQ9sVh8o1C9cxkwxaOmXoAMlDxC1mYyHrjqOWEcBjYr76t96zL2zlj5dUGZ3HSw240X1qgH3Mjf1yJWpQ==",
      "dev": true,
      "license": "BSD-3-Clause",
      "peer": true,
      "dependencies": {
        "type-detect": "4.0.8"
      }
    },
    "node_modules/@sinonjs/fake-timers": {
      "version": "13.0.5",
      "resolved": "https://registry.npmjs.org/@sinonjs/fake-timers/-/fake-timers-13.0.5.tgz",
      "integrity": "sha512-36/hTbH2uaWuGVERyC6da9YwGWnzUZXuPro/F2LfsdOsLnCojz/iSH8MxUt/FD2S5XBSVPhmArFUXcpCQ2Hkiw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "peer": true,
      "dependencies": {
        "@sinonjs/commons": "^3.0.1"
      }
    },
    "node_modules/@tootallnate/once": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@tootallnate/once/-/once-2.0.0.tgz",
      "integrity": "sha512-XCuKFP5PS55gnMVu3dty8KPatLqUoy/ZYzDzAGCQ8JNFCkLXzmI7vNHCR+XpbZaMWQK/vQubr7PkYq8g470J/A==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tybys/wasm-util": {
      "version": "0.10.1",
      "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.1.tgz",
      "integrity": "sha512-9tTaPJLSiejZKx+Bmog4uSubteqTvFrVrURwkmHixBo0G4seD0zUxp98E1DzUBJxLQ3NPwXrGKDiVjwx/DpPsg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/body-parser": {
      "version": "1.19.6",
      "resolved": "https://registry.npmjs.org/@types/body-parser/-/body-parser-1.19.6.tgz",
      "integrity": "sha512-HLFeCYgz89uk22N5Qg3dvGvsv46B8GLvKKo1zKG4NybA8U2DiEO3w9lqGg29t/tfLRJpJ6iQxnVw4OnB7MoM9g==",
      "license": "MIT",
      "dependencies": {
        "@types/connect": "*",
        "@types/node": "*"
      }
    },
    "node_modules/@types/caseless": {
      "version": "0.12.5",
      "resolved": "https://registry.npmjs.org/@types/caseless/-/caseless-0.12.5.tgz",
      "integrity": "sha512-hWtVTC2q7hc7xZ/RLbxapMvDMgUnDvKvMOpKal4DrMyfGBUfB1oKaZlIRr6mJL+If3bAP6sV/QneGzF6tJjZDg==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/@types/connect": {
      "version": "3.4.38",
      "resolved": "https://registry.npmjs.org/@types/connect/-/connect-3.4.38.tgz",
      "integrity": "sha512-K6uROf1LD88uDQqJCktA4yzL1YYAK6NgfsI0v/mTgyPKWsX1CnJ0XPSDhViejru1GcRkLWb8RlzFYJRqGUbaug==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/cors": {
      "version": "2.8.19",
      "resolved": "https://registry.npmjs.org/@types/cors/-/cors-2.8.19.tgz",
      "integrity": "sha512-mFNylyeyqN93lfe/9CSxOGREz8cpzAhH+E93xJ4xWQf62V8sQ/24reV2nyzUWM6H6Xji+GGHpkbLe7pVoUEskg==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/express": {
      "version": "4.17.23",
      "resolved": "https://registry.npmjs.org/@types/express/-/express-4.17.23.tgz",
      "integrity": "sha512-Crp6WY9aTYP3qPi2wGDo9iUe/rceX01UMhnF1jmwDcKCFM6cx7YhGP/Mpr3y9AASpfHixIG0E6azCcL5OcDHsQ==",
      "license": "MIT",
      "dependencies": {
        "@types/body-parser": "*",
        "@types/express-serve-static-core": "^4.17.33",
        "@types/qs": "*",
        "@types/serve-static": "*"
      }
    },
    "node_modules/@types/express-serve-static-core": {
      "version": "4.19.7",
      "resolved": "https://registry.npmjs.org/@types/express-serve-static-core/-/express-serve-static-core-4.19.7.tgz",
      "integrity": "sha512-FvPtiIf1LfhzsaIXhv/PHan/2FeQBbtBDtfX2QfvPxdUelMDEckK08SM6nqo1MIZY3RUlfA+HV8+hFUSio78qg==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "@types/qs": "*",
        "@types/range-parser": "*",
        "@types/send": "*"
      }
    },
    "node_modules/@types/http-errors": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@types/http-errors/-/http-errors-2.0.5.tgz",
      "integrity": "sha512-r8Tayk8HJnX0FztbZN7oVqGccWgw98T/0neJphO91KkmOzug1KkofZURD4UaD5uH8AqcFLfdPErnBod0u71/qg==",
      "license": "MIT"
    },
    "node_modules/@types/istanbul-lib-coverage": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/@types/istanbul-lib-coverage/-/istanbul-lib-coverage-2.0.6.tgz",
      "integrity": "sha512-2QF/t/auWm0lsy8XtKVPG19v3sSOQlJe/YHZgfjb/KBBHOGSV+J2q/S671rcq9uTBrLAXmZpqJiaQbMT+zNU1w==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@types/istanbul-lib-report": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/@types/istanbul-lib-report/-/istanbul-lib-report-3.0.3.tgz",
      "integrity": "sha512-NQn7AHQnk/RSLOxrBbGyJM/aVQ+pjj5HCgasFxc0K/KhoATfQ/47AyUl15I2yBUpihjmas+a+VJBOqecrFH+uA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@types/istanbul-lib-coverage": "*"
      }
    },
    "node_modules/@types/istanbul-reports": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/istanbul-reports/-/istanbul-reports-3.0.4.tgz",
      "integrity": "sha512-pk2B1NWalF9toCRu6gjBzR69syFjP4Od8WRAX+0mmf9lAjCRicLOWc+ZrxZHx/0XRjotgkF9t6iaMJ+aXcOdZQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@types/istanbul-lib-report": "*"
      }
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json5": {
      "version": "0.0.29",
      "resolved": "https://registry.npmjs.org/@types/json5/-/json5-0.0.29.tgz",
      "integrity": "sha512-dRLjCWHYg4oaA77cxO64oO+7JwCwnIzkZPdrrC71jQmQtlhM556pwKo5bUzqvZndkVbeFLIIi+9TC40JNF5hNQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/jsonwebtoken": {
      "version": "9.0.10",
      "resolved": "https://registry.npmjs.org/@types/jsonwebtoken/-/jsonwebtoken-9.0.10.tgz",
      "integrity": "sha512-asx5hIG9Qmf/1oStypjanR7iKTv0gXQ1Ov/jfrX6kS/EO0OFni8orbmGCn0672NHR3kXHwpAwR+B368ZGN/2rA==",
      "license": "MIT",
      "dependencies": {
        "@types/ms": "*",
        "@types/node": "*"
      }
    },
    "node_modules/@types/lodash": {
      "version": "4.17.20",
      "resolved": "https://registry.npmjs.org/@types/lodash/-/lodash-4.17.20.tgz",
      "integrity": "sha512-H3MHACvFUEiujabxhaI/ImO6gUrd8oOurg7LQtS7mbwIXA/cUqWrvBsaeJ23aZEPk1TAYkurjfMbSELfoCXlGA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/long": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@types/long/-/long-4.0.2.tgz",
      "integrity": "sha512-MqTGEo5bj5t157U6fA/BiDynNkn0YknVdh48CMPkTSpFTVmvao5UQmm7uEF6xBEo7qIMAlY/JSleYaE6VOdpaA==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/@types/mime": {
      "version": "1.3.5",
      "resolved": "https://registry.npmjs.org/@types/mime/-/mime-1.3.5.tgz",
      "integrity": "sha512-/pyBZWSLD2n0dcHE3hq8s8ZvcETHtEuF+3E7XVt0Ig2nvsVQXdghHVcEkIWjy9A0wKfTn97a/PSDYohKIlnP/w==",
      "license": "MIT"
    },
    "node_modules/@types/ms": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/@types/ms/-/ms-2.1.0.tgz",
      "integrity": "sha512-GsCCIZDE/p3i96vtEqx+7dBUGXrc7zeSK3wwPHIaRThS+9OhWIXRqzs4d6k1SVU8g91DrNRWxWUGhp5KXQb2VA==",
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "22.18.8",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-22.18.8.tgz",
      "integrity": "sha512-pAZSHMiagDR7cARo/cch1f3rXy0AEXwsVsVH09FcyeJVAzCnGgmYis7P3JidtTUjyadhTeSo8TgRPswstghDaw==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~6.21.0"
      }
    },
    "node_modules/@types/qs": {
      "version": "6.14.0",
      "resolved": "https://registry.npmjs.org/@types/qs/-/qs-6.14.0.tgz",
      "integrity": "sha512-eOunJqu0K1923aExK6y8p6fsihYEn/BYuQ4g0CxAAgFc4b/ZLN4CrsRZ55srTdqoiLzU2B2evC+apEIxprEzkQ==",
      "license": "MIT"
    },
    "node_modules/@types/range-parser": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/@types/range-parser/-/range-parser-1.2.7.tgz",
      "integrity": "sha512-hKormJbkJqzQGhziax5PItDUTMAM9uE2XXQmM37dyd4hVM+5aVl7oVxMVUiVQn2oCQFN/LKCZdvSM0pFRqbSmQ==",
      "license": "MIT"
    },
    "node_modules/@types/request": {
      "version": "2.48.13",
      "resolved": "https://registry.npmjs.org/@types/request/-/request-2.48.13.tgz",
      "integrity": "sha512-FGJ6udDNUCjd19pp0Q3iTiDkwhYup7J8hpMW9c4k53NrccQFFWKRho6hvtPPEhnXWKvukfwAlB6DbDz4yhH5Gg==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@types/caseless": "*",
        "@types/node": "*",
        "@types/tough-cookie": "*",
        "form-data": "^2.5.5"
      }
    },
    "node_modules/@types/semver": {
      "version": "7.7.1",
      "resolved": "https://registry.npmjs.org/@types/semver/-/semver-7.7.1.tgz",
      "integrity": "sha512-FmgJfu+MOcQ370SD0ev7EI8TlCAfKYU+B4m5T3yXc1CiRN94g/SZPtsCkk506aUDtlMnFZvasDwHHUcZUEaYuA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/send": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/@types/send/-/send-1.2.0.tgz",
      "integrity": "sha512-zBF6vZJn1IaMpg3xUF25VK3gd3l8zwE0ZLRX7dsQyQi+jp4E8mMDJNGDYnYse+bQhYwWERTxVwHpi3dMOq7RKQ==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/serve-static": {
      "version": "1.15.9",
      "resolved": "https://registry.npmjs.org/@types/serve-static/-/serve-static-1.15.9.tgz",
      "integrity": "sha512-dOTIuqpWLyl3BBXU3maNQsS4A3zuuoYRNIvYSxxhebPfXg2mzWQEPne/nlJ37yOse6uGgR386uTpdsx4D0QZWA==",
      "license": "MIT",
      "dependencies": {
        "@types/http-errors": "*",
        "@types/node": "*",
        "@types/send": "<1"
      }
    },
    "node_modules/@types/serve-static/node_modules/@types/send": {
      "version": "0.17.5",
      "resolved": "https://registry.npmjs.org/@types/send/-/send-0.17.5.tgz",
      "integrity": "sha512-z6F2D3cOStZvuk2SaP6YrwkNO65iTZcwA2ZkSABegdkAh/lf+Aa/YQndZVfmEXT5vgAp6zv06VQ3ejSVjAny4w==",
      "license": "MIT",
      "dependencies": {
        "@types/mime": "^1",
        "@types/node": "*"
      }
    },
    "node_modules/@types/stack-utils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/@types/stack-utils/-/stack-utils-2.0.3.tgz",
      "integrity": "sha512-9aEbYZ3TbYMznPdcdr3SmIrLXwC/AKZXQeCf9Pgao5CKb8CyHuEX5jzWPTkvregvhRJHcpRO6BFoGW9ycaOkYw==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@types/tough-cookie": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/@types/tough-cookie/-/tough-cookie-4.0.5.tgz",
      "integrity": "sha512-/Ad8+nIOV7Rl++6f1BdKxFSMgmoqEoYbHRpPcx3JEfv8VRsQe9Z4mCXeJBzxs7mbHY/XOZZuXlRNfhpVPbs6ZA==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/@types/yargs": {
      "version": "17.0.33",
      "resolved": "https://registry.npmjs.org/@types/yargs/-/yargs-17.0.33.tgz",
      "integrity": "sha512-WpxBCKWPLr4xSsHgz511rFJAM+wS28w2zEO1QDNY5zM/S8ok70NNfztH0xwhqKyaK0OHCbN98LDAZuy1ctxDkA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@types/yargs-parser": "*"
      }
    },
    "node_modules/@types/yargs-parser": {
      "version": "21.0.3",
      "resolved": "https://registry.npmjs.org/@types/yargs-parser/-/yargs-parser-21.0.3.tgz",
      "integrity": "sha512-I4q9QU9MQv4oEOz4tAHJtNz1cwuLxn2F3xcc2iV5WdqLPpUnj30aUuxt1mAxYTG+oe8CZMV/+6rU4S4gRDzqtQ==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@typescript-eslint/eslint-plugin": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/eslint-plugin/-/eslint-plugin-5.62.0.tgz",
      "integrity": "sha512-TiZzBSJja/LbhNPvk6yc0JrX9XqhQ0hdh6M2svYfsHGejaKFIAGd9MQ+ERIMzLGlN/kZoYIgdxFV0PuljTKXag==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/regexpp": "^4.4.0",
        "@typescript-eslint/scope-manager": "5.62.0",
        "@typescript-eslint/type-utils": "5.62.0",
        "@typescript-eslint/utils": "5.62.0",
        "debug": "^4.3.4",
        "graphemer": "^1.4.0",
        "ignore": "^5.2.0",
        "natural-compare-lite": "^1.4.0",
        "semver": "^7.3.7",
        "tsutils": "^3.21.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "@typescript-eslint/parser": "^5.0.0",
        "eslint": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/parser": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/parser/-/parser-5.62.0.tgz",
      "integrity": "sha512-VlJEV0fOQ7BExOsHYAGrgbEiZoi8D+Bl2+f6V2RrXerRSylnp+ZBHmPvaIa8cz0Ajx7WO7Z5RqfgYg7ED1nRhA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "@typescript-eslint/scope-manager": "5.62.0",
        "@typescript-eslint/types": "5.62.0",
        "@typescript-eslint/typescript-estree": "5.62.0",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || ^8.0.0"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/scope-manager": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-5.62.0.tgz",
      "integrity": "sha512-VXuvVvZeQCQb5Zgf4HAxc04q5j+WrNAtNh9OwCsCgpKqESMTu3tF/jhZ3xG6T4NZwWl65Bg8KuS2uEvhSfLl0w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "5.62.0",
        "@typescript-eslint/visitor-keys": "5.62.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/type-utils": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/type-utils/-/type-utils-5.62.0.tgz",
      "integrity": "sha512-xsSQreu+VnfbqQpW5vnCJdq1Z3Q0U31qiWmRhr98ONQmcp/yhiPJFPq8MXiJVLiksmOKSjIldZzkebzHuCGzew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/typescript-estree": "5.62.0",
        "@typescript-eslint/utils": "5.62.0",
        "debug": "^4.3.4",
        "tsutils": "^3.21.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "*"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/types": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/types/-/types-5.62.0.tgz",
      "integrity": "sha512-87NVngcbVXUahrRTqIK27gD2t5Cu1yuCXxbLcFtCzZGlfyVWWh8mLHkoxzjsB6DDNnvdL+fW8MiwPEJyGJQDgQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-5.62.0.tgz",
      "integrity": "sha512-CmcQ6uY7b9y694lKdRB8FEel7JbU/40iSAPomu++SjLMntB+2Leay2LO6i8VnJk58MtE9/nQSFIH6jpyRWyYzA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "@typescript-eslint/types": "5.62.0",
        "@typescript-eslint/visitor-keys": "5.62.0",
        "debug": "^4.3.4",
        "globby": "^11.1.0",
        "is-glob": "^4.0.3",
        "semver": "^7.3.7",
        "tsutils": "^3.21.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@typescript-eslint/utils": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/utils/-/utils-5.62.0.tgz",
      "integrity": "sha512-n8oxjeb5aIbPFEtmQxQYOLI0i9n5ySBEY/ZEHHZqKQSFnxio1rv6dthascc9dLuwrL0RC5mPCxB7vnAVGAYWAQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.2.0",
        "@types/json-schema": "^7.0.9",
        "@types/semver": "^7.3.12",
        "@typescript-eslint/scope-manager": "5.62.0",
        "@typescript-eslint/types": "5.62.0",
        "@typescript-eslint/typescript-estree": "5.62.0",
        "eslint-scope": "^5.1.1",
        "semver": "^7.3.7"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys": {
      "version": "5.62.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-5.62.0.tgz",
      "integrity": "sha512-07ny+LHRzQXepkGg6w0mFY41fVUNBrL2Roj/++7V1txKugfjm/Ci/qSND03r2RhlJhJYMcTn9AhhSSqQp0Ysyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "5.62.0",
        "eslint-visitor-keys": "^3.3.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@ungap/structured-clone": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/@ungap/structured-clone/-/structured-clone-1.3.0.tgz",
      "integrity": "sha512-WmoN8qaIAo7WTYWbAZuG8PYEhn5fkz7dZrqTBZ7dtt//lL2Gwms1IcnQ5yHqjDfX8Ft5j4YzDM23f87zBfDe9g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/@unrs/resolver-binding-android-arm-eabi": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-android-arm-eabi/-/resolver-binding-android-arm-eabi-1.11.1.tgz",
      "integrity": "sha512-ppLRUgHVaGRWUx0R0Ut06Mjo9gBaBkg3v/8AxusGLhsIotbBLuRk51rAzqLC8gq6NyyAojEXglNjzf6R948DNw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-android-arm64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-android-arm64/-/resolver-binding-android-arm64-1.11.1.tgz",
      "integrity": "sha512-lCxkVtb4wp1v+EoN+HjIG9cIIzPkX5OtM03pQYkG+U5O/wL53LC4QbIeazgiKqluGeVEeBlZahHalCaBvU1a2g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-darwin-arm64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-darwin-arm64/-/resolver-binding-darwin-arm64-1.11.1.tgz",
      "integrity": "sha512-gPVA1UjRu1Y/IsB/dQEsp2V1pm44Of6+LWvbLc9SDk1c2KhhDRDBUkQCYVWe6f26uJb3fOK8saWMgtX8IrMk3g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-darwin-x64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-darwin-x64/-/resolver-binding-darwin-x64-1.11.1.tgz",
      "integrity": "sha512-cFzP7rWKd3lZaCsDze07QX1SC24lO8mPty9vdP+YVa3MGdVgPmFc59317b2ioXtgCMKGiCLxJ4HQs62oz6GfRQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-freebsd-x64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-freebsd-x64/-/resolver-binding-freebsd-x64-1.11.1.tgz",
      "integrity": "sha512-fqtGgak3zX4DCB6PFpsH5+Kmt/8CIi4Bry4rb1ho6Av2QHTREM+47y282Uqiu3ZRF5IQioJQ5qWRV6jduA+iGw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-arm-gnueabihf": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-gnueabihf/-/resolver-binding-linux-arm-gnueabihf-1.11.1.tgz",
      "integrity": "sha512-u92mvlcYtp9MRKmP+ZvMmtPN34+/3lMHlyMj7wXJDeXxuM0Vgzz0+PPJNsro1m3IZPYChIkn944wW8TYgGKFHw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-arm-musleabihf": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-musleabihf/-/resolver-binding-linux-arm-musleabihf-1.11.1.tgz",
      "integrity": "sha512-cINaoY2z7LVCrfHkIcmvj7osTOtm6VVT16b5oQdS4beibX2SYBwgYLmqhBjA1t51CarSaBuX5YNsWLjsqfW5Cw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-arm64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-gnu/-/resolver-binding-linux-arm64-gnu-1.11.1.tgz",
      "integrity": "sha512-34gw7PjDGB9JgePJEmhEqBhWvCiiWCuXsL9hYphDF7crW7UgI05gyBAi6MF58uGcMOiOqSJ2ybEeCvHcq0BCmQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-arm64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-musl/-/resolver-binding-linux-arm64-musl-1.11.1.tgz",
      "integrity": "sha512-RyMIx6Uf53hhOtJDIamSbTskA99sPHS96wxVE/bJtePJJtpdKGXO1wY90oRdXuYOGOTuqjT8ACccMc4K6QmT3w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-ppc64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-ppc64-gnu/-/resolver-binding-linux-ppc64-gnu-1.11.1.tgz",
      "integrity": "sha512-D8Vae74A4/a+mZH0FbOkFJL9DSK2R6TFPC9M+jCWYia/q2einCubX10pecpDiTmkJVUH+y8K3BZClycD8nCShA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-riscv64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-gnu/-/resolver-binding-linux-riscv64-gnu-1.11.1.tgz",
      "integrity": "sha512-frxL4OrzOWVVsOc96+V3aqTIQl1O2TjgExV4EKgRY09AJ9leZpEg8Ak9phadbuX0BA4k8U5qtvMSQQGGmaJqcQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-riscv64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-musl/-/resolver-binding-linux-riscv64-musl-1.11.1.tgz",
      "integrity": "sha512-mJ5vuDaIZ+l/acv01sHoXfpnyrNKOk/3aDoEdLO/Xtn9HuZlDD6jKxHlkN8ZhWyLJsRBxfv9GYM2utQ1SChKew==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-s390x-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-s390x-gnu/-/resolver-binding-linux-s390x-gnu-1.11.1.tgz",
      "integrity": "sha512-kELo8ebBVtb9sA7rMe1Cph4QHreByhaZ2QEADd9NzIQsYNQpt9UkM9iqr2lhGr5afh885d/cB5QeTXSbZHTYPg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-x64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-gnu/-/resolver-binding-linux-x64-gnu-1.11.1.tgz",
      "integrity": "sha512-C3ZAHugKgovV5YvAMsxhq0gtXuwESUKc5MhEtjBpLoHPLYM+iuwSj3lflFwK3DPm68660rZ7G8BMcwSro7hD5w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-linux-x64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-musl/-/resolver-binding-linux-x64-musl-1.11.1.tgz",
      "integrity": "sha512-rV0YSoyhK2nZ4vEswT/QwqzqQXw5I6CjoaYMOX0TqBlWhojUf8P94mvI7nuJTeaCkkds3QE4+zS8Ko+GdXuZtA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-wasm32-wasi": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-wasm32-wasi/-/resolver-binding-wasm32-wasi-1.11.1.tgz",
      "integrity": "sha512-5u4RkfxJm+Ng7IWgkzi3qrFOvLvQYnPBmjmZQ8+szTK/b31fQCnleNl1GgEt7nIsZRIf5PLhPwT0WM+q45x/UQ==",
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "peer": true,
      "dependencies": {
        "@napi-rs/wasm-runtime": "^0.2.11"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@unrs/resolver-binding-win32-arm64-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-arm64-msvc/-/resolver-binding-win32-arm64-msvc-1.11.1.tgz",
      "integrity": "sha512-nRcz5Il4ln0kMhfL8S3hLkxI85BXs3o8EYoattsJNdsX4YUU89iOkVn7g0VHSRxFuVMdM4Q1jEpIId1Ihim/Uw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-win32-ia32-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-ia32-msvc/-/resolver-binding-win32-ia32-msvc-1.11.1.tgz",
      "integrity": "sha512-DCEI6t5i1NmAZp6pFonpD5m7i6aFrpofcp4LA2i8IIq60Jyo28hamKBxNrZcyOwVOZkgsRp9O2sXWBWP8MnvIQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "peer": true
    },
    "node_modules/@unrs/resolver-binding-win32-x64-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-x64-msvc/-/resolver-binding-win32-x64-msvc-1.11.1.tgz",
      "integrity": "sha512-lrW200hZdbfRtztbygyaq/6jP6AKE8qQN2KvPcJ+x7wiD038YtnYtZ82IMNJ69GJibV7bwL3y9FgK+5w/pYt6g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "peer": true
    },
    "node_modules/abort-controller": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz",
      "integrity": "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "event-target-shim": "^5.0.0"
      },
      "engines": {
        "node": ">=6.5"
      }
    },
    "node_modules/accepts": {
      "version": "1.3.8",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz",
      "integrity": "sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "~2.1.34",
        "negotiator": "0.6.3"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/acorn": {
      "version": "8.15.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.15.0.tgz",
      "integrity": "sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/ajv": {
      "version": "6.12.6",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.12.6.tgz",
      "integrity": "sha512-j3fVLgvTo527anyYyJOGTYJbG+vnnQYvE0m5mmkc1TK+nxAppkCLMIL0aZ4dblVCNoGShhm+kzE4ZUykBoMg4g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-escapes": {
      "version": "4.3.2",
      "resolved": "https://registry.npmjs.org/ansi-escapes/-/ansi-escapes-4.3.2.tgz",
      "integrity": "sha512-gKXj5ALrKWQLsYG9jlTRmR/xKluxHV+Z9QEwNIgCfM1/uwPMCuzVVnh5mwTd+OuBZcwSIMbqssNWRm1lE51QaQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "type-fest": "^0.21.3"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/ansi-escapes/node_modules/type-fest": {
      "version": "0.21.3",
      "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.21.3.tgz",
      "integrity": "sha512-t0rzBq87m3fVcduHDUFhKmyyX+9eo6WQjZvf51Ea/M0Q7+T374Jp1aUiyUl0GKxp8M/OETVHSDvmkyPgvX+X2w==",
      "dev": true,
      "license": "(MIT OR CC0-1.0)",
      "peer": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true,
      "license": "Python-2.0"
    },
    "node_modules/array-buffer-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/array-buffer-byte-length/-/array-buffer-byte-length-1.0.2.tgz",
      "integrity": "sha512-LHE+8BuR7RYGDKvnrmcuSq3tDcKv9OFEXQt/HpbZhY7V6h0zlUXutnAD82GiFx9rdieCMjkvtcsPqBwgUl1Iiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "is-array-buffer": "^3.0.5"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array-flatten": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/array-flatten/-/array-flatten-1.1.1.tgz",
      "integrity": "sha512-PCVAQswWemu6UdxsDFFX/+gVeYqKAod3D3UVm91jHwynguOwAvYPhx8nNlM++NqRcK6CxxpUafjmhIdKiHibqg==",
      "license": "MIT"
    },
    "node_modules/array-includes": {
      "version": "3.1.9",
      "resolved": "https://registry.npmjs.org/array-includes/-/array-includes-3.1.9.tgz",
      "integrity": "sha512-FmeCCAenzH0KH381SPT5FZmiA/TmpndpcaShhfgEN9eCVjnFBqq3l1xrI42y8+PPLI6hypzou4GXw00WHmPBLQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.24.0",
        "es-object-atoms": "^1.1.1",
        "get-intrinsic": "^1.3.0",
        "is-string": "^1.1.1",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array-union": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/array-union/-/array-union-2.1.0.tgz",
      "integrity": "sha512-HGyxoOTYUyCM6stUe6EJgnd4EoewAI7zMdfqO+kGjnlZmBDz/cR5pf8r/cR4Wq60sL/p0IkcjUEEPwS3GFrIyw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/array.prototype.findlastindex": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/array.prototype.findlastindex/-/array.prototype.findlastindex-1.2.6.tgz",
      "integrity": "sha512-F/TKATkzseUExPlfvmwQKGITM3DGTK+vkAsCZoDc5daVygbJBnjEUCbgkAvVFsgfXfX4YIqZ/27G3k3tdXrTxQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.9",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "es-shim-unscopables": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.flat": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/array.prototype.flat/-/array.prototype.flat-1.3.3.tgz",
      "integrity": "sha512-rwG/ja1neyLqCuGZ5YYrznA62D4mZXg0i1cIskIUKSiqF3Cje9/wXAls9B9s1Wa2fomMsIv8czB8jZcPmxCXFg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.flatmap": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/array.prototype.flatmap/-/array.prototype.flatmap-1.3.3.tgz",
      "integrity": "sha512-Y7Wt51eKJSyi80hFrJCePGGNo5ktJCslFuboqJsbf57CCPcm5zztluPlc4/aD8sWsKvlwatezpV4U1efk8kpjg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/arraybuffer.prototype.slice": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/arraybuffer.prototype.slice/-/arraybuffer.prototype.slice-1.0.4.tgz",
      "integrity": "sha512-BNoCY6SXXPQ7gF2opIP4GBE+Xw7U+pHMYKuzjgCN3GwiaIR09UUeKfheyIry77QtrCBlC0KK0q5/TER/tYh3PQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.1",
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "is-array-buffer": "^3.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/arrify": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/arrify/-/arrify-2.0.1.tgz",
      "integrity": "sha512-3duEwti880xqi4eAMN8AyR4a0ByT90zoYdLlevfrvU43vb0YZwZVfxOgxWrLXXXpyugL0hNZc9G6BiB5B3nUug==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/async-function": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/async-function/-/async-function-1.0.0.tgz",
      "integrity": "sha512-hsU18Ae8CDTR6Kgu9DYf0EbCr/a5iGL0rytQDobUcdpYOKokk8LEjVphnXkDkgpi0wYVsqrXuP0bZxJaTqdgoA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/async-retry": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/async-retry/-/async-retry-1.3.3.tgz",
      "integrity": "sha512-wfr/jstw9xNi/0teMHrRW7dsz3Lt5ARhYNZ2ewpadnhaIp5mbALhOAP+EAdsC7t4Z6wqsDVv9+W6gm1Dk9mEyw==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "retry": "0.13.1"
      }
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/available-typed-arrays": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz",
      "integrity": "sha512-wvUjBtSGN7+7SjNpq/9M2Tg350UZD3q62IFZLbRAR1bSMlCo1ZaeW+BJ+D090e4hIIZLBcTDWe4Mh4jvUDajzQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "possible-typed-array-names": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/babel-jest": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/babel-jest/-/babel-jest-30.2.0.tgz",
      "integrity": "sha512-0YiBEOxWqKkSQWL9nNGGEgndoeL0ZpWrbLMNL5u/Kaxrli3Eaxlt3ZtIDktEvXt4L/R9r3ODr2zKwGM/2BjxVw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/transform": "30.2.0",
        "@types/babel__core": "^7.20.5",
        "babel-plugin-istanbul": "^7.0.1",
        "babel-preset-jest": "30.2.0",
        "chalk": "^4.1.2",
        "graceful-fs": "^4.2.11",
        "slash": "^3.0.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.11.0 || ^8.0.0-0"
      }
    },
    "node_modules/babel-plugin-istanbul": {
      "version": "7.0.1",
      "resolved": "https://registry.npmjs.org/babel-plugin-istanbul/-/babel-plugin-istanbul-7.0.1.tgz",
      "integrity": "sha512-D8Z6Qm8jCvVXtIRkBnqNHX0zJ37rQcFJ9u8WOS6tkYOsRdHBzypCstaxWiu5ZIlqQtviRYbgnRLSoCEvjqcqbA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "peer": true,
      "workspaces": [
        "test/babel-8"
      ],
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.0.0",
        "@istanbuljs/load-nyc-config": "^1.0.0",
        "@istanbuljs/schema": "^0.1.3",
        "istanbul-lib-instrument": "^6.0.2",
        "test-exclude": "^6.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/babel-plugin-jest-hoist": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/babel-plugin-jest-hoist/-/babel-plugin-jest-hoist-30.2.0.tgz",
      "integrity": "sha512-ftzhzSGMUnOzcCXd6WHdBGMyuwy15Wnn0iyyWGKgBDLxf9/s5ABuraCSpBX2uG0jUg4rqJnxsLc5+oYBqoxVaA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@types/babel__core": "^7.20.5"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/babel-preset-current-node-syntax": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/babel-preset-current-node-syntax/-/babel-preset-current-node-syntax-1.2.0.tgz",
      "integrity": "sha512-E/VlAEzRrsLEb2+dv8yp3bo4scof3l9nR4lrld+Iy5NyVqgVYUJnDAmunkhPMisRI32Qc4iRiz425d8vM++2fg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/plugin-syntax-async-generators": "^7.8.4",
        "@babel/plugin-syntax-bigint": "^7.8.3",
        "@babel/plugin-syntax-class-properties": "^7.12.13",
        "@babel/plugin-syntax-class-static-block": "^7.14.5",
        "@babel/plugin-syntax-import-attributes": "^7.24.7",
        "@babel/plugin-syntax-import-meta": "^7.10.4",
        "@babel/plugin-syntax-json-strings": "^7.8.3",
        "@babel/plugin-syntax-logical-assignment-operators": "^7.10.4",
        "@babel/plugin-syntax-nullish-coalescing-operator": "^7.8.3",
        "@babel/plugin-syntax-numeric-separator": "^7.10.4",
        "@babel/plugin-syntax-object-rest-spread": "^7.8.3",
        "@babel/plugin-syntax-optional-catch-binding": "^7.8.3",
        "@babel/plugin-syntax-optional-chaining": "^7.8.3",
        "@babel/plugin-syntax-private-property-in-object": "^7.14.5",
        "@babel/plugin-syntax-top-level-await": "^7.14.5"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0 || ^8.0.0-0"
      }
    },
    "node_modules/babel-preset-jest": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/babel-preset-jest/-/babel-preset-jest-30.2.0.tgz",
      "integrity": "sha512-US4Z3NOieAQumwFnYdUWKvUKh8+YSnS/gB3t6YBiz0bskpu7Pine8pPCheNxlPEW4wnUkma2a94YuW2q3guvCQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "babel-plugin-jest-hoist": "30.2.0",
        "babel-preset-current-node-syntax": "^1.2.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.11.0 || ^8.0.0-beta.1"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/base64-js": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
      "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "optional": true
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.8.14",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.8.14.tgz",
      "integrity": "sha512-GM9c0cWWR8Ga7//Ves/9KRgTS8nLausCkP3CGiFLrnwA2CDUluXgaQqvrULoR2Ujrd/mz/lkX87F5BHFsNr5sQ==",
      "dev": true,
      "license": "Apache-2.0",
      "peer": true,
      "bin": {
        "baseline-browser-mapping": "dist/cli.js"
      }
    },
    "node_modules/bignumber.js": {
      "version": "9.3.1",
      "resolved": "https://registry.npmjs.org/bignumber.js/-/bignumber.js-9.3.1.tgz",
      "integrity": "sha512-Ko0uX15oIUS7wJ3Rb30Fs6SkVbLmPBAKdlm7q9+ak9bbIeFf0MwuBsQV6z7+X768/cHsfg+WlysDWJcmthjsjQ==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": "*"
      }
    },
    "node_modules/body-parser": {
      "version": "1.20.3",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-1.20.3.tgz",
      "integrity": "sha512-7rAxByjUMqQ3/bHJy7D6OGXvx/MMc4IqBn/X0fcM1QUcAItpZrBEYhWGem+tzXH90c+G01ypMcYJBO9Y30203g==",
      "license": "MIT",
      "dependencies": {
        "bytes": "3.1.2",
        "content-type": "~1.0.5",
        "debug": "2.6.9",
        "depd": "2.0.0",
        "destroy": "1.2.0",
        "http-errors": "2.0.0",
        "iconv-lite": "0.4.24",
        "on-finished": "2.4.1",
        "qs": "6.13.0",
        "raw-body": "2.5.2",
        "type-is": "~1.6.18",
        "unpipe": "1.0.0"
      },
      "engines": {
        "node": ">= 0.8",
        "npm": "1.2.8000 || >= 1.4.16"
      }
    },
    "node_modules/body-parser/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/body-parser/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/brace-expansion": {
      "version": "1.1.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.12.tgz",
      "integrity": "sha512-9T9UjW3r0UW5c1Q7GTwllptXwhvYmEzFhzMfZ9H7FQWt+uZePjZPjBP/W1ZEyZ1twGWom5/56TF4lPcqjnDHcg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.26.3",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.26.3.tgz",
      "integrity": "sha512-lAUU+02RFBuCKQPj/P6NgjlbCnLBMp4UtgTx7vNHd3XSIJF87s9a5rA3aH2yw3GS9DqZAUbOtZdCCiZeVRqt0w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "baseline-browser-mapping": "^2.8.9",
        "caniuse-lite": "^1.0.30001746",
        "electron-to-chromium": "^1.5.227",
        "node-releases": "^2.0.21",
        "update-browserslist-db": "^1.1.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/bser": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/bser/-/bser-2.1.1.tgz",
      "integrity": "sha512-gQxTNE/GAfIIrmHLUE3oJyp5FO6HRBfhjnw4/wMmA63ZGDJnWBmgY/lyQBpnDUkGmAhbSe39tx2d/iTOAfglwQ==",
      "dev": true,
      "license": "Apache-2.0",
      "peer": true,
      "dependencies": {
        "node-int64": "^0.4.0"
      }
    },
    "node_modules/buffer-equal-constant-time": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/buffer-equal-constant-time/-/buffer-equal-constant-time-1.0.1.tgz",
      "integrity": "sha512-zRpUiDwd/xk6ADqPMATG8vc9VPrkck7T07OIx0gnjmJAnHnTVXNQG3vfvWNuiZIkwu9KrKdA1iJKfsfTVxE6NA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/buffer-from": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/buffer-from/-/buffer-from-1.1.2.tgz",
      "integrity": "sha512-E+XQCRwSbaaiChtv6k6Dwgc+bx+Bs6vuKJHHl5kox/BaKbhiXzqQOwK4cO22yElGp2OCmjwVhT3HmxgyPGnJfQ==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/call-bind/-/call-bind-1.0.8.tgz",
      "integrity": "sha512-oKlSFMcMwpUg2ednkhQ454wfWiU/ul3CkJe/PEHcTKuiX6RpbehUiFMXu13HalGZxfUwCQzZG747YXBn1im9ww==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.0",
        "es-define-property": "^1.0.0",
        "get-intrinsic": "^1.2.4",
        "set-function-length": "^1.2.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/camelcase": {
      "version": "5.3.1",
      "resolved": "https://registry.npmjs.org/camelcase/-/camelcase-5.3.1.tgz",
      "integrity": "sha512-L28STB170nwWS63UjtlEOE3dldQApaJXZkOI1uMFfzf3rRuPegHaHesyee+YxQ+W6SvRDQV6UrdOdRiR153wJg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001749",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001749.tgz",
      "integrity": "sha512-0rw2fJOmLfnzCRbkm8EyHL8SvI2Apu5UbnQuTsJ0ClgrH8hcwFooJ1s5R0EP8o8aVrFu8++ae29Kt9/gZAZp/Q==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0",
      "peer": true
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/char-regex": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/char-regex/-/char-regex-1.0.2.tgz",
      "integrity": "sha512-kWWXztvZ5SBQV+eRgKFeh8q5sLuZY2+8WUIzlxWVTg+oGwY14qylx1KbKzHd8P6ZYkAg0xyIDU9JMHhyJMZ1jw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/ci-info": {
      "version": "4.3.1",
      "resolved": "https://registry.npmjs.org/ci-info/-/ci-info-4.3.1.tgz",
      "integrity": "sha512-Wdy2Igu8OcBpI2pZePZ5oWjPC38tmDVx5WKUXKwlLYkA0ozo85sLsLvkBbBn/sZaSCMFOGZJ14fvW9t5/d7kdA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/sibiraj-s"
        }
      ],
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/cjs-module-lexer": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/cjs-module-lexer/-/cjs-module-lexer-2.1.0.tgz",
      "integrity": "sha512-UX0OwmYRYQQetfrLEZeewIFFI+wSTofC+pMBLNuH3RUuu/xzG1oz84UCEDOSoQlN3fZ4+AzmV50ZYvGqkMh9yA==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/cliui": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz",
      "integrity": "sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==",
      "devOptional": true,
      "license": "ISC",
      "dependencies": {
        "string-width": "^4.2.0",
        "strip-ansi": "^6.0.1",
        "wrap-ansi": "^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/cliui/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/cliui/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/cliui/node_modules/wrap-ansi": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/co": {
      "version": "4.6.0",
      "resolved": "https://registry.npmjs.org/co/-/co-4.6.0.tgz",
      "integrity": "sha512-QVb0dM5HvG+uaxitm8wONl7jltx8dqhfU33DcqtOZcLSVIKSDDLDi7+0LbAKiyI8hD9u42m2YxXSkMGWThaecQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "iojs": ">= 1.0.0",
        "node": ">= 0.12.0"
      }
    },
    "node_modules/collect-v8-coverage": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/collect-v8-coverage/-/collect-v8-coverage-1.0.2.tgz",
      "integrity": "sha512-lHl4d5/ONEbLlJvaJNtsF/Lz+WvB07u2ycqTYbdrq7UypDXailES4valYb2eWiJFxZlVmpGekfqoxQhzyFdT4Q==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/content-disposition": {
      "version": "0.5.4",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-0.5.4.tgz",
      "integrity": "sha512-FveZTNuGw04cxlAiWbzi6zTAL/lhehaWbTtgluJh4/E95DqMwTmha3KZN1aAWA8cFIhHzMZUvLevkw5Rqk+tSQ==",
      "license": "MIT",
      "dependencies": {
        "safe-buffer": "5.2.1"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/content-type": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
      "integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/cookie": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.1.tgz",
      "integrity": "sha512-6DnInpx7SJ2AK3+CTUE/ZM0vWTUboZCegxhC2xiIydHR9jNuTAASBrfEpHhiGOZw/nX51bHt6YQl8jsGo4y/0w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.6.tgz",
      "integrity": "sha512-QADzlaHc8icV8I7vbaJXJwod9HWYp8uCqf1xa4OfNu1T7JVxQIrUgOWtHdNDtPiywmFbiS12VjotIXLrKM3orQ==",
      "license": "MIT"
    },
    "node_modules/cors": {
      "version": "2.8.5",
      "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.5.tgz",
      "integrity": "sha512-KIHbLJqu73RGr/hnbrO9uBeixNGuvSQjul/jdFvS/KFSIH1hWVd1ng7zOHx+YrEfInLG7q4n6GHQ9cDtxv/P6g==",
      "license": "MIT",
      "dependencies": {
        "object-assign": "^4",
        "vary": "^1"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/data-view-buffer": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-buffer/-/data-view-buffer-1.0.2.tgz",
      "integrity": "sha512-EmKO5V3OLXh1rtK2wgXRansaK1/mtVdTUEiEI0W8RkvgT05kfxaH29PliLnpLP73yYO6142Q72QNa8Wx/A5CqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/data-view-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-byte-length/-/data-view-byte-length-1.0.2.tgz",
      "integrity": "sha512-tuhGbE6CfTM9+5ANGf+oQb72Ky/0+s3xKUpHvShfiz2RxMFgFPjsXuRLBVMtvMs15awe45SRb83D6wH4ew6wlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/inspect-js"
      }
    },
    "node_modules/data-view-byte-offset": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/data-view-byte-offset/-/data-view-byte-offset-1.0.1.tgz",
      "integrity": "sha512-BS8PfmtDGnrgYdOonGZQdLZslWIeCGFP9tpan0hi1Co2Zr2NKADsvGYA8XxuG/4UWgJ6Cjtv+YJnB6MM69QGlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/dedent": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/dedent/-/dedent-1.7.0.tgz",
      "integrity": "sha512-HGFtf8yhuhGhqO07SV79tRp+br4MnbdjeVxotpn1QBl30pcLLCQjX5b2295ll0fv8RKDKsmWYrl05usHM9CewQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "peerDependencies": {
        "babel-plugin-macros": "^3.1.0"
      },
      "peerDependenciesMeta": {
        "babel-plugin-macros": {
          "optional": true
        }
      }
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/deepmerge": {
      "version": "4.3.1",
      "resolved": "https://registry.npmjs.org/deepmerge/-/deepmerge-4.3.1.tgz",
      "integrity": "sha512-3sUqbMEc77XqpdNO7FRyRog+eW3ph+GYCbj+rK+uYyRMuwsVy0rMiVtPn+QJlKFvWP/1PYpapqYn0Me2knFn+A==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/define-data-property": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/define-data-property/-/define-data-property-1.1.4.tgz",
      "integrity": "sha512-rBMvIzlpA8v6E+SJZoo++HAYqsLrkg7MSfIinMPFhmkorw7X+dOXVJQs+QT69zGkzMyfDnIMN2Wid1+NbL3T+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0",
        "es-errors": "^1.3.0",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/define-properties": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/define-properties/-/define-properties-1.2.1.tgz",
      "integrity": "sha512-8QmQKqEASLd5nx0U1B1okLElbUuuttJ/AnYmRXbbbGDWh6uS208EjD4Xqq/I9wK7u0v6O08XhTWnt5XtEbR6Dg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.0.1",
        "has-property-descriptors": "^1.0.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/destroy": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/destroy/-/destroy-1.2.0.tgz",
      "integrity": "sha512-2sJGJTaXIIaR1w4iJSNoN0hnMY7Gpc/n8D4qSCJw8QqFWXf7cuAgnEHxBpweaVcPevC2l3KpjYCx3NypQQgaJg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8",
        "npm": "1.2.8000 || >= 1.4.16"
      }
    },
    "node_modules/detect-newline": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/detect-newline/-/detect-newline-3.1.0.tgz",
      "integrity": "sha512-TLz+x/vEXm/Y7P7wn1EJFNLxYpUD4TgMosxY6fAVJUnJMbupHBOncxyWUG9OpTaH9EBD7uFI5LfEgmMOc54DsA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/dir-glob": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/dir-glob/-/dir-glob-3.0.1.tgz",
      "integrity": "sha512-WkrWp9GR4KXfKGYzOLmTuGVi1UWFfws377n9cc55/tb6DuqyF6pcQ5AbiHEshaDpY9v6oaSr2XCDidGmMwdzIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-type": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/doctrine": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/doctrine/-/doctrine-3.0.0.tgz",
      "integrity": "sha512-yS+Q5i3hBf7GBkd4KG8a7eBNNWNGLTaEwwYWUijIYM7zrlYDM0BFXHjjPWlWZ1Rg7UaddZeIDmi9jF3HmqiQ2w==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "esutils": "^2.0.2"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/duplexify": {
      "version": "4.1.3",
      "resolved": "https://registry.npmjs.org/duplexify/-/duplexify-4.1.3.tgz",
      "integrity": "sha512-M3BmBhwJRZsSx38lZyhE53Csddgzl5R7xGJNk7CVddZD6CcmwMCH8J+7AprIrQKH7TonKxaCjcv27Qmf+sQ+oA==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "end-of-stream": "^1.4.1",
        "inherits": "^2.0.3",
        "readable-stream": "^3.1.1",
        "stream-shift": "^1.0.2"
      }
    },
    "node_modules/eastasianwidth": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/eastasianwidth/-/eastasianwidth-0.2.0.tgz",
      "integrity": "sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/ecdsa-sig-formatter": {
      "version": "1.0.11",
      "resolved": "https://registry.npmjs.org/ecdsa-sig-formatter/-/ecdsa-sig-formatter-1.0.11.tgz",
      "integrity": "sha512-nagl3RYrbNv6kQkeJIpt6NJZy8twLB/2vtz6yN9Z4vRKHN4/QZJIEbqohALSgwKdnksuY3k5Addp5lg8sVoVcQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.233",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.233.tgz",
      "integrity": "sha512-iUdTQSf7EFXsDdQsp8MwJz5SVk4APEFqXU/S47OtQ0YLqacSwPXdZ5vRlMX3neb07Cy2vgioNuRnWUXFwuslkg==",
      "dev": true,
      "license": "ISC",
      "peer": true
    },
    "node_modules/emittery": {
      "version": "0.13.1",
      "resolved": "https://registry.npmjs.org/emittery/-/emittery-0.13.1.tgz",
      "integrity": "sha512-DeWwawk6r5yR9jFgnDKYt4sLS0LmHJJi3ZOnb5/JdbYwj3nW+FxQnHIjhBKz8YLC7oRNPVM9NQ47I3CVx34eqQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sindresorhus/emittery?sponsor=1"
      }
    },
    "node_modules/emoji-regex": {
      "version": "9.2.2",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
      "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/end-of-stream": {
      "version": "1.4.5",
      "resolved": "https://registry.npmjs.org/end-of-stream/-/end-of-stream-1.4.5.tgz",
      "integrity": "sha512-ooEGc6HP26xXq/N+GCGOT0JKCLDGrq2bQUZrQ7gyrJiZANJ/8YDTxTpQBXGMn+WbIQXNVpyWymm7KYVICQnyOg==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "once": "^1.4.0"
      }
    },
    "node_modules/error-ex": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/error-ex/-/error-ex-1.3.4.tgz",
      "integrity": "sha512-sqQamAnR14VgCr1A618A3sGrygcpK+HEbenA/HiEAkkUwcZIIB/tgWqHFxWgOyDh4nB4JCRimh79dR5Ywc9MDQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "is-arrayish": "^0.2.1"
      }
    },
    "node_modules/es-abstract": {
      "version": "1.24.0",
      "resolved": "https://registry.npmjs.org/es-abstract/-/es-abstract-1.24.0.tgz",
      "integrity": "sha512-WSzPgsdLtTcQwm4CROfS5ju2Wa1QQcVeT37jFjYzdFz1r9ahadC8B8/a4qxJxM+09F18iumCdRmlr96ZYkQvEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.2",
        "arraybuffer.prototype.slice": "^1.0.4",
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "data-view-buffer": "^1.0.2",
        "data-view-byte-length": "^1.0.2",
        "data-view-byte-offset": "^1.0.1",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "es-set-tostringtag": "^2.1.0",
        "es-to-primitive": "^1.3.0",
        "function.prototype.name": "^1.1.8",
        "get-intrinsic": "^1.3.0",
        "get-proto": "^1.0.1",
        "get-symbol-description": "^1.1.0",
        "globalthis": "^1.0.4",
        "gopd": "^1.2.0",
        "has-property-descriptors": "^1.0.2",
        "has-proto": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "internal-slot": "^1.1.0",
        "is-array-buffer": "^3.0.5",
        "is-callable": "^1.2.7",
        "is-data-view": "^1.0.2",
        "is-negative-zero": "^2.0.3",
        "is-regex": "^1.2.1",
        "is-set": "^2.0.3",
        "is-shared-array-buffer": "^1.0.4",
        "is-string": "^1.1.1",
        "is-typed-array": "^1.1.15",
        "is-weakref": "^1.1.1",
        "math-intrinsics": "^1.1.0",
        "object-inspect": "^1.13.4",
        "object-keys": "^1.1.1",
        "object.assign": "^4.1.7",
        "own-keys": "^1.0.1",
        "regexp.prototype.flags": "^1.5.4",
        "safe-array-concat": "^1.1.3",
        "safe-push-apply": "^1.0.0",
        "safe-regex-test": "^1.1.0",
        "set-proto": "^1.0.0",
        "stop-iteration-iterator": "^1.1.0",
        "string.prototype.trim": "^1.2.10",
        "string.prototype.trimend": "^1.0.9",
        "string.prototype.trimstart": "^1.0.8",
        "typed-array-buffer": "^1.0.3",
        "typed-array-byte-length": "^1.0.3",
        "typed-array-byte-offset": "^1.0.4",
        "typed-array-length": "^1.0.7",
        "unbox-primitive": "^1.1.0",
        "which-typed-array": "^1.1.19"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-shim-unscopables": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/es-shim-unscopables/-/es-shim-unscopables-1.1.0.tgz",
      "integrity": "sha512-d9T8ucsEhh8Bi1woXCf+TIKDIROLG5WCkxg8geBCbvk22kzwC5G2OnXVMO6FUsvQlgUUXQ2itephWDLqDzbeCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-to-primitive": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-to-primitive/-/es-to-primitive-1.3.0.tgz",
      "integrity": "sha512-w+5mJ3GuFL+NjVtJlvydShqE1eN3h3PbI7/5LAsYJP/2qtuMXjfL2LpHSRqo4b4eSF5K/DH1JXKUAHSB2UW50g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7",
        "is-date-object": "^1.0.5",
        "is-symbol": "^1.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint": {
      "version": "8.57.1",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-8.57.1.tgz",
      "integrity": "sha512-ypowyDxpVSYpkXr9WPv2PAZCtNip1Mv5KTW0SCurXv/9iOpcrH9PaqUElksqEB6pChqHGDRCFTyrZlGhnLNGiA==",
      "deprecated": "This version is no longer supported. Please see https://eslint.org/version-support for other options.",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.2.0",
        "@eslint-community/regexpp": "^4.6.1",
        "@eslint/eslintrc": "^2.1.4",
        "@eslint/js": "8.57.1",
        "@humanwhocodes/config-array": "^0.13.0",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@nodelib/fs.walk": "^1.2.8",
        "@ungap/structured-clone": "^1.2.0",
        "ajv": "^6.12.4",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.2",
        "debug": "^4.3.2",
        "doctrine": "^3.0.0",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^7.2.2",
        "eslint-visitor-keys": "^3.4.3",
        "espree": "^9.6.1",
        "esquery": "^1.4.2",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^6.0.1",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "globals": "^13.19.0",
        "graphemer": "^1.4.0",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "is-path-inside": "^3.0.3",
        "js-yaml": "^4.1.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "levn": "^0.4.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.2",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3",
        "strip-ansi": "^6.0.1",
        "text-table": "^0.2.0"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-config-google": {
      "version": "0.14.0",
      "resolved": "https://registry.npmjs.org/eslint-config-google/-/eslint-config-google-0.14.0.tgz",
      "integrity": "sha512-WsbX4WbjuMvTdeVL6+J3rK1RGhCTqjsFjX7UMSMgZiyxxaNLkoJENbrGExzERFeoTpGw3F3FypTiWAP9ZXzkEw==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=0.10.0"
      },
      "peerDependencies": {
        "eslint": ">=5.16.0"
      }
    },
    "node_modules/eslint-import-resolver-node": {
      "version": "0.3.9",
      "resolved": "https://registry.npmjs.org/eslint-import-resolver-node/-/eslint-import-resolver-node-0.3.9.tgz",
      "integrity": "sha512-WFj2isz22JahUv+B788TlO3N6zL3nNJGU8CcZbPZvVEkBPaJdCV4vy5wyghty5ROFbCRnm132v8BScu5/1BQ8g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "debug": "^3.2.7",
        "is-core-module": "^2.13.0",
        "resolve": "^1.22.4"
      }
    },
    "node_modules/eslint-import-resolver-node/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-module-utils": {
      "version": "2.12.1",
      "resolved": "https://registry.npmjs.org/eslint-module-utils/-/eslint-module-utils-2.12.1.tgz",
      "integrity": "sha512-L8jSWTze7K2mTg0vos/RuLRS5soomksDPoJLXIslC7c8Wmut3bx7CPpJijDcBZtxQ5lrbUdM+s0OlNbz0DCDNw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "debug": "^3.2.7"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependenciesMeta": {
        "eslint": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-module-utils/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-plugin-import": {
      "version": "2.32.0",
      "resolved": "https://registry.npmjs.org/eslint-plugin-import/-/eslint-plugin-import-2.32.0.tgz",
      "integrity": "sha512-whOE1HFo/qJDyX4SnXzP4N6zOWn79WhnCUY/iDR0mPfQZO8wcYE4JClzI2oZrhBnnMUCBCHZhO6VQyoBU95mZA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rtsao/scc": "^1.1.0",
        "array-includes": "^3.1.9",
        "array.prototype.findlastindex": "^1.2.6",
        "array.prototype.flat": "^1.3.3",
        "array.prototype.flatmap": "^1.3.3",
        "debug": "^3.2.7",
        "doctrine": "^2.1.0",
        "eslint-import-resolver-node": "^0.3.9",
        "eslint-module-utils": "^2.12.1",
        "hasown": "^2.0.2",
        "is-core-module": "^2.16.1",
        "is-glob": "^4.0.3",
        "minimatch": "^3.1.2",
        "object.fromentries": "^2.0.8",
        "object.groupby": "^1.0.3",
        "object.values": "^1.2.1",
        "semver": "^6.3.1",
        "string.prototype.trimend": "^1.0.9",
        "tsconfig-paths": "^3.15.0"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependencies": {
        "eslint": "^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9"
      }
    },
    "node_modules/eslint-plugin-import/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-plugin-import/node_modules/doctrine": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/doctrine/-/doctrine-2.1.0.tgz",
      "integrity": "sha512-35mSku4ZXK0vfCuHEDAwt55dg2jNajHZ1odvF+8SSr82EsZY4QmXfuWso8oEd8zRhVObSN18aM0CjSdoBX7zIw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "esutils": "^2.0.2"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/eslint-plugin-import/node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/eslint-scope": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-5.1.1.tgz",
      "integrity": "sha512-2NxwbF/hZ0KpepYN0cNbo+FN6XoK7GaHlQhgx/hIZl6Va0bF45RQOOwhLIy8lQDbuCiadSLCBnH2CFYquit5bw==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^4.1.1"
      },
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint/node_modules/eslint-scope": {
      "version": "7.2.2",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-7.2.2.tgz",
      "integrity": "sha512-dOt21O7lTMhDM+X9mB4GX+DZrZtCUJPL/wlcTqxyrx5IvO0IYtILdtrQGQp+8n5S0gwSVmOf9NQrjMOgfQZlIg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint/node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/espree": {
      "version": "9.6.1",
      "resolved": "https://registry.npmjs.org/espree/-/espree-9.6.1.tgz",
      "integrity": "sha512-oruZaFkjorTpF32kDSI5/75ViwGeZginGGy2NoOSg3Q9bnwlnmDm4HLnkl0RE3n+njDXR037aY1+x58Z/zFdwQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "acorn": "^8.9.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^3.4.1"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esprima": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/esprima/-/esprima-4.0.1.tgz",
      "integrity": "sha512-eGuFFw7Upda+g4p+QHvnW0RyTX/SVeJBDM/gCtMARO0cLuT2HcEKnTPvhjV6aGeqrCB/sbNop0Kszm0jsaWU4A==",
      "dev": true,
      "license": "BSD-2-Clause",
      "peer": true,
      "bin": {
        "esparse": "bin/esparse.js",
        "esvalidate": "bin/esvalidate.js"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/esquery": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.6.0.tgz",
      "integrity": "sha512-ca9pw9fomFcKPvFLXhBKUK90ZvGibiGOvRJNbjljY7s7uq/5YO4BOzcYtJqExdx99rF6aAcnRxHmcUHcz6sQsg==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esquery/node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esrecurse/node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-4.3.0.tgz",
      "integrity": "sha512-39nnKffWz8xN1BU/2c79n9nB9HDzo0niYUqx6xyqUnyoAnQyyWpOTdZEeiCch8BBu515t4wp9ZmgVfVhn9EBpw==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/event-target-shim": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz",
      "integrity": "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/execa": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/execa/-/execa-5.1.1.tgz",
      "integrity": "sha512-8uSpZZocAZRBAPIEINJj3Lo9HyGitllczc27Eh5YYojjMFMn8yHMDMaUHE2Jqfq05D/wucwI4JGURyXt1vchyg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "cross-spawn": "^7.0.3",
        "get-stream": "^6.0.0",
        "human-signals": "^2.1.0",
        "is-stream": "^2.0.0",
        "merge-stream": "^2.0.0",
        "npm-run-path": "^4.0.1",
        "onetime": "^5.1.2",
        "signal-exit": "^3.0.3",
        "strip-final-newline": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sindresorhus/execa?sponsor=1"
      }
    },
    "node_modules/execa/node_modules/signal-exit": {
      "version": "3.0.7",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-3.0.7.tgz",
      "integrity": "sha512-wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==",
      "dev": true,
      "license": "ISC",
      "peer": true
    },
    "node_modules/exit-x": {
      "version": "0.2.2",
      "resolved": "https://registry.npmjs.org/exit-x/-/exit-x-0.2.2.tgz",
      "integrity": "sha512-+I6B/IkJc1o/2tiURyz/ivu/O0nKNEArIUB5O7zBrlDVJr22SCLH3xTeEry428LvFhRzIA1g8izguxJ/gbNcVQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/expect": {
      "version": "30.2.0",
      "resolved": "https://registry.npmjs.org/expect/-/expect-30.2.0.tgz",
      "integrity": "sha512-u/feCi0GPsI+988gU2FLcsHyAHTU0MX1Wg68NhAnN7z/+C5wqG+CY8J53N9ioe8RXgaoz0nBR/TYMf3AycUuPw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@jest/expect-utils": "30.2.0",
        "@jest/get-type": "30.1.0",
        "jest-matcher-utils": "30.2.0",
        "jest-message-util": "30.2.0",
        "jest-mock": "30.2.0",
        "jest-util": "30.2.0"
      },
      "engines": {
        "node": "^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0"
      }
    },
    "node_modules/express": {
      "version": "4.21.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.21.2.tgz",
      "integrity": "sha512-28HqgMZAmih1Czt9ny7qr6ek2qddF4FclbMzwhCREB6OFfH+rXAnuNCwo1/wFvrtbgsQDb4kSbX9de9lFbrXnA==",
      "license": "MIT",
      "dependencies": {
        "accepts": "~1.3.8",
        "array-flatten": "1.1.1",
        "body-parser": "1.20.3",
        "content-disposition": "0.5.4",
        "content-type": "~1.0.4",
        "cookie": "0.7.1",
        "cookie-signature": "1.0.6",
        "debug": "2.6.9",
        "depd": "2.0.0",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "etag": "~1.8.1",
        "finalhandler": "1.3.1",
        "fresh": "0.5.2",
        "http-errors": "2.0.0",
        "merge-descriptors": "1.0.3",
        "methods": "~1.1.2",
        "on-finished": "2.4.1",
        "parseurl": "~1.3.3",
        "path-to-regexp": "0.1.12",
        "proxy-addr": "~2.0.7",
        "qs": "6.13.0",
        "range-parser": "~1.2.1",
        "safe-buffer": "5.2.1",
        "send": "0.19.0",
        "serve-static": "1.16.2",
        "setprototypeof": "1.2.0",
        "statuses": "2.0.1",
        "type-is": "~1.6.18",
        "utils-merge": "1.0.1",
        "vary": "~1.1.2"
      },
      "engines": {
        "node": ">= 0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/express/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/express/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/extend": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/extend/-/extend-3.0.2.tgz",
      "integrity": "sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/farmhash-modern": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/farmhash-modern/-/farmhash-modern-1.1.0.tgz",
      "integrity": "sha512-6ypT4XfgqJk/F3Yuv4SX26I3doUjt0GTG4a+JgWxXQpxXzTBq8fPUeGHfcYMMDPHJHm3yPOSjaeBwBGAHWXCdA==",
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-xml-parser": {
      "version": "4.5.3",
      "resolved": "https://registry.npmjs.org/fast-xml-parser/-/fast-xml-parser-4.5.3.tgz",
      "integrity": "sha512-RKihhV+SHsIUGXObeVy9AXiBbFwkVk7Syp8XgwN5U3JV416+Gwp/GO9i0JYKmikykgz/UHRrrV4ROuZEo/T0ig==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "strnum": "^1.1.1"
      },
      "bin": {
        "fxparser": "src/cli/cli.js"
      }
    },
    "node_modules/fastq": {
      "version": "1.19.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.19.1.tgz",
      "integrity": "sha512-GwLTyxkCXjXbxqIhTsMI2Nui8huMPtnxg7krajPJAjnEG/iiOS7i+zCtWGZR9G0NBKbXKh6X9m9UIsYX/N6vvQ==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/faye-websocket": {
      "version": "0.11.4",
      "resolved": "https://registry.npmjs.org/faye-websocket/-/faye-websocket-0.11.4.tgz",
      "integrity": "sha512-CzbClwlXAuiRQAlUyfqPgvPoNKTckTPGfwZV4ZdAhVcP2lh9KUxJg2b5GkE7XbjKQ3YJnQ9z6D9ntLAlB+tP8g==",
      "license": "Apache-2.0",
      "dependencies": {
        "websocket-driver": ">=0.5.1"
      },
      "engines": {
        "node": ">=0.8.0"
      }
    },
    "node_modules/fb-watchman": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/fb-watchman/-/fb-watchman-2.0.2.tgz",
      "integrity": "sha512-p5161BqbuCaSnB8jIbzQHOlpgsPmK5rJVDfDKO91Axs5NC1uu3HRQm6wt9cd9/+GtQQIO53JdGXXoyDpTAsgYA==",
      "dev": true,
      "license": "Apache-2.0",
      "peer": true,
      "dependencies": {
        "bser": "2.1.1"
      }
    },
    "node_modules/file-entry-cache": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-6.0.1.tgz",
      "integrity": "sha512-7Gps/XWymbLk2QLYK4NzpMOrYjMhdIxXuIvy2QBsLE6ljuodKvdkWs/cpyJJ3CVIVpH0Oi1Hvg1ovbMzLdFBBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flat-cache": "^3.0.4"
      },
      "engines": {
        "node": "^10.12.0 || >=12.0.0"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/finalhandler": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-1.3.1.tgz",
      "integrity": "sha512-6BN9trH7bp3qvnrRyzsBz+g3lZxTNZTbVO2EV1CS0WIcDbawYVdYvGflME/9QP0h0pYlCDBCTjYa9nZzMDpyxQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "on-finished": "2.4.1",
        "parseurl": "~1.3.3",
        "statuses": "2.0.1",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/finalhandler/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/finalhandler/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/firebase-admin": {
      "version": "12.7.0",
      "resolved": "https://registry.npmjs.org/firebase-admin/-/firebase-admin-12.7.0.tgz",
      "integrity": "sha512-raFIrOyTqREbyXsNkSHyciQLfv8AUZazehPaQS1lZBSCDYW74FYXU0nQZa3qHI4K+hawohlDbywZ4+qce9YNxA==",
      "license": "Apache-2.0",
      "dependencies": {
        "@fastify/busboy": "^3.0.0",
        "@firebase/database-compat": "1.0.8",
        "@firebase/database-types": "1.0.5",
        "@types/node": "^22.0.1",
        "farmhash-modern": "^1.1.0",
        "jsonwebtoken": "^9.0.0",
        "jwks-rsa": "^3.1.0",
        "node-forge": "^1.3.1",
        "uuid": "^10.0.0"
      },
      "engines": {
        "node": ">=14"
      },
      "optionalDependencies": {
        "@google-cloud/firestore": "^7.7.0",
        "@google-cloud/storage": "^7.7.0"
      }
    },
    "node_modules/firebase-functions": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/firebase-functions/-/firebase-functions-6.5.0.tgz",
      "integrity": "sha512-ffntJkq88K0pdLDq14IyetKQu99Je4vBBJBe9rkZK2X4QyeJJnmA527+v2iTKA+SwRtxf5lh7sXgxpvxGS8HtQ==",
      "license": "MIT",
      "dependencies": {
        "@types/cors": "^2.8.5",
        "@types/express": "^4.17.21",
        "cors": "^2.8.5",
        "express": "^4.21.0",
        "protobufjs": "^7.2.2"
      },
      "bin": {
        "firebase-functions": "lib/bin/firebase-functions.js"
      },
      "engines": {
        "node": ">=14.10.0"
      },
      "peerDependencies": {
        "firebase-admin": "^11.10.0 || ^12.0.0 || ^13.0.0"
      }
    },
    "node_modules/firebase-functions-test": {
      "version": "3.4.1",
      "resolved": "https://registry.npmjs.org/firebase-functions-test/-/firebase-functions-test-3.4.1.tgz",
      "integrity": "sha512-qAq0oszrBGdf4bnCF6t4FoSgMsepeIXh0Pi/FhikSE6e+TvKKGpfrfUP/5pFjJZxFcLsweoau88KydCql4xSeg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/lodash": "^4.14.104",
        "lodash": "^4.17.5",
        "ts-deepmerge": "^2.0.1"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "firebase-admin": "^8.0.0 || ^9.0.0 || ^10.0.0 || ^11.0.0 || ^12.0.0 || ^13.0.0",
        "firebase-functions": ">=4.9.0",
        "jest": ">=28.0.0"
      }
    },
    "node_modules/flat-cache": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-3.2.0.tgz",
      "integrity": "sha512-CYcENa+FtcUKLmhhqyctpclsq7QF38pKjZHsGNiSQF5r4FtoKDWabFDl3hzaEQMvT1LHEysw5twgLvpYYb4vbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.3",
        "rimraf": "^3.0.2"
      },
      "engines": {
        "node": "^10.12.0 || >=12.0.0"
      }
    },
    "node_modules/flatted": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.3.3.tgz",
      "integrity": "sha512-GX+ysw4PBCz0PzosHDepZGANEuFCMLrnRTiEy9McGjmkCQYwRq4A/X786G/fjM/+OjsWSU1ZrY5qyARZmO/uwg==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/for-each": {
      "version": "0.3.5",
      "resolved": "https://registry.npmjs.org/for-each/-/for-each-0.3.5.tgz",
      "integrity": "sha512-dKx12eRCVIzqCxFGplyFKJMPvLEWgmNtUrpTiJIR5u97zEhRG8ySrtboPHZXx7daLxQVrl643cTzbab2tkQjxg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/foreground-child": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.1.tgz",
      "integrity": "sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "dependencies": {
        "cross-spawn": "^7.0.6",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/form-data": {
      "version": "2.5.5",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-2.5.5.tgz",
      "integrity": "sha512-jqdObeR2rxZZbPSGL+3VckHMYtu+f9//KXBsVny6JSX/pa38Fy+bGjuG8eW/H6USNQWhLi8Num++cU2yOCNz4A==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.2",
        "mime-types": "^2.1.35",
        "safe-buffer": "^5.2.1"
      },
      "engines": {
        "node": ">= 0.12"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fresh": {
      "version": "0.5.2",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-0.5.2.tgz",
      "integrity": "sha512-zJ2mQYM18rEFOudeV4GShTGIQ7RbzA7ozbU9I/XBpm7kqgMywgmylMwXHxZJmkVoYkna9d2pVXVXPdYTP9ej8Q==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fs.realpath": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/fs.realpath/-/fs.realpath-1.0.0.tgz",
      "integrity": "sha512-OO0pH2lK6a0hZnAdau5ItzHPI6pUlvI7jMVnxUQRtw4owF2wk8lOSabtGDCTP4Ggrg2MbGnWO9X8K1t4+fGMDw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "peer": true,
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/function.prototype.name": {
      "version": "1.1.8",
      "resolved": "https://registry.npmjs.org/function.prototype.name/-/function.prototype.name-1.1.8.tgz",
      "integrity": "sha512-e5iwyodOHhbMr/yNrc7fDYG4qlbIvI5gajyzPnb5TCwyhjApznQh1BMFou9b30SevY43gCJKXycoCBjMbsuW0Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "functions-have-names": "^1.2.3",
        "hasown": "^2.0.2",
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/functional-red-black-tree": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/functional-red-black-tree/-/functional-red-black-tree-1.0.1.tgz",
      "integrity": "sha512-dsKNQNdj6xA3T+QlADDA7mOSlX0qiMINjn0cgr+eGHGsbSHzTabcIogz2+p/iqP1Xs6EP/sS2SbqH+brGTbq0g==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/functions-have-names": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/functions-have-names/-/functions-have-names-1.2.3.tgz",
      "integrity": "sha512-xckBUXyTIqT97tq2x2AMb+g163b5JFysYk0x4qxNFwbfQkmNZoiRHb6sPzI9/QV33WeuvVYBUIiD4NzNIyqaRQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gaxios": {
      "version": "6.7.1",
      "resolved": "https://registry.npmjs.org/gaxios/-/gaxios-6.7.1.tgz",
      "integrity": "sha512-LDODD4TMYx7XXdpwxAVRAIAuB0bzv0s+ywFonY46k126qzQHT9ygyoa9tncmOiQmmDrik65UYsEkv3lbfqQ3yQ==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "extend": "^3.0.2",
        "https-proxy-agent": "^7.0.1",
        "is-stream": "^2.0.0",
        "node-fetch": "^2.6.9",
        "uuid": "^9.0.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/gaxios/node_modules/uuid": {
      "version": "9.0.1",
      "resolved": "https://registry.npmjs.org/uuid/-/uuid-9.0.1.tgz",
      "integrity": "sha512-b+1eJOlsR9K8HJpow9Ok3fiWOWSIcIzXodvv0rQjVoOVNpWMpxf1wZNpt4y9h10odCNrqnYp1OBzRktckBe3sA==",
      "funding": [
        "https://github.com/sponsors/broofa",
        "https://github.com/sponsors/ctavan"
      ],
      "license": "MIT",
      "optional": true,
      "bin": {
        "uuid": "dist/bin/uuid"
      }
    },
    "node_modules/gcp-metadata": {
      "version": "6.1.1",
      "resolved": "https://registry.npmjs.org/gcp-metadata/-/gcp-metadata-6.1.1.tgz",
      "integrity": "sha512-a4tiq7E0/5fTjxPAaH4jpjkSv/uCaU2p5KC6HVGrvl0cDjA8iBZv4vv1gyzlmK0ZUKqwpOyQMKzZQe3lTit77A==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "gaxios": "^6.1.1",
        "google-logging-utils": "^0.0.2",
        "json-bigint": "^1.0.0"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/generator-function": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/generator-function/-/generator-function-2.0.1.tgz",
      "integrity": "sha512-SFdFmIJi+ybC0vjlHN0ZGVGHc3lgE0DxPAT0djjVg+kjOnSqclqmj0KQ7ykTOLP6YxoqOvuAODGdcHJn+43q3g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/get-caller-file": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz",
      "integrity": "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==",
      "devOptional": true,
      "license": "ISC",
      "engines": {
        "node": "6.* || 8.* || >= 10.*"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-package-type": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/get-package-type/-/get-package-type-0.1.0.tgz",
      "integrity": "sha512-pjzuKtY64GYfWizNAJ0fr9VqttZkNiK2iS430LtIHzjBEr6bX8Am2zm4sW4Ro5wjWW5cAlRL1qAMTcXbjNAO2Q==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/get-stream": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/get-stream/-/get-stream-6.0.1.tgz",
      "integrity": "sha512-ts6Wi+2j3jQjqi70w5AlN8DFnkSwC+MqmxEzdEALB2qXZYV3X/b1CTfgPLGJNMeAWxdPfU8FO1ms3NUfaHCPYg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/get-symbol-description": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/get-symbol-description/-/get-symbol-description-1.1.0.tgz",
      "integrity": "sha512-w9UMqWwJxHNOvoNzSJ2oPF5wvYcvP7jUvYzhp67yEhTi17ZDBBC1z9pTdGuzjD+EFIqLSYRweZjqfiPzQ06Ebg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/glob": {
      "version": "10.4.5",
      "resolved": "https://registry.npmjs.org/glob/-/glob-10.4.5.tgz",
      "integrity": "sha512-7Bv8RF0k6xjo7d4A/PxYLbUCfb6c+Vpd2/mB2yRDlew7Jb5hEXiCD9ibfO7wpk8i4sevK6DFny9h7EYbM3/sHg==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "dependencies": {
        "foreground-child": "^3.1.0",
        "jackspeak": "^3.1.2",
        "minimatch": "^9.0.4",
        "minipass": "^7.1.2",
        "package-json-from-dist": "^1.0.0",
        "path-scurry": "^1.11.1"
      },
      "bin": {
        "glob": "dist/esm/bin.mjs"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/glob/node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/glob/node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "dev": true,
      "license": "ISC",
      "peer": true,
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/globals": {
      "version": "13.24.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-13.24.0.tgz",
      "integrity": "sha512-AhO5QUcj8llrbG09iWhPU2B204J1xnPeL8kQmVorSsy+Sjj1sk8gIyh6cUocGmH4L0UuhAJy+hJMRA4mgA4mFQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "type-fest": "^0.20.2"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/globalthis": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/globalthis/-/globalthis-1.0.4.tgz",
      "integrity": "sha512-DpLKbNU4WylpxJykQujfCcwYWiV/Jhm50Goo0wrVILAv5jOr9d+H+UR3PhSCD2rCCEIg0uc+G+muBTwD54JhDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-properties": "^1.2.1",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/globby": {
      "version": "11.1.0",
      "resolved": "https://registry.npmjs.org/globby/-/globby-11.1.0.tgz",
      "integrity": "sha512-jhIXaOzy1sb8IyocaruWSn1TjmnBVs8Ayhcy83rmxNJ8q2uWKCAj3CnJY+KpGSXCueAPc0i05kVvVKtP1t9S3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-union": "^2.1.0",
        "dir-glob": "^3.0.1",
        "fast-glob": "^3.2.9",
        "ignore": "^5.2.0",
        "merge2": "^1.4.1",
        "slash": "^3.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/google-auth-library": {
      "version": "9.15.1",
      "resolved": "https://registry.npmjs.org/google-auth-library/-/google-auth-library-9.15.1.tgz",
      "integrity": "sha512-Jb6Z0+nvECVz+2lzSMt9u98UsoakXxA2HGHMCxh+so3n90XgYWkq5dur19JAJV7ONiJY22yBTyJB1TSkvPq9Ng==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "base64-js": "^1.3.0",
        "ecdsa-sig-formatter": "^1.0.11",
        "gaxios": "^6.1.1",
        "gcp-metadata": "^6.1.0",
        "gtoken": "^7.0.0",
        "jws": "^4.0.0"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/google-gax": {
      "version": "4.6.1",
      "resolved": "https://registry.npmjs.org/google-gax/-/google-gax-4.6.1.tgz",
      "integrity": "sha512-V6eky/xz2mcKfAd1Ioxyd6nmA61gao3n01C+YeuIwu3vzM9EDR6wcVzMSIbLMDXWeoi9SHYctXuKYC5uJUT3eQ==",
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@grpc/grpc-js": "^1.10.9",
        "@grpc/proto-loader": "^0.7.13",
        "@types/long": "^4.0.0",
        "abort-controller": "^3.0.0",
        "duplexify": "^4.0.0",
        "google-auth-library": "^9.3.0",
        "node-fetch": "^2.7.0",
        "object-hash": "^3.0.0",
        "proto3-json-serializer": "^2.0.2",
        "protobufjs": "^7.3.2",
        "retry-request": "^7.0.0",
        "uuid": "^9.0.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/google-gax/node_modules/uuid": {
      "version": "9.0.1",
      "resolved": "https://registry.npmjs.org/uuid/-/uuid-9.0.1.tgz",
      "integrity": "sha512-b+1eJOlsR9K8HJpow9Ok3fiWOWSIcIzXodvv0rQjVoOVNpWMpxf1wZNpt4y9h10odCNrqnYp1OBzRktckBe3sA==",
      "funding": [
        "https://github.com/sponsors/broofa",
        "https://github.com/sponsors/ctavan"
      ],
      "license": "MIT",
      "optional": true,
      "bin": {
        "uuid": "dist/bin/uuid"
      }
    },
    "node_modules/google-logging-utils": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/google-logging-utils/-/google-logging-utils-0.0.2.tgz",
      "integrity": "sha512-NEgUnEcBiP5HrPzufUkBzJOD/Sxsco3rLNo1F1TNf7ieU8ryUzBhqba8r756CjLX7rn3fHl6iLEwPYuqpoKgQQ==",
      "license": "Apache-2.0",
      "optional": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "dev": true,
      "license": "ISC",
      "peer": true
    },
    "node_modules/graphemer": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/graphemer/-/graphemer-1.4.0.tgz",
      "integrity": "sha512-EtKwoO6kxCL9WO5xipiHTZlSzBm7WLT627TqC/uVRd0HKmq8NXyebnNYxDoBi7wt8eTWrUrKXCOVaFq9x1kgag==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/gtoken": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/gtoken/-/gtoken-7.1.0.tgz",
      "integrity": "sha512-pCcEwRi+TKpMlxAQObHDQ56KawURgyAf6jtIY046fJ5tIv3zDe/LEIubckAO8fj6JnAxLdmWkUfNyulQ2iKdEw==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "gaxios": "^6.0.0",
        "jws": "^4.0.0"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/has-bigints": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-bigints/-/has-bigints-1.1.0.tgz",
      "integrity": "sha512-R3pbpkcIqv2Pm3dUwgjclDRVmWpTJW2DcMzcIhEXEx1oh/CEMObMm3KLmRJOdvhM7o4uQBnwr8pzRK2sJWIqfg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/has-property-descriptors": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-property-descriptors/-/has-property-descriptors-1.0.2.tgz",
      "integrity": "sha512-55JNKuIW+vq4Ke1BjOTjM2YctQIvCT7GFzHwmfZPGo5wnrgkid0YQtnAleFSqumZm4az3n2BS+erby5ipJdgrg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-proto": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/has-proto/-/has-proto-1.2.0.tgz",
      "integrity": "sha512-KIL7eQPfHQRC8+XluaIw7BHUwwqL19bQn4hzNgdr+1wXoU0KKj6rufu47lhY7KbJR2C6T6+PfyN0Ea7wkSS+qQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/html-entities": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/html-entities/-/html-entities-2.6.0.tgz",
      "integrity": "sha512-kig+rMn/QOVRvr7c86gQ8lWXq+Hkv6CbAH1hLu+RG338StTpE8Z0b44SDVaqVu7HGKf27frdmUYEs9hTUX/cLQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/mdevils"
        },
        {
          "type": "patreon",
          "url": "https://patreon.com/mdevils"
        }
      ],
      "license": "MIT",
      "optional": true
    },
    "node_modules/html-escaper": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/html-escaper/-/html-escaper-2.0.2.tgz",
      "integrity": "sha512-H2iMtd0I4Mt5eYiapRdIDjp+XzelXQ0tFE4JS7YFwFevXXMmOp9myNrUvCg0D6ws8iqkRPBfKHgbwig1SmlLfg==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/http-errors": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.0.tgz",
      "integrity": "sha512-FtwrG/euBzaEjYeRqOgly7G0qviiXoJWnvEH2Z1plBdXgbyjv34pHTSb9zoeHMyDy33+DWy5Wt9Wo+TURtOYSQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "2.0.0",
        "inherits": "2.0.4",
        "setprototypeof": "1.2.0",
        "statuses": "2.0.1",
        "toidentifier": "1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/http-parser-js": {
      "version": "0.5.10",
      "resolved": "https://registry.npmjs.org/http-parser-js/-/http-parser-js-0.5.10.tgz",
      "integrity": "sha512-Pysuw9XpUq5dVc/2SMHpuTY01RFl8fttgcyunjL7eEMhGM3cI4eOmiCycJDVCo/7O7ClfQD3SaI6ftDzqOXYMA==",
      "license": "MIT"
    },
    "node_modules/http-proxy-agent": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/http-proxy-agent/-/http-proxy-agent-5.0.0.tgz",
      "integrity": "sha512-n2hY8YdoRE1i7r6M0w9DIw5GgZN0G25P8zLCRQ8rjXtTU3vsNFBI/vWK/UIeE6g5MUUz6avwAPXmL6Fy9D/90w==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@tootallnate/once": "2",
        "agent-base": "6",
        "debug": "4"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/http-proxy-agent/node_modules/agent-base": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-6.0.2.tgz",
      "integrity": "sha512-RZNwNclF7+MS/8bDg70amg32dyeZGZxiDuQmZxKLAlQjr3jGyLx+4Kkk58UO7D2QdgFIQCovuSuZESne6RG6XQ==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "debug": "4"
      },
      "engines": {
        "node": ">= 6.0.0"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/human-signals": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/human-signals/-/human-signals-2.1.0.tgz",
      "integrity": "sha512-B4FFZ6q/T2jhhksgkbEW3HBvWIfDW85snkQgawt07S7J5QXTk6BkNV+0yAeZrM5QpMAdYlocGoljn0sJ/WQkFw==",
      "dev": true,
      "license": "Apache-2.0",
      "peer": true,
      "engines": {
        "node": ">=10.17.0"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.4.24",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.24.tgz",
      "integrity": "sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parent-module":
```

### functions/package.json

```json
{
  "name": "functions",
  "scripts": {
    "lint": "eslint --ext .js,.ts .",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "22"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.6.0",
    "firebase-functions": "^6.0.1"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.12.0",
    "@typescript-eslint/parser": "^5.12.0",
    "eslint": "^8.9.0",
    "eslint-config-google": "^0.14.0",
    "eslint-plugin-import": "^2.25.4",
    "firebase-functions-test": "^3.1.0",
    "typescript": "^5.7.3"
  },
  "private": true
}

```

### functions/src/index.ts

```ts
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

```

### functions/tsconfig.dev.json

```json
{
  "include": [
    ".eslintrc.js"
  ]
}

```

### functions/tsconfig.json

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "esModuleInterop": true,
    "moduleResolution": "nodenext",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2017"
  },
  "compileOnSave": true,
  "include": [
    "src"
  ]
}

```

### package.json

```json
{
  "name": "fresh-schedules",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev:web": "pnpm --filter @apps/web dev",
    "dev:api": "pnpm --filter @services/api dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "echo \"(lint placeholder)\" && exit 0",
    "test": "echo \"(no tests yet)\" && exit 0"
  },
  "devDependencies": {
    "@types/node": "20.11.30",
    "@types/react": "18.2.64",
    "@types/react-dom": "^18.3.7",
    "typescript": "5.5.4"
  },
  "version": "0.1.1",
  "dependencies": {
    "firebase": "^12.3.0"
  }
}

```

### packages/types/package.json

```json
{
  "name": "@packages/types",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "3.23.8"
  },
  "devDependencies": {
    "typescript": "5.5.4"
  }
}

```

### packages/types/src/index.ts

```ts
// Shared Zod schemas and types (refactored)
import { z } from "zod";

export const roleEnum = z.enum(["admin", "manager", "staff"]);

export const userRefSchema = z.object({
  uid: z.string(),
  displayName: z.string().optional(),
  email: z.string().email().optional()
});

export const orgSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerUid: z.string(),
  createdAt: z.string()
});
export type Org = z.infer<typeof orgSchema>;

export const eventSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  startDate: z.string(), // ISO
  endDate: z.string(),   // ISO
  status: z.enum(["draft","published"]).default("draft")
});
export type Event = z.infer<typeof eventSchema>;

export const shiftSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  eventId: z.string().optional(),
  role: z.string(),
  staffUid: z.string().optional(),
  startTime: z.string(), // ISO
  endTime: z.string(),   // ISO
  breakMinutes: z.number().int().min(0).default(0),
  published: z.boolean().default(false)
});
export type Shift = z.infer<typeof shiftSchema>;

export const createShiftInput = shiftSchema.pick({
  orgId: true, eventId: true, role: true, staffUid: true, startTime: true, endTime: true, breakMinutes: true
});

export const timesheetSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  staffUid: z.string(),
  shiftId: z.string(),
  clockIn: z.string(),  // ISO
  clockOut: z.string().optional(),
  approved: z.boolean().default(false)
});
export type Timesheet = z.infer<typeof timesheetSchema>;

```

### pnpm-lock.yaml

```yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      firebase:
        specifier: ^12.3.0
        version: 12.3.0
    devDependencies:
      '@types/node':
        specifier: 20.11.30
        version: 20.11.30
      '@types/react':
        specifier: 18.2.64
        version: 18.2.64
      '@types/react-dom':
        specifier: ^18.3.7
        version: 18.3.7(@types/react@18.2.64)
      typescript:
        specifier: 5.5.4
        version: 5.5.4

  apps/web:
    dependencies:
      next:
        specifier: 14.2.5
        version: 14.2.5(react-dom@18.2.0(react@18.2.0))(react@18.2.0)
      react:
        specifier: 18.2.0
        version: 18.2.0
      react-dom:
        specifier: 18.2.0
        version: 18.2.0(react@18.2.0)
      zod:
        specifier: 3.23.8
        version: 3.23.8
    devDependencies:
      '@types/node':
        specifier: 20.11.30
        version: 20.11.30
      '@types/react':
        specifier: 18.2.64
        version: 18.2.64
      typescript:
        specifier: 5.5.4
        version: 5.5.4

  packages/types:
    dependencies:
      zod:
        specifier: 3.23.8
        version: 3.23.8
    devDependencies:
      typescript:
        specifier: 5.5.4
        version: 5.5.4

  services/api:
    dependencies:
      '@packages/types':
        specifier: workspace:*
        version: link:../../packages/types
      cors:
        specifier: 2.8.5
        version: 2.8.5
      express:
        specifier: 4.19.2
        version: 4.19.2
      pino:
        specifier: 9.0.0
        version: 9.0.0
      zod:
        specifier: 3.23.8
        version: 3.23.8
    devDependencies:
      '@types/cors':
        specifier: 2.8.17
        version: 2.8.17
      '@types/express':
        specifier: 4.17.21
        version: 4.17.21
      '@types/node':
        specifier: 20.11.30
        version: 20.11.30
      tsx:
        specifier: 4.16.2
        version: 4.16.2
      typescript:
        specifier: 5.5.4
        version: 5.5.4

packages:

  '@esbuild/aix-ppc64@0.21.5':
    resolution: {integrity: sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==}
    engines: {node: '>=12'}
    cpu: [ppc64]
    os: [aix]

  '@esbuild/android-arm64@0.21.5':
    resolution: {integrity: sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm@0.21.5':
    resolution: {integrity: sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==}
    engines: {node: '>=12'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-x64@0.21.5':
    resolution: {integrity: sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [android]

  '@esbuild/darwin-arm64@0.21.5':
    resolution: {integrity: sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-x64@0.21.5':
    resolution: {integrity: sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/freebsd-arm64@0.21.5':
    resolution: {integrity: sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.21.5':
    resolution: {integrity: sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/linux-arm64@0.21.5':
    resolution: {integrity: sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm@0.21.5':
    resolution: {integrity: sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==}
    engines: {node: '>=12'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-ia32@0.21.5':
    resolution: {integrity: sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==}
    engines: {node: '>=12'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-loong64@0.21.5':
    resolution: {integrity: sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==}
    engines: {node: '>=12'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-mips64el@0.21.5':
    resolution: {integrity: sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==}
    engines: {node: '>=12'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-ppc64@0.21.5':
    resolution: {integrity: sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==}
    engines: {node: '>=12'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-riscv64@0.21.5':
    resolution: {integrity: sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==}
    engines: {node: '>=12'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-s390x@0.21.5':
    resolution: {integrity: sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==}
    engines: {node: '>=12'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-x64@0.21.5':
    resolution: {integrity: sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [linux]

  '@esbuild/netbsd-x64@0.21.5':
    resolution: {integrity: sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/openbsd-x64@0.21.5':
    resolution: {integrity: sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/sunos-x64@0.21.5':
    resolution: {integrity: sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/win32-arm64@0.21.5':
    resolution: {integrity: sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-ia32@0.21.5':
    resolution: {integrity: sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==}
    engines: {node: '>=12'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-x64@0.21.5':
    resolution: {integrity: sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [win32]

  '@firebase/ai@2.3.0':
    resolution: {integrity: sha512-rVZgf4FszXPSFVIeWLE8ruLU2JDmPXw4XgghcC0x/lK9veGJIyu+DvyumjreVhW/RwD3E5cNPWxQunzylhf/6w==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app': 0.x
      '@firebase/app-types': 0.x

  '@firebase/analytics-compat@0.2.24':
    resolution: {integrity: sha512-jE+kJnPG86XSqGQGhXXYt1tpTbCTED8OQJ/PQ90SEw14CuxRxx/H+lFbWA1rlFtFSsTCptAJtgyRBwr/f00vsw==}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/analytics-types@0.8.3':
    resolution: {integrity: sha512-VrIp/d8iq2g501qO46uGz3hjbDb8xzYMrbu8Tp0ovzIzrvJZ2fvmj649gTjge/b7cCCcjT0H37g1gVtlNhnkbg==}

  '@firebase/analytics@0.10.18':
    resolution: {integrity: sha512-iN7IgLvM06iFk8BeFoWqvVpRFW3Z70f+Qe2PfCJ7vPIgLPjHXDE774DhCT5Y2/ZU/ZbXPDPD60x/XPWEoZLNdg==}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/app-check-compat@0.4.0':
    resolution: {integrity: sha512-UfK2Q8RJNjYM/8MFORltZRG9lJj11k0nW84rrffiKvcJxLf1jf6IEjCIkCamykHE73C6BwqhVfhIBs69GXQV0g==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/app-check-interop-types@0.3.3':
    resolution: {integrity: sha512-gAlxfPLT2j8bTI/qfe3ahl2I2YcBQ8cFIBdhAQA4I2f3TndcO+22YizyGYuttLHPQEpWkhmpFW60VCFEPg4g5A==}

  '@firebase/app-check-types@0.5.3':
    resolution: {integrity: sha512-hyl5rKSj0QmwPdsAxrI5x1otDlByQ7bvNvVt8G/XPO2CSwE++rmSVf3VEhaeOR4J8ZFaF0Z0NDSmLejPweZ3ng==}

  '@firebase/app-check@0.11.0':
    resolution: {integrity: sha512-XAvALQayUMBJo58U/rxW02IhsesaxxfWVmVkauZvGEz3vOAjMEQnzFlyblqkc2iAaO82uJ2ZVyZv9XzPfxjJ6w==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/app-compat@0.5.3':
    resolution: {integrity: sha512-rRK9YOvgsAU/+edjgubL1q1FyCMjBZZs+fAWtD36tklawkh6WZV07sNLVSceuni+a21oby6xoad+3R8dfztOrA==}
    engines: {node: '>=20.0.0'}

  '@firebase/app-types@0.9.3':
    resolution: {integrity: sha512-kRVpIl4vVGJ4baogMDINbyrIOtOxqhkZQg4jTq3l8Lw6WSk0xfpEYzezFu+Kl4ve4fbPl79dvwRtaFqAC/ucCw==}

  '@firebase/app@0.14.3':
    resolution: {integrity: sha512-by1leTfZkwGycPKRWpc+p5/IhpnOj8zaScVi4RRm9fMoFYS3IE87Wzx1Yf/ruVYowXOEuLqYY3VmJw5tU3+0Bg==}
    engines: {node: '>=20.0.0'}

  '@firebase/auth-compat@0.6.0':
    resolution: {integrity: sha512-J0lGSxXlG/lYVi45wbpPhcWiWUMXevY4fvLZsN1GHh+po7TZVng+figdHBVhFheaiipU8HZyc7ljw1jNojM2nw==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/auth-interop-types@0.2.4':
    resolution: {integrity: sha512-JPgcXKCuO+CWqGDnigBtvo09HeBs5u/Ktc2GaFj2m01hLarbxthLNm7Fk8iOP1aqAtXV+fnnGj7U28xmk7IwVA==}

  '@firebase/auth-types@0.13.0':
    resolution: {integrity: sha512-S/PuIjni0AQRLF+l9ck0YpsMOdE8GO2KU6ubmBB7P+7TJUCQDa3R1dlgYm9UzGbbePMZsp0xzB93f2b/CgxMOg==}
    peerDependencies:
      '@firebase/app-types': 0.x
      '@firebase/util': 1.x

  '@firebase/auth@1.11.0':
    resolution: {integrity: sha512-5j7+ua93X+IRcJ1oMDTClTo85l7Xe40WSkoJ+shzPrX7OISlVWLdE1mKC57PSD+/LfAbdhJmvKixINBw2ESK6w==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app': 0.x
      '@react-native-async-storage/async-storage': ^1.18.1
    peerDependenciesMeta:
      '@react-native-async-storage/async-storage':
        optional: true

  '@firebase/component@0.7.0':
    resolution: {integrity: sha512-wR9En2A+WESUHexjmRHkqtaVH94WLNKt6rmeqZhSLBybg4Wyf0Umk04SZsS6sBq4102ZsDBFwoqMqJYj2IoDSg==}
    engines: {node: '>=20.0.0'}

  '@firebase/data-connect@0.3.11':
    resolution: {integrity: sha512-G258eLzAD6im9Bsw+Qm1Z+P4x0PGNQ45yeUuuqe5M9B1rn0RJvvsQCRHXgE52Z+n9+WX1OJd/crcuunvOGc7Vw==}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/database-compat@2.1.0':
    resolution: {integrity: sha512-8nYc43RqxScsePVd1qe1xxvWNf0OBnbwHxmXJ7MHSuuTVYFO3eLyLW3PiCKJ9fHnmIz4p4LbieXwz+qtr9PZDg==}
    engines: {node: '>=20.0.0'}

  '@firebase/database-types@1.0.16':
    resolution: {integrity: sha512-xkQLQfU5De7+SPhEGAXFBnDryUWhhlFXelEg2YeZOQMCdoe7dL64DDAd77SQsR+6uoXIZY5MB4y/inCs4GTfcw==}

  '@firebase/database@1.1.0':
    resolution: {integrity: sha512-gM6MJFae3pTyNLoc9VcJNuaUDej0ctdjn3cVtILo3D5lpp0dmUHHLFN/pUKe7ImyeB1KAvRlEYxvIHNF04Filg==}
    engines: {node: '>=20.0.0'}

  '@firebase/firestore-compat@0.4.2':
    resolution: {integrity: sha512-cy7ov6SpFBx+PHwFdOOjbI7kH00uNKmIFurAn560WiPCZXy9EMnil1SOG7VF4hHZKdenC+AHtL4r3fNpirpm0w==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/firestore-types@3.0.3':
    resolution: {integrity: sha512-hD2jGdiWRxB/eZWF89xcK9gF8wvENDJkzpVFb4aGkzfEaKxVRD1kjz1t1Wj8VZEp2LCB53Yx1zD8mrhQu87R6Q==}
    peerDependencies:
      '@firebase/app-types': 0.x
      '@firebase/util': 1.x

  '@firebase/firestore@4.9.2':
    resolution: {integrity: sha512-iuA5+nVr/IV/Thm0Luoqf2mERUvK9g791FZpUJV1ZGXO6RL2/i/WFJUj5ZTVXy5pRjpWYO+ZzPcReNrlilmztA==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/functions-compat@0.4.1':
    resolution: {integrity: sha512-AxxUBXKuPrWaVNQ8o1cG1GaCAtXT8a0eaTDfqgS5VsRYLAR0ALcfqDLwo/QyijZj1w8Qf8n3Qrfy/+Im245hOQ==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/functions-types@0.6.3':
    resolution: {integrity: sha512-EZoDKQLUHFKNx6VLipQwrSMh01A1SaL3Wg6Hpi//x6/fJ6Ee4hrAeswK99I5Ht8roiniKHw4iO0B1Oxj5I4plg==}

  '@firebase/functions@0.13.1':
    resolution: {integrity: sha512-sUeWSb0rw5T+6wuV2o9XNmh9yHxjFI9zVGFnjFi+n7drTEWpl7ZTz1nROgGrSu472r+LAaj+2YaSicD4R8wfbw==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/installations-compat@0.2.19':
    resolution: {integrity: sha512-khfzIY3EI5LePePo7vT19/VEIH1E3iYsHknI/6ek9T8QCozAZshWT9CjlwOzZrKvTHMeNcbpo/VSOSIWDSjWdQ==}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/installations-types@0.5.3':
    resolution: {integrity: sha512-2FJI7gkLqIE0iYsNQ1P751lO3hER+Umykel+TkLwHj6plzWVxqvfclPUZhcKFVQObqloEBTmpi2Ozn7EkCABAA==}
    peerDependencies:
      '@firebase/app-types': 0.x

  '@firebase/installations@0.6.19':
    resolution: {integrity: sha512-nGDmiwKLI1lerhwfwSHvMR9RZuIH5/8E3kgUWnVRqqL7kGVSktjLTWEMva7oh5yxQ3zXfIlIwJwMcaM5bK5j8Q==}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/logger@0.5.0':
    resolution: {integrity: sha512-cGskaAvkrnh42b3BA3doDWeBmuHFO/Mx5A83rbRDYakPjO9bJtRL3dX7javzc2Rr/JHZf4HlterTW2lUkfeN4g==}
    engines: {node: '>=20.0.0'}

  '@firebase/messaging-compat@0.2.23':
    resolution: {integrity: sha512-SN857v/kBUvlQ9X/UjAqBoQ2FEaL1ZozpnmL1ByTe57iXkmnVVFm9KqAsTfmf+OEwWI4kJJe9NObtN/w22lUgg==}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/messaging-interop-types@0.2.3':
    resolution: {integrity: sha512-xfzFaJpzcmtDjycpDeCUj0Ge10ATFi/VHVIvEEjDNc3hodVBQADZ7BWQU7CuFpjSHE+eLuBI13z5F/9xOoGX8Q==}

  '@firebase/messaging@0.12.23':
    resolution: {integrity: sha512-cfuzv47XxqW4HH/OcR5rM+AlQd1xL/VhuaeW/wzMW1LFrsFcTn0GND/hak1vkQc2th8UisBcrkVcQAnOnKwYxg==}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/performance-compat@0.2.22':
    resolution: {integrity: sha512-xLKxaSAl/FVi10wDX/CHIYEUP13jXUjinL+UaNXT9ByIvxII5Ne5150mx6IgM8G6Q3V+sPiw9C8/kygkyHUVxg==}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/performance-types@0.2.3':
    resolution: {integrity: sha512-IgkyTz6QZVPAq8GSkLYJvwSLr3LS9+V6vNPQr0x4YozZJiLF5jYixj0amDtATf1X0EtYHqoPO48a9ija8GocxQ==}

  '@firebase/performance@0.7.9':
    resolution: {integrity: sha512-UzybENl1EdM2I1sjYm74xGt/0JzRnU/0VmfMAKo2LSpHJzaj77FCLZXmYQ4oOuE+Pxtt8Wy2BVJEENiZkaZAzQ==}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/remote-config-compat@0.2.20':
    resolution: {integrity: sha512-P/ULS9vU35EL9maG7xp66uljkZgcPMQOxLj3Zx2F289baTKSInE6+YIkgHEi1TwHoddC/AFePXPpshPlEFkbgg==}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/remote-config-types@0.5.0':
    resolution: {integrity: sha512-vI3bqLoF14L/GchtgayMiFpZJF+Ao3uR8WCde0XpYNkSokDpAKca2DxvcfeZv7lZUqkUwQPL2wD83d3vQ4vvrg==}

  '@firebase/remote-config@0.7.0':
    resolution: {integrity: sha512-dX95X6WlW7QlgNd7aaGdjAIZUiQkgWgNS+aKNu4Wv92H1T8Ue/NDUjZHd9xb8fHxLXIHNZeco9/qbZzr500MjQ==}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/storage-compat@0.4.0':
    resolution: {integrity: sha512-vDzhgGczr1OfcOy285YAPur5pWDEvD67w4thyeCUh6Ys0izN9fNYtA1MJERmNBfqjqu0lg0FM5GLbw0Il21M+g==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app-compat': 0.x

  '@firebase/storage-types@0.8.3':
    resolution: {integrity: sha512-+Muk7g9uwngTpd8xn9OdF/D48uiQ7I1Fae7ULsWPuKoCH3HU7bfFPhxtJYzyhjdniowhuDpQcfPmuNRAqZEfvg==}
    peerDependencies:
      '@firebase/app-types': 0.x
      '@firebase/util': 1.x

  '@firebase/storage@0.14.0':
    resolution: {integrity: sha512-xWWbb15o6/pWEw8H01UQ1dC5U3rf8QTAzOChYyCpafV6Xki7KVp3Yaw2nSklUwHEziSWE9KoZJS7iYeyqWnYFA==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      '@firebase/app': 0.x

  '@firebase/util@1.13.0':
    resolution: {integrity: sha512-0AZUyYUfpMNcztR5l09izHwXkZpghLgCUaAGjtMwXnCg3bj4ml5VgiwqOMOxJ+Nw4qN/zJAaOQBcJ7KGkWStqQ==}
    engines: {node: '>=20.0.0'}

  '@firebase/webchannel-wrapper@1.0.5':
    resolution: {integrity: sha512-+uGNN7rkfn41HLO0vekTFhTxk61eKa8mTpRGLO0QSqlQdKvIoGAvLp3ppdVIWbTGYJWM6Kp0iN+PjMIOcnVqTw==}

  '@grpc/grpc-js@1.9.15':
    resolution: {integrity: sha512-nqE7Hc0AzI+euzUwDAy0aY5hCp10r734gMGRdU+qOPX0XSceI2ULrcXB5U2xSc5VkWwalCj4M7GzCAygZl2KoQ==}
    engines: {node: ^8.13.0 || >=10.10.0}

  '@grpc/proto-loader@0.7.15':
    resolution: {integrity: sha512-tMXdRCfYVixjuFK+Hk0Q1s38gV9zDiDJfWL3h1rv4Qc39oILCu1TRTDt7+fGUI8K4G1Fj125Hx/ru3azECWTyQ==}
    engines: {node: '>=6'}
    hasBin: true

  '@next/env@14.2.5':
    resolution: {integrity: sha512-/zZGkrTOsraVfYjGP8uM0p6r0BDT6xWpkjdVbcz66PJVSpwXX3yNiRycxAuDfBKGWBrZBXRuK/YVlkNgxHGwmA==}

  '@next/swc-darwin-arm64@14.2.5':
    resolution: {integrity: sha512-/9zVxJ+K9lrzSGli1///ujyRfon/ZneeZ+v4ptpiPoOU+GKZnm8Wj8ELWU1Pm7GHltYRBklmXMTUqM/DqQ99FQ==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [darwin]

  '@next/swc-darwin-x64@14.2.5':
    resolution: {integrity: sha512-vXHOPCwfDe9qLDuq7U1OYM2wUY+KQ4Ex6ozwsKxp26BlJ6XXbHleOUldenM67JRyBfVjv371oneEvYd3H2gNSA==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [darwin]

  '@next/swc-linux-arm64-gnu@14.2.5':
    resolution: {integrity: sha512-vlhB8wI+lj8q1ExFW8lbWutA4M2ZazQNvMWuEDqZcuJJc78iUnLdPPunBPX8rC4IgT6lIx/adB+Cwrl99MzNaA==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]

  '@next/swc-linux-arm64-musl@14.2.5':
    resolution: {integrity: sha512-NpDB9NUR2t0hXzJJwQSGu1IAOYybsfeB+LxpGsXrRIb7QOrYmidJz3shzY8cM6+rO4Aojuef0N/PEaX18pi9OA==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]

  '@next/swc-linux-x64-gnu@14.2.5':
    resolution: {integrity: sha512-8XFikMSxWleYNryWIjiCX+gU201YS+erTUidKdyOVYi5qUQo/gRxv/3N1oZFCgqpesN6FPeqGM72Zve+nReVXQ==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]

  '@next/swc-linux-x64-musl@14.2.5':
    resolution: {integrity: sha512-6QLwi7RaYiQDcRDSU/os40r5o06b5ue7Jsk5JgdRBGGp8l37RZEh9JsLSM8QF0YDsgcosSeHjglgqi25+m04IQ==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]

  '@next/swc-win32-arm64-msvc@14.2.5':
    resolution: {integrity: sha512-1GpG2VhbspO+aYoMOQPQiqc/tG3LzmsdBH0LhnDS3JrtDx2QmzXe0B6mSZZiN3Bq7IOMXxv1nlsjzoS1+9mzZw==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [win32]

  '@next/swc-win32-ia32-msvc@14.2.5':
    resolution: {integrity: sha512-Igh9ZlxwvCDsu6438FXlQTHlRno4gFpJzqPjSIBZooD22tKeI4fE/YMRoHVJHmrQ2P5YL1DoZ0qaOKkbeFWeMg==}
    engines: {node: '>= 10'}
    cpu: [ia32]
    os: [win32]

  '@next/swc-win32-x64-msvc@14.2.5':
    resolution: {integrity: sha512-tEQ7oinq1/CjSG9uSTerca3v4AZ+dFa+4Yu6ihaG8Ud8ddqLQgFGcnwYls13H5X5CPDPZJdYxyeMui6muOLd4g==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [win32]

  '@protobufjs/aspromise@1.1.2':
    resolution: {integrity: sha512-j+gKExEuLmKwvz3OgROXtrJ2UG2x8Ch2YZUxahh+s1F2HZ+wAceUNLkvy6zKCPVRkU++ZWQrdxsUeQXmcg4uoQ==}

  '@protobufjs/base64@1.1.2':
    resolution: {integrity: sha512-AZkcAA5vnN/v4PDqKyMR5lx7hZttPDgClv83E//FMNhR2TMcLUhfRUBHCmSl0oi9zMgDDqRUJkSxO3wm85+XLg==}

  '@protobufjs/codegen@2.0.4':
    resolution: {integrity: sha512-YyFaikqM5sH0ziFZCN3xDC7zeGaB/d0IUb9CATugHWbd1FRFwWwt4ld4OYMPWu5a3Xe01mGAULCdqhMlPl29Jg==}

  '@protobufjs/eventemitter@1.1.0':
    resolution: {integrity: sha512-j9ednRT81vYJ9OfVuXG6ERSTdEL1xVsNgqpkxMsbIabzSo3goCjDIveeGv5d03om39ML71RdmrGNjG5SReBP/Q==}

  '@protobufjs/fetch@1.1.0':
    resolution: {integrity: sha512-lljVXpqXebpsijW71PZaCYeIcE5on1w5DlQy5WH6GLbFryLUrBD4932W/E2BSpfRJWseIL4v/KPgBFxDOIdKpQ==}

  '@protobufjs/float@1.0.2':
    resolution: {integrity: sha512-Ddb+kVXlXst9d+R9PfTIxh1EdNkgoRe5tOX6t01f1lYWOvJnSPDBlG241QLzcyPdoNTsblLUdujGSE4RzrTZGQ==}

  '@protobufjs/inquire@1.1.0':
    resolution: {integrity: sha512-kdSefcPdruJiFMVSbn801t4vFK7KB/5gd2fYvrxhuJYg8ILrmn9SKSX2tZdV6V+ksulWqS7aXjBcRXl3wHoD9Q==}

  '@protobufjs/path@1.1.2':
    resolution: {integrity: sha512-6JOcJ5Tm08dOHAbdR3GrvP+yUUfkjG5ePsHYczMFLq3ZmMkAD98cDgcT2iA1lJ9NVwFd4tH/iSSoe44YWkltEA==}

  '@protobufjs/pool@1.1.0':
    resolution: {integrity: sha512-0kELaGSIDBKvcgS4zkjz1PeddatrjYcmMWOlAuAPwAeccUrPHdUqo/J6LiymHHEiJT5NrF1UVwxY14f+fy4WQw==}

  '@protobufjs/utf8@1.1.0':
    resolution: {integrity: sha512-Vvn3zZrhQZkkBE8LSuW3em98c0FwgO4nxzv6OdSxPKJIEKY2bGbHn+mhGIPerzI4twdxaP8/0+06HBpwf345Lw==}

  '@swc/counter@0.1.3':
    resolution: {integrity: sha512-e2BR4lsJkkRlKZ/qCHPw9ZaSxc0MVUd7gtbtaB7aMvHeJVYe8sOB8DBZkP2DtISHGSku9sCK6T6cnY0CtXrOCQ==}

  '@swc/helpers@0.5.5':
    resolution: {integrity: sha512-KGYxvIOXcceOAbEk4bi/dVLEK9z8sZ0uBB3Il5b1rhfClSpcX0yfRO0KmTkqR2cnQDymwLB+25ZyMzICg/cm/A==}

  '@types/body-parser@1.19.6':
    resolution: {integrity: sha512-HLFeCYgz89uk22N5Qg3dvGvsv46B8GLvKKo1zKG4NybA8U2DiEO3w9lqGg29t/tfLRJpJ6iQxnVw4OnB7MoM9g==}

  '@types/connect@3.4.38':
    resolution: {integrity: sha512-K6uROf1LD88uDQqJCktA4yzL1YYAK6NgfsI0v/mTgyPKWsX1CnJ0XPSDhViejru1GcRkLWb8RlzFYJRqGUbaug==}

  '@types/cors@2.8.17':
    resolution: {integrity: sha512-8CGDvrBj1zgo2qE+oS3pOCyYNqCPryMWY2bGfwA0dcfopWGgxs+78df0Rs3rc9THP4JkOhLsAa+15VdpAqkcUA==}

  '@types/express-serve-static-core@4.19.7':
    resolution: {integrity: sha512-FvPtiIf1LfhzsaIXhv/PHan/2FeQBbtBDtfX2QfvPxdUelMDEckK08SM6nqo1MIZY3RUlfA+HV8+hFUSio78qg==}

  '@types/express@4.17.21':
    resolution: {integrity: sha512-ejlPM315qwLpaQlQDTjPdsUFSc6ZsP4AN6AlWnogPjQ7CVi7PYF3YVz+CY3jE2pwYf7E/7HlDAN0rV2GxTG0HQ==}

  '@types/http-errors@2.0.5':
    resolution: {integrity: sha512-r8Tayk8HJnX0FztbZN7oVqGccWgw98T/0neJphO91KkmOzug1KkofZURD4UaD5uH8AqcFLfdPErnBod0u71/qg==}

  '@types/mime@1.3.5':
    resolution: {integrity: sha512-/pyBZWSLD2n0dcHE3hq8s8ZvcETHtEuF+3E7XVt0Ig2nvsVQXdghHVcEkIWjy9A0wKfTn97a/PSDYohKIlnP/w==}

  '@types/node@20.11.30':
    resolution: {integrity: sha512-dHM6ZxwlmuZaRmUPfv1p+KrdD1Dci04FbdEm/9wEMouFqxYoFl5aMkt0VMAUtYRQDyYvD41WJLukhq/ha3YuTw==}

  '@types/prop-types@15.7.15':
    resolution: {integrity: sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==}

  '@types/qs@6.14.0':
    resolution: {integrity: sha512-eOunJqu0K1923aExK6y8p6fsihYEn/BYuQ4g0CxAAgFc4b/ZLN4CrsRZ55srTdqoiLzU2B2evC+apEIxprEzkQ==}

  '@types/range-parser@1.2.7':
    resolution: {integrity: sha512-hKormJbkJqzQGhziax5PItDUTMAM9uE2XXQmM37dyd4hVM+5aVl7oVxMVUiVQn2oCQFN/LKCZdvSM0pFRqbSmQ==}

  '@types/react-dom@18.3.7':
    resolution: {integrity: sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==}
    peerDependencies:
      '@types/react': ^18.0.0

  '@types/react@18.2.64':
    resolution: {integrity: sha512-MlmPvHgjj2p3vZaxbQgFUQFvD8QiZwACfGqEdDSWou5yISWxDQ4/74nCAwsUiX7UFLKZz3BbVSPj+YxeoGGCfg==}

  '@types/scheduler@0.26.0':
    resolution: {integrity: sha512-WFHp9YUJQ6CKshqoC37iOlHnQSmxNc795UhB26CyBBttrN9svdIrUjl/NjnNmfcwtncN0h/0PPAFWv9ovP8mLA==}

  '@types/send@0.17.5':
    resolution: {integrity: sha512-z6F2D3cOStZvuk2SaP6YrwkNO65iTZcwA2ZkSABegdkAh/lf+Aa/YQndZVfmEXT5vgAp6zv06VQ3ejSVjAny4w==}

  '@types/send@1.2.0':
    resolution: {integrity: sha512-zBF6vZJn1IaMpg3xUF25VK3gd3l8zwE0ZLRX7dsQyQi+jp4E8mMDJNGDYnYse+bQhYwWERTxVwHpi3dMOq7RKQ==}

  '@types/serve-static@1.15.9':
    resolution: {integrity: sha512-dOTIuqpWLyl3BBXU3maNQsS4A3zuuoYRNIvYSxxhebPfXg2mzWQEPne/nlJ37yOse6uGgR386uTpdsx4D0QZWA==}

  abort-controller@3.0.0:
    resolution: {integrity: sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==}
    engines: {node: '>=6.5'}

  accepts@1.3.8:
    resolution: {integrity: sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==}
    engines: {node: '>= 0.6'}

  ansi-regex@5.0.1:
    resolution: {integrity: sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==}
    engines: {node: '>=8'}

  ansi-styles@4.3.0:
    resolution: {integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==}
    engines: {node: '>=8'}

  array-flatten@1.1.1:
    resolution: {integrity: sha512-PCVAQswWemu6UdxsDFFX/+gVeYqKAod3D3UVm91jHwynguOwAvYPhx8nNlM++NqRcK6CxxpUafjmhIdKiHibqg==}

  atomic-sleep@1.0.0:
    resolution: {integrity: sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==}
    engines: {node: '>=8.0.0'}

  base64-js@1.5.1:
    resolution: {integrity: sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==}

  body-parser@1.20.2:
    resolution: {integrity: sha512-ml9pReCu3M61kGlqoTm2umSXTlRTuGTx0bfYj+uIUKKYycG5NtSbeetV3faSU6R7ajOPw0g/J1PvK4qNy7s5bA==}
    engines: {node: '>= 0.8', npm: 1.2.8000 || >= 1.4.16}

  buffer@6.0.3:
    resolution: {integrity: sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==}

  busboy@1.6.0:
    resolution: {integrity: sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==}
    engines: {node: '>=10.16.0'}

  bytes@3.1.2:
    resolution: {integrity: sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==}
    engines: {node: '>= 0.8'}

  call-bind-apply-helpers@1.0.2:
    resolution: {integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==}
    engines: {node: '>= 0.4'}

  call-bound@1.0.4:
    resolution: {integrity: sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==}
    engines: {node: '>= 0.4'}

  caniuse-lite@1.0.30001749:
    resolution: {integrity: sha512-0rw2fJOmLfnzCRbkm8EyHL8SvI2Apu5UbnQuTsJ0ClgrH8hcwFooJ1s5R0EP8o8aVrFu8++ae29Kt9/gZAZp/Q==}

  client-only@0.0.1:
    resolution: {integrity: sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==}

  cliui@8.0.1:
    resolution: {integrity: sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==}
    engines: {node: '>=12'}

  color-convert@2.0.1:
    resolution: {integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==}
    engines: {node: '>=7.0.0'}

  color-name@1.1.4:
    resolution: {integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==}

  content-disposition@0.5.4:
    resolution: {integrity: sha512-FveZTNuGw04cxlAiWbzi6zTAL/lhehaWbTtgluJh4/E95DqMwTmha3KZN1aAWA8cFIhHzMZUvLevkw5Rqk+tSQ==}
    engines: {node: '>= 0.6'}

  content-type@1.0.5:
    resolution: {integrity: sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==}
    engines: {node: '>= 0.6'}

  cookie-signature@1.0.6:
    resolution: {integrity: sha512-QADzlaHc8icV8I7vbaJXJwod9HWYp8uCqf1xa4OfNu1T7JVxQIrUgOWtHdNDtPiywmFbiS12VjotIXLrKM3orQ==}

  cookie@0.6.0:
    resolution: {integrity: sha512-U71cyTamuh1CRNCfpGY6to28lxvNwPG4Guz/EVjgf3Jmzv0vlDp1atT9eS5dDjMYHucpHbWns6Lwf3BKz6svdw==}
    engines: {node: '>= 0.6'}

  cors@2.8.5:
    resolution: {integrity: sha512-KIHbLJqu73RGr/hnbrO9uBeixNGuvSQjul/jdFvS/KFSIH1hWVd1ng7zOHx+YrEfInLG7q4n6GHQ9cDtxv/P6g==}
    engines: {node: '>= 0.10'}

  csstype@3.1.3:
    resolution: {integrity: sha512-M1uQkMl8rQK/szD0LNhtqxIPLpimGm8sOBwU7lLnCpSbTyY3yeU1Vc7l4KT5zT4s/yOxHH5O7tIuuLOCnLADRw==}

  debug@2.6.9:
    resolution: {integrity: sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==}
    peerDependencies:
      supports-color: '*'
    peerDependenciesMeta:
      supports-color:
        optional: true

  depd@2.0.0:
    resolution: {integrity: sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==}
    engines: {node: '>= 0.8'}

  destroy@1.2.0:
    resolution: {integrity: sha512-2sJGJTaXIIaR1w4iJSNoN0hnMY7Gpc/n8D4qSCJw8QqFWXf7cuAgnEHxBpweaVcPevC2l3KpjYCx3NypQQgaJg==}
    engines: {node: '>= 0.8', npm: 1.2.8000 || >= 1.4.16}

  dunder-proto@1.0.1:
    resolution: {integrity: sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==}
    engines: {node: '>= 0.4'}

  ee-first@1.1.1:
    resolution: {integrity: sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==}

  emoji-regex@8.0.0:
    resolution: {integrity: sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==}

  encodeurl@1.0.2:
    resolution: {integrity: sha512-TPJXq8JqFaVYm2CWmPvnP2Iyo4ZSM7/QKcSmuMLDObfpH5fi7RUGmd/rTDf+rut/saiDiQEeVTNgAmJEdAOx0w==}
    engines: {node: '>= 0.8'}

  es-define-property@1.0.1:
    resolution: {integrity: sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==}
    engines: {node: '>= 0.4'}

  es-errors@1.3.0:
    resolution: {integrity: sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==}
    engines: {node: '>= 0.4'}

  es-object-atoms@1.1.1:
    resolution: {integrity: sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==}
    engines: {node: '>= 0.4'}

  esbuild@0.21.5:
    resolution: {integrity: sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==}
    engines: {node: '>=12'}
    hasBin: true

  escalade@3.2.0:
    resolution: {integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==}
    engines: {node: '>=6'}

  escape-html@1.0.3:
    resolution: {integrity: sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==}

  etag@1.8.1:
    resolution: {integrity: sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==}
    engines: {node: '>= 0.6'}

  event-target-shim@5.0.1:
    resolution: {integrity: sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==}
    engines: {node: '>=6'}

  events@3.3.0:
    resolution: {integrity: sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==}
    engines: {node: '>=0.8.x'}

  express@4.19.2:
    resolution: {integrity: sha512-5T6nhjsT+EOMzuck8JjBHARTHfMht0POzlA60WV2pMD3gyXw2LZnZ+ueGdNxG+0calOJcWKbpFcuzLZ91YWq9Q==}
    engines: {node: '>= 0.10.0'}

  fast-redact@3.5.0:
    resolution: {integrity: sha512-dwsoQlS7h9hMeYUq1W++23NDcBLV4KqONnITDV9DjfS3q1SgDGVrBdvvTLUotWtPSD7asWDV9/CmsZPy8Hf70A==}
    engines: {node: '>=6'}

  faye-websocket@0.11.4:
    resolution: {integrity: sha512-CzbClwlXAuiRQAlUyfqPgvPoNKTckTPGfwZV4ZdAhVcP2lh9KUxJg2b5GkE7XbjKQ3YJnQ9z6D9ntLAlB+tP8g==}
    engines: {node: '>=0.8.0'}

  finalhandler@1.2.0:
    resolution: {integrity: sha512-5uXcUVftlQMFnWC9qu/svkWv3GTd2PfUhK/3PLkYNAe7FbqJMt3515HaxE6eRL74GdsriiwujiawdaB1BpEISg==}
    engines: {node: '>= 0.8'}

  firebase@12.3.0:
    resolution: {integrity: sha512-/JVja0IDO8zPETGv4TvvBwo7RwcQFz+RQ3JBETNtUSeqsDdI9G7fhRTkCy1sPKnLzW0xpm/kL8GOj6ncndTT3g==}

  forwarded@0.2.0:
    resolution: {integrity: sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==}
    engines: {node: '>= 0.6'}

  fresh@0.5.2:
    resolution: {integrity: sha512-zJ2mQYM18rEFOudeV4GShTGIQ7RbzA7ozbU9I/XBpm7kqgMywgmylMwXHxZJmkVoYkna9d2pVXVXPdYTP9ej8Q==}
    engines: {node: '>= 0.6'}

  fsevents@2.3.3:
    resolution: {integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]

  function-bind@1.1.2:
    resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}

  get-caller-file@2.0.5:
    resolution: {integrity: sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==}
    engines: {node: 6.* || 8.* || >= 10.*}

  get-intrinsic@1.3.0:
    resolution: {integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==}
    engines: {node: '>= 0.4'}

  get-proto@1.0.1:
    resolution: {integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==}
    engines: {node: '>= 0.4'}

  get-tsconfig@4.12.0:
    resolution: {integrity: sha512-LScr2aNr2FbjAjZh2C6X6BxRx1/x+aTDExct/xyq2XKbYOiG5c0aK7pMsSuyc0brz3ibr/lbQiHD9jzt4lccJw==}

  gopd@1.2.0:
    resolution: {integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==}
    engines: {node: '>= 0.4'}

  graceful-fs@4.2.11:
    resolution: {integrity: sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==}

  has-symbols@1.1.0:
    resolution: {integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==}
    engines: {node: '>= 0.4'}

  hasown@2.0.2:
    resolution: {integrity: sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==}
    engines: {node: '>= 0.4'}

  http-errors@2.0.0:
    resolution: {integrity: sha512-FtwrG/euBzaEjYeRqOgly7G0qviiXoJWnvEH2Z1plBdXgbyjv34pHTSb9zoeHMyDy33+DWy5Wt9Wo+TURtOYSQ==}
    engines: {node: '>= 0.8'}

  http-parser-js@0.5.10:
    resolution: {integrity: sha512-Pysuw9XpUq5dVc/2SMHpuTY01RFl8fttgcyunjL7eEMhGM3cI4eOmiCycJDVCo/7O7ClfQD3SaI6ftDzqOXYMA==}

  iconv-lite@0.4.24:
    resolution: {integrity: sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==}
    engines: {node: '>=0.10.0'}

  idb@7.1.1:
    resolution: {integrity: sha512-gchesWBzyvGHRO9W8tzUWFDycow5gwjvFKfyV9FF32Y7F50yZMp7mP+T2mJIWFx49zicqyC4uefHM17o6xKIVQ==}

  ieee754@1.2.1:
    resolution: {integrity: sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==}

  inherits@2.0.4:
    resolution: {integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==}

  ipaddr.js@1.9.1:
    resolution: {integrity: sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==}
    engines: {node: '>= 0.10'}

  is-fullwidth-code-point@3.0.0:
    resolution: {integrity: sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==}
    engines: {node: '>=8'}

  js-tokens@4.0.0:
    resolution: {integrity: sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==}

  lodash.camelcase@4.3.0:
    resolution: {integrity: sha512-TwuEnCnxbc3rAvhf/LbG7tJUDzhqXyFnv3dtzLOPgCG/hODL7WFnsbwktkD7yUV0RrreP/l1PALq/YSg6VvjlA==}

  long@5.3.2:
    resolution: {integrity: sha512-mNAgZ1GmyNhD7AuqnTG3/VQ26o760+ZYBPKjPvugO8+nLbYfX6TVpJPseBvopbdY+qpZ/lKUnmEc1LeZYS3QAA==}

  loose-envify@1.4.0:
    resolution: {integrity: sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==}
    hasBin: true

  math-intrinsics@1.1.0:
    resolution: {integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==}
    engines: {node: '>= 0.4'}

  media-typer@0.3.0:
    resolution: {integrity: sha512-dq+qelQ9akHpcOl/gUVRTxVIOkAJ1wR3QAvb4RsVjS8oVoFjDGTc679wJYmUmknUF5HwMLOgb5O+a3KxfWapPQ==}
    engines: {node: '>= 0.6'}

  merge-descriptors@1.0.1:
    resolution: {integrity: sha512-cCi6g3/Zr1iqQi6ySbseM1Xvooa98N0w31jzUYrXPX2xqObmFGHJ0tQ5u74H3mVh7wLouTseZyYIq39g8cNp1w==}

  methods@1.1.2:
    resolution: {integrity: sha512-iclAHeNqNm68zFtnZ0e+1L2yUIdvzNoauKU4WBA3VvH/vPFieF7qfRlwUZU+DA9P9bPXIS90ulxoUoCH23sV2w==}
    engines: {node: '>= 0.6'}

  mime-db@1.52.0:
    resolution: {integrity: sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==}
    engines: {node: '>= 0.6'}

  mime-types@2.1.35:
    resolution: {integrity: sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==}
    engines: {node: '>= 0.6'}

  mime@1.6.0:
    resolution: {integrity: sha512-x0Vn8spI+wuJ1O6S7gnbaQg8Pxh4NNHb7KSINmEWKiPE4RKOplvijn+NkmYmmRgP68mc70j2EbeTFRsrswaQeg==}
    engines: {node: '>=4'}
    hasBin: true

  ms@2.0.0:
    resolution: {integrity: sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==}

  ms@2.1.3:
    resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}

  nanoid@3.3.11:
    resolution: {integrity: sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==}
    engines: {node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1}
    hasBin: true

  negotiator@0.6.3:
    resolution: {integrity: sha512-+EUsqGPLsM+j/zdChZjsnX51g4XrHFOIXwfnCVPGlQk/k5giakcKsuxCObBRu6DSm9opw/O6slWbJdghQM4bBg==}
    engines: {node: '>= 0.6'}

  next@14.2.5:
    resolution: {integrity: sha512-0f8aRfBVL+mpzfBjYfQuLWh2WyAwtJXCRfkPF4UJ5qd2YwrHczsrSzXU4tRMV0OAxR8ZJZWPFn6uhSC56UTsLA==}
    engines: {node: '>=18.17.0'}
    hasBin: true
    peerDependencies:
      '@opentelemetry/api': ^1.1.0
      '@playwright/test': ^1.41.2
      react: ^18.2.0
      react-dom: ^18.2.0
      sass: ^1.3.0
    peerDependenciesMeta:
      '@opentelemetry/api':
        optional: true
      '@playwright/test':
        optional: true
      sass:
        optional: true

  object-assign@4.1.1:
    resolution: {integrity: sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==}
    engines: {node: '>=0.10.0'}

  object-inspect@1.13.4:
    resolution: {integrity: sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==}
    engines: {node: '>= 0.4'}

  on-exit-leak-free@2.1.2:
    resolution: {integrity: sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==}
    engines: {node: '>=14.0.0'}

  on-finished@2.4.1:
    resolution: {integrity: sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==}
    engines: {node: '>= 0.8'}

  parseurl@1.3.3:
    resolution: {integrity: sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==}
    engines: {node: '>= 0.8'}

  path-to-regexp@0.1.7:
    resolution: {integrity: sha512-5DFkuoqlv1uYQKxy8omFBeJPQcdoE07Kv2sferDCrAq1ohOU+MSDswDIbnx3YAM60qIOnYa53wBhXW0EbMonrQ==}

  picocolors@1.1.1:
    resolution: {integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==}

  pino-abstract-transport@1.2.0:
    resolution: {integrity: sha512-Guhh8EZfPCfH+PMXAb6rKOjGQEoy0xlAIn+irODG5kgfYV+BQ0rGYYWTIel3P5mmyXqkYkPmdIkywsn6QKUR1Q==}

  pino-std-serializers@6.2.2:
    resolution: {integrity: sha512-cHjPPsE+vhj/tnhCy/wiMh3M3z3h/j15zHQX+S9GkTBgqJuTuJzYJ4gUyACLhDaJ7kk9ba9iRDmbH2tJU03OiA==}

  pino@9.0.0:
    resolution: {integrity: sha512-uI1ThkzTShNSwvsUM6b4ND8ANzWURk9zTELMztFkmnCQeR/4wkomJ+echHee5GMWGovoSfjwdeu80DsFIt7mbA==}
    hasBin: true

  postcss@8.4.31:
    resolution: {integrity: sha512-PS08Iboia9mts/2ygV3eLpY5ghnUcfLV/EXTOW1E2qYxJKGGBUtNjN76FYHnMs36RmARn41bC0AZmn+rR0OVpQ==}
    engines: {node: ^10 || ^12 || >=14}

  process-warning@3.0.0:
    resolution: {integrity: sha512-mqn0kFRl0EoqhnL0GQ0veqFHyIN1yig9RHh/InzORTUiZHFRAur+aMtRkELNwGs9aNwKS6tg/An4NYBPGwvtzQ==}

  process@0.11.10:
    resolution: {integrity: sha512-cdGef/drWFoydD1JsMzuFf8100nZl+GT+yacc2bEced5f9Rjk4z+WtFUTBu9PhOi9j/jfmBPu0mMEY4wIdAF8A==}
    engines: {node: '>= 0.6.0'}

  protobufjs@7.5.4:
    resolution: {integrity: sha512-CvexbZtbov6jW2eXAvLukXjXUW1TzFaivC46BpWc/3BpcCysb5Vffu+B3XHMm8lVEuy2Mm4XGex8hBSg1yapPg==}
    engines: {node: '>=12.0.0'}

  proxy-addr@2.0.7:
    resolution: {integrity: sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==}
    engines: {node: '>= 0.10'}

  qs@6.11.0:
    resolution: {integrity: sha512-MvjoMCJwEarSbUYk5O+nmoSzSutSsTwF85zcHPQ9OrlFoZOYIjaqBAJIqIXjptyD5vThxGq52Xu/MaJzRkIk4Q==}
    engines: {node: '>=0.6'}

  quick-format-unescaped@4.0.4:
    resolution: {integrity: sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==}

  range-parser@1.2.1:
    resolution: {integrity: sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==}
    engines: {node: '>= 0.6'}

  raw-body@2.5.2:
    resolution: {integrity: sha512-8zGqypfENjCIqGhgXToC8aB2r7YrBX+AQAfIPs/Mlk+BtPTztOvTS01NRW/3Eh60J+a48lt8qsCzirQ6loCVfA==}
    engines: {node: '>= 0.8'}

  react-dom@18.2.0:
    resolution: {integrity: sha512-6IMTriUmvsjHUjNtEDudZfuDQUoWXVxKHhlEGSk81n4YFS+r/Kl99wXiwlVXtPBtJenozv2P+hxDsw9eA7Xo6g==}
    peerDependencies:
      react: ^18.2.0

  react@18.2.0:
    resolution: {integrity: sha512-/3IjMdb2L9QbBdWiW5e3P2/npwMBaU9mHCSCUzNln0ZCYbcfTsGbTJrU/kGemdH2IWmB2ioZ+zkxtmq6g09fGQ==}
    engines: {node: '>=0.10.0'}

  readable-stream@4.7.0:
    resolution: {integrity: sha512-oIGGmcpTLwPga8Bn6/Z75SVaH1z5dUut2ibSyAMVhmUggWpmDn2dapB0n7f8nwaSiRtepAsfJyfXIO5DCVAODg==}
    engines: {node: ^12.22.0 || ^14.17.0 || >=16.0.0}

  real-require@0.2.0:
    resolution: {integrity: sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==}
    engines: {node: '>= 12.13.0'}

  require-directory@2.1.1:
    resolution: {integrity: sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==}
    engines: {node: '>=0.10.0'}

  resolve-pkg-maps@1.0.0:
    resolution: {integrity: sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==}

  safe-buffer@5.2.1:
    resolution: {integrity: sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==}

  safe-stable-stringify@2.5.0:
    resolution: {integrity: sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==}
    engines: {node: '>=10'}

  safer-buffer@2.1.2:
    resolution: {integrity: sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==}

  scheduler@0.23.2:
    resolution: {integrity: sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==}

  send@0.18.0:
    resolution: {integrity: sha512-qqWzuOjSFOuqPjFe4NOsMLafToQQwBSOEpS+FwEt3A2V3vKubTquT3vmLTQpFgMXp8AlFWFuP1qKaJZOtPpVXg==}
    engines: {node: '>= 0.8.0'}

  serve-static@1.15.0:
    resolution: {integrity: sha512-XGuRDNjXUijsUL0vl6nSD7cwURuzEgglbOaFuZM9g3kwDXOWVTck0jLzjPzGD+TazWbboZYu52/9/XPdUgne9g==}
    engines: {node: '>= 0.8.0'}

  setprototypeof@1.2.0:
    resolution: {integrity: sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==}

  side-channel-list@1.0.0:
    resolution: {integrity: sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==}
    engines: {node: '>= 0.4'}

  side-channel-map@1.0.1:
    resolution: {integrity: sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==}
    engines: {node: '>= 0.4'}

  side-channel-weakmap@1.0.2:
    resolution: {integrity: sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==}
    engines: {node: '>= 0.4'}

  side-channel@1.1.0:
    resolution: {integrity: sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==}
    engines: {node: '>= 0.4'}

  sonic-boom@3.8.1:
    resolution: {integrity: sha512-y4Z8LCDBuum+PBP3lSV7RHrXscqksve/bi0as7mhwVnBW+/wUqKT/2Kb7um8yqcFy0duYbbPxzt89Zy2nOCaxg==}

  source-map-js@1.2.1:
    resolution: {integrity: sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==}
    engines: {node: '>=0.10.0'}

  split2@4.2.0:
    resolution: {integrity: sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==}
    engines: {node: '>= 10.x'}

  statuses@2.0.1:
    resolution: {integrity: sha512-RwNA9Z/7PrK06rYLIzFMlaF+l73iwpzsqRIFgbMLbTcLD6cOao82TaWefPXQvB2fOC4AjuYSEndS7N/mTCbkdQ==}
    engines: {node: '>= 0.8'}

  streamsearch@1.1.0:
    resolution: {integrity: sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==}
    engines: {node: '>=10.0.0'}

  string-width@4.2.3:
    resolution: {integrity: sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==}
    engines: {node: '>=8'}

  string_decoder@1.3.0:
    resolution: {integrity: sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==}

  strip-ansi@6.0.1:
    resolution: {integrity: sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==}
    engines: {node: '>=8'}

  styled-jsx@5.1.1:
    resolution: {integrity: sha512-pW7uC1l4mBZ8ugbiZrcIsiIvVx1UmTfw7UkC3Um2tmfUq9Bhk8IiyEIPl6F8agHgjzku6j0xQEZbfA5uSgSaCw==}
    engines: {node: '>= 12.0.0'}
    peerDependencies:
      '@babel/core': '*'
      babel-plugin-macros: '*'
      react: '>= 16.8.0 || 17.x.x || ^18.0.0-0'
    peerDependenciesMeta:
      '@babel/core':
        optional: true
      babel-plugin-macros:
        optional: true

  thread-stream@2.7.0:
    resolution: {integrity: sha512-qQiRWsU/wvNolI6tbbCKd9iKaTnCXsTwVxhhKM6nctPdujTyztjlbUkUTUymidWcMnZ5pWR0ej4a0tjsW021vw==}

  toidentifier@1.0.1:
    resolution: {integrity: sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==}
    engines: {node: '>=0.6'}

  tslib@2.8.1:
    resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

  tsx@4.16.2:
    resolution: {integrity: sha512-C1uWweJDgdtX2x600HjaFaucXTilT7tgUZHbOE4+ypskZ1OP8CRCSDkCxG6Vya9EwaFIVagWwpaVAn5wzypaqQ==}
    engines: {node: '>=18.0.0'}
    hasBin: true

  type-is@1.6.18:
    resolution: {integrity: sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==}
    engines: {node: '>= 0.6'}

  typescript@5.5.4:
    resolution: {integrity: sha512-Mtq29sKDAEYP7aljRgtPOpTvOfbwRWlS6dPRzwjdE+C0R4brX/GUyhHSecbHMFLNBLcJIPt9nl9yG5TZ1weH+Q==}
    engines: {node: '>=14.17'}
    hasBin: true

  undici-types@5.26.5:
    resolution: {integrity: sha512-JlCMO+ehdEIKqlFxk6IfVoAUVmgz7cU7zD/h9XZ0qzeosSHmUJVOzSQvvYSYWXkFXC+IfLKSIffhv0sVZup6pA==}

  unpipe@1.0.0:
    resolution: {integrity: sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==}
    engines: {node: '>= 0.8'}

  utils-merge@1.0.1:
    resolution: {integrity: sha512-pMZTvIkT1d+TFGvDOqodOclx0QWkkgi6Tdoa8gC8ffGAAqz9pzPTZWAybbsHHoED/ztMtkv/VoYTYyShUn81hA==}
    engines: {node: '>= 0.4.0'}

  vary@1.1.2:
    resolution: {integrity: sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==}
    engines: {node: '>= 0.8'}

  web-vitals@4.2.4:
    resolution: {integrity: sha512-r4DIlprAGwJ7YM11VZp4R884m0Vmgr6EAKe3P+kO0PPj3Unqyvv59rczf6UiGcb9Z8QxZVcqKNwv/g0WNdWwsw==}

  websocket-driver@0.7.4:
    resolution: {integrity: sha512-b17KeDIQVjvb0ssuSDF2cYXSg2iztliJ4B9WdsuB6J952qCPKmnVq4DyW5motImXHDC1cBT/1UezrJVsKw5zjg==}
    engines: {node: '>=0.8.0'}

  websocket-extensions@0.1.4:
    resolution: {integrity: sha512-OqedPIGOfsDlo31UNwYbCFMSaO9m9G/0faIHj5/dZFDMFqPTcx6UwqyOy3COEaEOg/9VsGIpdqn62W5KhoKSpg==}
    engines: {node: '>=0.8.0'}

  wrap-ansi@7.0.0:
    resolution: {integrity: sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==}
    engines: {node: '>=10'}

  y18n@5.0.8:
    resolution: {integrity: sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==}
    engines: {node: '>=10'}

  yargs-parser@21.1.1:
    resolution: {integrity: sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==}
    engines: {node: '>=12'}

  yargs@17.7.2:
    resolution: {integrity: sha512-7dSzzRQ++CKnNI/krKnYRV7JKKPUXMEh61soaHKg9mrWEhzFWhFnxPxGl+69cD1Ou63C13NUPCnmIcrvqCuM6w==}
    engines: {node: '>=12'}

  zod@3.23.8:
    resolution: {integrity: sha512-XBx9AXhXktjUqnepgTiE5flcKIYWi/rme0Eaj+5Y0lftuGBq+jyRu/md4WnuxqgP1ubdpNCsYEYPxrzVHD8d6g==}

snapshots:

  '@esbuild/aix-ppc64@0.21.5':
    optional: true

  '@esbuild/android-arm64@0.21.5':
    optional: true

  '@esbuild/android-arm@0.21.5':
    optional: true

  '@esbuild/android-x64@0.21.5':
    optional: true

  '@esbuild/darwin-arm64@0.21.5':
    optional: true

  '@esbuild/darwin-x64@0.21.5':
    optional: true

  '@esbuild/freebsd-arm64@0.21.5':
    optional: true

  '@esbuild/freebsd-x64@0.21.5':
    optional: true

  '@esbuild/linux-arm64@0.21.5':
    optional: true

  '@esbuild/linux-arm@0.21.5':
    optional: true

  '@esbuild/linux-ia32@0.21.5':
    optional: true

  '@esbuild/linux-loong64@0.21.5':
    optional: true

  '@esbuild/linux-mips64el@0.21.5':
    optional: true

  '@esbuild/linux-ppc64@0.21.5':
    optional: true

  '@esbuild/linux-riscv64@0.21.5':
    optional: true

  '@esbuild/linux-s390x@0.21.5':
    optional: true

  '@esbuild/linux-x64@0.21.5':
    optional: true

  '@esbuild/netbsd-x64@0.21.5':
    optional: true

  '@esbuild/openbsd-x64@0.21.5':
    optional: true

  '@esbuild/sunos-x64@0.21.5':
    optional: true

  '@esbuild/win32-arm64@0.21.5':
    optional: true

  '@esbuild/win32-ia32@0.21.5':
    optional: true

  '@esbuild/win32-x64@0.21.5':
    optional: true

  '@firebase/ai@2.3.0(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/app-check-interop-types': 0.3.3
      '@firebase/app-types': 0.9.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/analytics-compat@0.2.24(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/analytics': 0.10.18(@firebase/app@0.14.3)
      '@firebase/analytics-types': 0.8.3
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'

  '@firebase/analytics-types@0.8.3': {}

  '@firebase/analytics@0.10.18(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/installations': 0.6.19(@firebase/app@0.14.3)
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/app-check-compat@0.4.0(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-check': 0.11.0(@firebase/app@0.14.3)
      '@firebase/app-check-types': 0.5.3
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'

  '@firebase/app-check-interop-types@0.3.3': {}

  '@firebase/app-check-types@0.5.3': {}

  '@firebase/app-check@0.11.0(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/app-compat@0.5.3':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/app-types@0.9.3': {}

  '@firebase/app@0.14.3':
    dependencies:
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      idb: 7.1.1
      tslib: 2.8.1

  '@firebase/auth-compat@0.6.0(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/auth': 1.11.0(@firebase/app@0.14.3)
      '@firebase/auth-types': 0.13.0(@firebase/app-types@0.9.3)(@firebase/util@1.13.0)
      '@firebase/component': 0.7.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'
      - '@firebase/app-types'
      - '@react-native-async-storage/async-storage'

  '@firebase/auth-interop-types@0.2.4': {}

  '@firebase/auth-types@0.13.0(@firebase/app-types@0.9.3)(@firebase/util@1.13.0)':
    dependencies:
      '@firebase/app-types': 0.9.3
      '@firebase/util': 1.13.0

  '@firebase/auth@1.11.0(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/component@0.7.0':
    dependencies:
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/data-connect@0.3.11(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/auth-interop-types': 0.2.4
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/database-compat@2.1.0':
    dependencies:
      '@firebase/component': 0.7.0
      '@firebase/database': 1.1.0
      '@firebase/database-types': 1.0.16
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/database-types@1.0.16':
    dependencies:
      '@firebase/app-types': 0.9.3
      '@firebase/util': 1.13.0

  '@firebase/database@1.1.0':
    dependencies:
      '@firebase/app-check-interop-types': 0.3.3
      '@firebase/auth-interop-types': 0.2.4
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      faye-websocket: 0.11.4
      tslib: 2.8.1

  '@firebase/firestore-compat@0.4.2(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/firestore': 4.9.2(@firebase/app@0.14.3)
      '@firebase/firestore-types': 3.0.3(@firebase/app-types@0.9.3)(@firebase/util@1.13.0)
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'
      - '@firebase/app-types'

  '@firebase/firestore-types@3.0.3(@firebase/app-types@0.9.3)(@firebase/util@1.13.0)':
    dependencies:
      '@firebase/app-types': 0.9.3
      '@firebase/util': 1.13.0

  '@firebase/firestore@4.9.2(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      '@firebase/webchannel-wrapper': 1.0.5
      '@grpc/grpc-js': 1.9.15
      '@grpc/proto-loader': 0.7.15
      tslib: 2.8.1

  '@firebase/functions-compat@0.4.1(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/functions': 0.13.1(@firebase/app@0.14.3)
      '@firebase/functions-types': 0.6.3
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'

  '@firebase/functions-types@0.6.3': {}

  '@firebase/functions@0.13.1(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/app-check-interop-types': 0.3.3
      '@firebase/auth-interop-types': 0.2.4
      '@firebase/component': 0.7.0
      '@firebase/messaging-interop-types': 0.2.3
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/installations-compat@0.2.19(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/installations': 0.6.19(@firebase/app@0.14.3)
      '@firebase/installations-types': 0.5.3(@firebase/app-types@0.9.3)
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'
      - '@firebase/app-types'

  '@firebase/installations-types@0.5.3(@firebase/app-types@0.9.3)':
    dependencies:
      '@firebase/app-types': 0.9.3

  '@firebase/installations@0.6.19(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/util': 1.13.0
      idb: 7.1.1
      tslib: 2.8.1

  '@firebase/logger@0.5.0':
    dependencies:
      tslib: 2.8.1

  '@firebase/messaging-compat@0.2.23(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/messaging': 0.12.23(@firebase/app@0.14.3)
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'

  '@firebase/messaging-interop-types@0.2.3': {}

  '@firebase/messaging@0.12.23(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/installations': 0.6.19(@firebase/app@0.14.3)
      '@firebase/messaging-interop-types': 0.2.3
      '@firebase/util': 1.13.0
      idb: 7.1.1
      tslib: 2.8.1

  '@firebase/performance-compat@0.2.22(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/performance': 0.7.9(@firebase/app@0.14.3)
      '@firebase/performance-types': 0.2.3
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'

  '@firebase/performance-types@0.2.3': {}

  '@firebase/performance@0.7.9(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/installations': 0.6.19(@firebase/app@0.14.3)
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1
      web-vitals: 4.2.4

  '@firebase/remote-config-compat@0.2.20(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/logger': 0.5.0
      '@firebase/remote-config': 0.7.0(@firebase/app@0.14.3)
      '@firebase/remote-config-types': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'

  '@firebase/remote-config-types@0.5.0': {}

  '@firebase/remote-config@0.7.0(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/installations': 0.6.19(@firebase/app@0.14.3)
      '@firebase/logger': 0.5.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/storage-compat@0.4.0(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app-compat': 0.5.3
      '@firebase/component': 0.7.0
      '@firebase/storage': 0.14.0(@firebase/app@0.14.3)
      '@firebase/storage-types': 0.8.3(@firebase/app-types@0.9.3)(@firebase/util@1.13.0)
      '@firebase/util': 1.13.0
      tslib: 2.8.1
    transitivePeerDependencies:
      - '@firebase/app'
      - '@firebase/app-types'

  '@firebase/storage-types@0.8.3(@firebase/app-types@0.9.3)(@firebase/util@1.13.0)':
    dependencies:
      '@firebase/app-types': 0.9.3
      '@firebase/util': 1.13.0

  '@firebase/storage@0.14.0(@firebase/app@0.14.3)':
    dependencies:
      '@firebase/app': 0.14.3
      '@firebase/component': 0.7.0
      '@firebase/util': 1.13.0
      tslib: 2.8.1

  '@firebase/util@1.13.0':
    dependencies:
      tslib: 2.8.1

  '@firebase/webchannel-wrapper@1.0.5': {}

  '@grpc/grpc-js@1.9.15':
    dependencies:
      '@grpc/proto-loader': 0.7.15
      '@types/node': 20.11.30

  '@grpc/proto-loader@0.7.15':
    dependencies:
      lodash.camelcase: 4.3.0
      long: 5.3.2
      protobufjs: 7.5.4
      yargs: 17.7.2

  '@next/env@14.2.5': {}

  '@next/swc-darwin-arm64@14.2.5':
    optional: true

  '@next/swc-darwin-x64@14.2.5':
    optional: true

  '@next/swc-linux-arm64-gnu@14.2.5':
    optional: true

  '@next/swc-linux-arm64-musl@14.2.5':
    optional: true

  '@next/swc-linux-x64-gnu@14.2.5':
    optional: true

  '@next/swc-linux-x64-musl@14.2.5':
    optional: true

  '@next/swc-win32-arm64-msvc@14.2.5':
    optional: true

  '@next/swc-win32-ia32-msvc@14.2.5':
    optional: true

  '@next/swc-win32-x64-msvc@14.2.5':
    optional: true

  '@protobufjs/aspromise@1.1.2': {}

  '@protobufjs/base64@1.1.2': {}

  '@protobufjs/codegen@2.0.4': {}

  '@protobufjs/eventemitter@1.1.0': {}

  '@protobufjs/fetch@1.1.0':
    dependencies:
      '@protobufjs/aspromise': 1.1.2
      '@protobufjs/inquire': 1.1.0

  '@protobufjs/float@1.0.2': {}

  '@protobufjs/inquire@1.1.0': {}

  '@protobufjs/path@1.1.2': {}

  '@protobufjs/pool@1.1.0': {}

  '@protobufjs/utf8@1.1.0': {}

  '@swc/counter@0.1.3': {}

  '@swc/helpers@0.5.5':
    dependencies:
      '@swc/counter': 0.1.3
      tslib: 2.8.1

  '@types/body-parser@1.19.6':
    dependencies:
      '@types/connect': 3.4.38
      '@types/node': 20.11.30

  '@types/connect@3.4.38':
    dependencies:
      '@types/node': 20.11.30

  '@types/cors@2.8.17':
    dependencies:
      '@types/node': 20.11.30

  '@types/express-serve-static-core@4.19.7':
    dependencies:
      '@types/node': 20.11.30
      '@types/qs': 6.14.0
      '@types/range-parser': 1.2.7
      '@types/send': 1.2.0

  '@types/express@4.17.21':
    dependencies:
      '@types/body-parser': 1.19.6
      '@types/express-serve-static-core': 4.19.7
      '@types/qs': 6.14.0
      '@types/serve-static': 1.15.9

  '@types/http-errors@2.0.5': {}

  '@types/mime@1.3.5': {}

  '@types/node@20.11.30':
    dependencies:
      undici-types: 5.26.5

  '@types/prop-types@15.7.15': {}

  '@types/qs@6.14.0': {}

  '@types/range-parser@1.2.7': {}

  '@types/react-dom@18.3.7(@types/react@18.2.64)':
    dependencies:
      '@types/react': 18.2.64

  '@types/react@18.2.64':
    dependencies:
      '@types/prop-types': 15.7.15
      '@types/scheduler': 0.26.0
      csstype: 3.1.3

  '@types/scheduler@0.26.0': {}

  '@types/send@0.17.5':
    dependencies:
      '@types/mime': 1.3.5
      '@types/node': 20.11.30

  '@types/send@1.2.0':
    dependencies:
      '@types/node': 20.11.30

  '@types/serve-static@1.15.9':
    dependencies:
      '@types/http-errors': 2.0.5
      '@types/node': 20.11.30
      '@types/send': 0.17.5

  abort-controller@3.0.0:
    dependencies:
      event-target-shim: 5.0.1

  accepts@1.3.8:
    dependencies:
      mime-types: 2.1.35
      negotiator: 0.6.3

  ansi-regex@5.0.1: {}

  ansi-styles@4.3.0:
    dependencies:
      color-convert: 2.0.1

  array-flatten@1.1.1: {}

  atomic-sleep@1.0.0: {}

  base64-js@1.5.1: {}

  body-parser@1.20.2:
    dependencies:
      bytes: 3.1.2
      content-type: 1.0.5
      debug: 2.6.9
      depd: 2.0.0
      destroy: 1.2.0
      http-errors: 2.0.0
      iconv-lite: 0.4.24
      on-finished: 2.4.1
      qs: 6.11.0
      raw-body: 2.5.2
      type-is: 1.6.18
      unpipe: 1.0.0
    transitivePeerDependencies:
      - supports-color

  buffer@6.0.3:
    dependencies:
      base64-js: 1.5.1
      ieee754: 1.2.1

  busboy@1.6.0:
    dependencies:
      streamsearch: 1.1.0

  bytes@3.1.2: {}

  call-bind-apply-helpers@1.0.2:
    dependencies:
      es-errors: 1.3.0
      function-bind: 1.1.2

  call-bound@1.0.4:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      get-intrinsic: 1.3.0

  caniuse-lite@1.0.30001749: {}

  client-only@0.0.1: {}

  cliui@8.0.1:
    dependencies:
      string-width: 4.2.3
      strip-ansi: 6.0.1
      wrap-ansi: 7.0.0

  color-convert@2.0.1:
    dependencies:
      color-name: 1.1.4

  color-name@1.1.4: {}

  content-disposition@0.5.4:
    dependencies:
      safe-buffer: 5.2.1

  content-type@1.0.5: {}

  cookie-signature@1.0.6: {}

  cookie@0.6.0: {}

  cors@2.8.5:
    dependencies:
      object-assign: 4.1.1
      vary: 1.1.2

  csstype@3.1.3: {}

  debug@2.6.9:
    dependencies:
      ms: 2.0.0

  depd@2.0.0: {}

  destroy@1.2.0: {}

  dunder-proto@1.0.1:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-errors: 1.3.0
      gopd: 1.2.0

  ee-first@1.1.1: {}

  emoji-regex@8.0.0: {}

  encodeurl@1.0.2: {}

  es-define-property@1.0.1: {}

  es-errors@1.3.0: {}

  es-object-atoms@1.1.1:
    dependencies:
      es-errors: 1.3.0

  esbuild@0.21.5:
    optionalDependencies:
      '@esbuild/aix-ppc64': 0.21.5
      '@esbuild/android-arm': 0.21.5
      '@esbuild/android-arm64': 0.21.5
      '@esbuild/android-x64': 0.21.5
      '@esbuild/darwin-arm64': 0.21.5
      '@esbuild/darwin-x64': 0.21.5
      '@esbuild/freebsd-arm64': 0.21.5
      '@esbuild/freebsd-x64': 0.21.5
      '@esbuild/linux-arm': 0.21.5
      '@esbuild/linux-arm64': 0.21.5
      '@esbuild/linux-ia32': 0.21.5
      '@esbuild/linux-loong64': 0.21.5
      '@esbuild/linux-mips64el': 0.21.5
      '@esbuild/linux-ppc64': 0.21.5
      '@esbuild/linux-riscv64': 0.21.5
      '@esbuild/linux-s390x': 0.21.5
      '@esbuild/linux-x64': 0.21.5
      '@esbuild/netbsd-x64': 0.21.5
      '@esbuild/openbsd-x64': 0.21.5
      '@esbuild/sunos-x64': 0.21.5
      '@esbuild/win32-arm64': 0.21.5
      '@esbuild/win32-ia32': 0.21.5
      '@esbuild/win32-x64': 0.21.5

  escalade@3.2.0: {}

  escape-html@1.0.3: {}

  etag@1.8.1: {}

  event-target-shim@5.0.1: {}

  events@3.3.0: {}

  express@4.19.2:
    dependencies:
      accepts: 1.3.8
      array-flatten: 1.1.1
      body-parser: 1.20.2
      content-disposition: 0.5.4
      content-type: 1.0.5
      cookie: 0.6.0
      cookie-signature: 1.0.6
      debug: 2.6.9
      depd: 2.0.0
      encodeurl: 1.0.2
      escape-html: 1.0.3
      etag: 1.8.1
      finalhandler: 1.2.0
      fresh: 0.5.2
      http-errors: 2.0.0
      merge-descriptors: 1.0.1
      methods: 1.1.2
      on-finished: 2.4.1
      parseurl: 1.3.3
      path-to-regexp: 0.1.7
      proxy-addr: 2.0.7
      qs: 6.11.0
      range-parser: 1.2.1
      safe-buffer: 5.2.1
      send: 0.18.0
      serve-static: 1.15.0
      setprototypeof: 1.2.0
      statuses: 2.0.1
      type-is: 1.6.18
      utils-merge: 1.0.1
      vary: 1.1.2
    transitivePeerDependencies:
      - supports-color

  fast-redact@3.5.0: {}

  faye-websocket@0.11.4:
    dependencies:
      websocket-driver: 0.7.4

  finalhandler@1.2.0:
    dependencies:
      debug: 2.6.9
      encodeurl: 1.0.2
      escape-html: 1.0.3
      on-finished: 2.4.1
      parseurl: 1.3.3
      statuses: 2.0.1
      unpipe: 1.0.0
    transitivePeerDependencies:
      - supports-color

  firebase@12.3.0:
    dependencies:
      '@firebase/ai': 2.3.0(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)
      '@firebase/analytics': 0.10.18(@firebase/app@0.14.3)
      '@firebase/analytics-compat': 0.2.24(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)
      '@firebase/app': 0.14.3
      '@firebase/app-check': 0.11.0(@firebase/app@0.14.3)
      '@firebase/app-check-compat': 0.4.0(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)
      '@firebase/app-compat': 0.5.3
      '@firebase/app-types': 0.9.3
      '@firebase/auth': 1.11.0(@firebase/app@0.14.3)
      '@firebase/auth-compat': 0.6.0(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)
      '@firebase/data-connect': 0.3.11(@firebase/app@0.14.3)
      '@firebase/database': 1.1.0
      '@firebase/database-compat': 2.1.0
      '@firebase/firestore': 4.9.2(@firebase/app@0.14.3)
      '@firebase/firestore-compat': 0.4.2(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)
      '@firebase/functions': 0.13.1(@firebase/app@0.14.3)
      '@firebase/functions-compat': 0.4.1(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)
      '@firebase/installations': 0.6.19(@firebase/app@0.14.3)
      '@firebase/installations-compat': 0.2.19(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)
      '@firebase/messaging': 0.12.23(@firebase/app@0.14.3)
      '@firebase/messaging-compat': 0.2.23(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)
      '@firebase/performance': 0.7.9(@firebase/app@0.14.3)
      '@firebase/performance-compat': 0.2.22(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)
      '@firebase/remote-config': 0.7.0(@firebase/app@0.14.3)
      '@firebase/remote-config-compat': 0.2.20(@firebase/app-compat@0.5.3)(@firebase/app@0.14.3)
      '@firebase/storage': 0.14.0(@firebase/app@0.14.3)
      '@firebase/storage-compat': 0.4.0(@firebase/app-compat@0.5.3)(@firebase/app-types@0.9.3)(@firebase/app@0.14.3)
      '@firebase/util': 1.13.0
    transitivePeerDependencies:
      - '@react-native-async-storage/async-storage'

  forwarded@0.2.0: {}

  fresh@0.5.2: {}

  fsevents@2.3.3:
    optional: true

  function-bind@1.1.2: {}

  get-caller-file@2.0.5: {}

  get-intrinsic@1.3.0:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-define-property: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      function-bind: 1.1.2
      get-proto: 1.0.1
      gopd: 1.2.0
      has-symbols: 1.1.0
      hasown: 2.0.2
      math-intrinsics: 1.1.0

  get-proto@1.0.1:
    dependencies:
      dunder-proto: 1.0.1
      es-object-atoms: 1.1.1

  get-tsconfig@4.12.0:
    dependencies:
      resolve-pkg-maps: 1.0.0

  gopd@1.2.0: {}

  graceful-fs@4.2.11: {}

  has-symbols@1.1.0: {}

  hasown@2.0.2:
    dependencies:
      function-bind: 1.1.2

  http-errors@2.0.0:
    dependencies:
      depd: 2.0.0
      inherits: 2.0.4
      setprototypeof: 1.2.0
      statuses: 2.0.1
      toidentifier: 1.0.1

  http-parser-js@0.5.10: {}

  iconv-lite@0.4.24:
    dependencies:
      safer-buffer: 2.1.2

  idb@7.1.1: {}

  ieee754@1.2.1: {}

  inherits@2.0.4: {}

  ipaddr.js@1.9.1: {}

  is-fullwidth-code-point@3.0.0: {}

  js-tokens@4.0.0: {}

  lodash.camelcase@4.3.0: {}

  long@5.3.2: {}

  loose-envify@1.4.0:
    dependencies:
      js-tokens: 4.0.0

  math-intrinsics@1.1.0: {}

  media-typer@0.3.0: {}

  merge-descriptors@1.0.1: {}

  methods@1.1.2: {}

  mime-db@1.52.0: {}

  mime-types@2.1.35:
    dependencies:
      mime-db: 1.52.0

  mime@1.6.0: {}

  ms@2.0.0: {}

  ms@2.1.3: {}

  nanoid@3.3.11: {}

  negotiator@0.6.3: {}

  next@14.2.5(react-dom@18.2.0(react@18.2.0))(react@18.2.0):
    dependencies:
      '@next/env': 14.2.5
      '@swc/helpers': 0.5.5
      busboy: 1.6.0
      caniuse-lite: 1.0.30001749
      graceful-fs: 4.2.11
      postcss: 8.4.31
      react: 18.2.0
      react-dom: 18.2.0(react@18.2.0)
      styled-jsx: 5.1.1(react@18.2.0)
    optionalDependencies:
      '@next/swc-darwin-arm64': 14.2.5
      '@next/swc-darwin-x64': 14.2.5
      '@next/swc-linux-arm64-gnu': 14.2.5
      '@next/swc-linux-arm64-musl': 14.2.5
      '@next/swc-linux-x64-gnu': 14.2.5
      '@next/swc-linux-x64-musl': 14.2.5
      '@next/swc-win32-arm64-msvc': 14.2.5
      '@next/swc-win32-ia32-msvc': 14.2.5
      '@next/swc-win32-x64-msvc': 14.2.5
    transitivePeerDependencies:
      - '@babel/core'
      - babel-plugin-macros

  object-assign@4.1.1: {}

  object-inspect@1.13.4: {}

  on-exit-leak-free@2.1.2: {}

  on-finished@2.4.1:
    dependencies:
      ee-first: 1.1.1

  parseurl@1.3.3: {}

  path-to-regexp@0.1.7: {}

  picocolors@1.1.1: {}

  pino-abstract-transport@1.2.0:
    dependencies:
      readable-stream: 4.7.0
      split2: 4.2.0

  pino-std-serializers@6.2.2: {}

  pino@9.0.0:
    dependencies:
      atomic-sleep: 1.0.0
      fast-redact: 3.5.0
      on-exit-leak-free: 2.1.2
      pino-abstract-transport: 1.2.0
      pino-std-serializers: 6.2.2
      process-warning: 3.0.0
      quick-format-unescaped: 4.0.4
      real-require: 0.2.0
      safe-stable-stringify: 2.5.0
      sonic-boom: 3.8.1
      thread-stream: 2.7.0

  postcss@8.4.31:
    dependencies:
      nanoid: 3.3.11
      picocolors: 1.1.1
      source-map-js: 1.2.1

  process-warning@3.0.0: {}

  process@0.11.10: {}

  protobufjs@7.5.4:
    dependencies:
      '@protobufjs/aspromise': 1.1.2
      '@protobufjs/base64': 1.1.2
      '@protobufjs/codegen': 2.0.4
      '@protobufjs/eventemitter': 1.1.0
      '@protobufjs/fetch': 1.1.0
      '@protobufjs/float': 1.0.2
      '@protobufjs/inquire': 1.1.0
      '@protobufjs/path': 1.1.2
      '@protobufjs/pool': 1.1.0
      '@protobufjs/utf8': 1.1.0
      '@types/node': 20.11.30
      long: 5.3.2

  proxy-addr@2.0.7:
    dependencies:
      forwarded: 0.2.0
      ipaddr.js: 1.9.1

  qs@6.11.0:
    dependencies:
      side-channel: 1.1.0

  quick-format-unescaped@4.0.4: {}

  range-parser@1.2.1: {}

  raw-body@2.5.2:
    dependencies:
      bytes: 3.1.2
      http-errors: 2.0.0
      iconv-lite: 0.4.24
      unpipe: 1.0.0

  react-dom@18.2.0(react@18.2.0):
    dependencies:
      loose-envify: 1.4.0
      react: 18.2.0
      scheduler: 0.23.2

  react@18.2.0:
    dependencies:
      loose-envify: 1.4.0

  readable-stream@4.7.0:
    dependencies:
      abort-controller: 3.0.0
      buffer: 6.0.3
      events: 3.3.0
      process: 0.11.10
      string_decoder: 1.3.0

  real-require@0.2.0: {}

  require-directory@2.1.1: {}

  resolve-pkg-maps@1.0.0: {}

  safe-buffer@5.2.1: {}

  safe-stable-stringify@2.5.0: {}

  safer-buffer@2.1.2: {}

  scheduler@0.23.2:
    dependencies:
      loose-envify: 1.4.0

  send@0.18.0:
    dependencies:
      debug: 2.6.9
      depd: 2.0.0
      destroy: 1.2.0
      encodeurl: 1.0.2
      escape-html: 1.0.3
      etag: 1.8.1
      fresh: 0.5.2
      http-errors: 2.0.0
      mime: 1.6.0
      ms: 2.1.3
      on-finished: 2.4.1
      range-parser: 1.2.1
      statuses: 2.0.1
    transitivePeerDependencies:
      - supports-color

  serve-static@1.15.0:
    dependencies:
      encodeurl: 1.0.2
      escape-html: 1.0.3
      parseurl: 1.3.3
      send: 0.18.0
    transitivePeerDependencies:
      - supports-color

  setprototypeof@1.2.0: {}

  side-channel-list@1.0.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4

  side-channel-map@1.0.1:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4

  side-channel-weakmap@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4
      side-channel-map: 1.0.1

  side-channel@1.1.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4
      side-channel-list: 1.0.0
      side-channel-map: 1.0.1
      side-channel-weakmap: 1.0.2

  sonic-boom@3.8.1:
    dependencies:
      atomic-sleep: 1.0.0

  source-map-js@1.2.1: {}

  split2@4.2.0: {}

  statuses@2.0.1: {}

  streamsearch@1.1.0: {}

  string-width@4.2.3:
    dependencies:
      emoji-regex: 8.0.0
      is-fullwidth-code-point: 3.0.0
      strip-ansi: 6.0.1

  string_decoder@1.3.0:
    dependencies:
      safe-buffer: 5.2.1

  strip-ansi@6.0.1:
    dependencies:
      ansi-regex: 5.0.1

  styled-jsx@5.1.1(react@18.2.0):
    dependencies:
      client-only: 0.0.1
      react: 18.2.0

  thread-stream@2.7.0:
    dependencies:
      real-require: 0.2.0

  toidentifier@1.0.1: {}

  tslib@2.8.1: {}

  tsx@4.16.2:
    dependencies:
      esbuild: 0.21.5
      get-tsconfig: 4.12.0
    optionalDependencies:
      fsevents: 2.3.3

  type-is@1.6.18:
    dependencies:
      media-typer: 0.3.0
      mime-types: 2.1.35

  typescript@5.5.4: {}

  undici-types@5.26.5: {}

  unpipe@1.0.0: {}

  utils-merge@1.0.1: {}

  vary@1.1.2: {}

  web-vitals@4.2.4: {}

  websocket-driver@0.7.4:
    dependencies:
      http-parser-js: 0.5.10
      safe-buffer: 5.2.1
      websocket-extensions: 0.1.4

  websocket-extensions@0.1.4: {}

  wrap-ansi@7.0.0:
    dependencies:
      ansi-styles: 4.3.0
      string-width: 4.2.3
      strip-ansi: 6.0.1

  y18n@5.0.8: {}

  yargs-parser@21.1.1: {}

  yargs@17.7.2:
    dependencies:
      cliui: 8.0.1
      escalade: 3.2.0
      get-caller-file: 2.0.5
      require-directory: 2.1.1
      string-width: 4.2.3
      y18n: 5.0.8
      yargs-parser: 21.1.1

  zod@3.23.8: {}

```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "scripts"

```

### scripts/new-doc.mjs

```mjs
#!/usr/bin/env node
import fs from "fs";
import path from "path";

const [,, kindArg, slugArg] = process.argv;
const kind = (kindArg || "").toLowerCase();
const slug = (slugArg || "").toLowerCase().replace(/[^a-z0-9-_]/g, "-") || "untitled";

const map = {
  bible: { dir: "docs/bibles", ext: ".bible.md", title: "Project Bible" },
  wt: { dir: "docs/wt", ext: ".wt.md", title: "Walkthrough" },
  guide: { dir: "docs/guides", ext: ".guide.md", title: "Guide/Cookbook" },
  research: { dir: "docs/research", ext: ".r.md", title: "Research Brief" },
  note: { dir: "notes", ext: ".note.md", title: "Note" },
  todo: { dir: "todos", ext: ".todo.md", title: "TODO List" },
  scratch: { dir: "notes", ext: ".scratch.md", title: "Scratch" },
  mermaid: { dir: "docs/diagrams", ext: ".mermaid.md", title: "Mermaid Diagram" }
};

if (!map[kind]) {
  console.error(`Unknown kind '${kind}'. Allowed: ${Object.keys(map).join(", ")}`);
  process.exit(2);
}

const info = map[kind];
const file = path.join(process.cwd(), info.dir, `${slug}${info.ext}`);
fs.mkdirSync(path.dirname(file), { recursive: true });

const stamp = new Date().toISOString();
const body = `# ${info.title}: ${slug}

**Created:** ${stamp}

## What
(brief)

## Why
(reason)

## Acceptance Criteria
- [ ]

## Success Criteria
- [ ]

## TODO
- [ ]
`;
fs.writeFileSync(file, body, { encoding: "utf8", flag: "wx" });
console.log(file);

```

### services/api/package.json

```json
{
  "name": "@services/api",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@packages/types": "workspace:*",
    "cors": "2.8.5",
    "express": "4.19.2",
    "pino": "9.0.0",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/cors": "2.8.17",
    "@types/express": "4.17.21",
    "@types/node": "20.11.30",
    "tsx": "4.16.2",
    "typescript": "5.5.4"
  }
}

```

### services/api/src/index.ts

```ts
import express from "express";
import cors from "cors";
import pino from "pino";
import { z } from "zod";
import { createShiftInput } from "@packages/types";

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "scheduler-api" }));
app.get("/status", (_req, res) => res.status(200).json({ ok: true, env: process.env.NODE_ENV || "dev", time: new Date().toISOString() }));
app.get("/__/probe", (req, res) => res.status(200).json({ ok: true, runId: req.header("x-run-id") || null, probedAt: new Date().toISOString() }));

// Minimal RBAC header stub (replace with Firebase auth in real impl)
const RoleHeader = z.enum(["admin","manager","staff"]);

app.post("/api/shifts", (req, res) => {
  const role = RoleHeader.safeParse(req.header("x-role"));
  if (!role.success || (role.data !== "admin" && role.data !== "manager")) {
    return res.status(403).json({ ok: false, error: "forbidden" });
  }
  const parsed = createShiftInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  // TODO: integrate Firestore Admin write + audit append here
  const id = `sh_${Date.now()}`;
  return res.status(201).json({ ok: true, id });
});

const PORT = Number(process.env.PORT || 3333);
app.listen(PORT, () => log.info({ port: PORT }, "scheduler-api listening"));

```

### services/api/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@packages/types": ["../../packages/types/dist/index.d.ts"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}

```

