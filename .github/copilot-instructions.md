# Copilot Instructions — Fresh Schedules

## Branch Policy (STRICT)
- Only two branches exist: **develop** and **main**.
- **develop**: code + docs/notes/todos/`*.place.*` are allowed.
- **main**: production-only; docs/notes/todos and any `*.place.*` are forbidden.

## Stack & Rules
- Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS
- Express API (Node 20), Zod validation
- Firebase: Auth, Firestore, Messaging; Auth providers: Email Link + Google
- No secrets in repo. Any hardcoded value -> replace with env or `__PLACEHOLDER__` and suffix file with `.place.`

## Output Requirements
1) Provide complete files with correct paths/imports
2) Include What/Why, Acceptance Criteria, Success Criteria
3) Build must pass: `pnpm -r build`
4) Docs/notes/todos only on develop; never on main
