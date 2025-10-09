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