# TODO: Fix Settings Conflict and Deprecated Dependencies

## Steps to Complete

- [x] Merge settings.json into one valid JSON object, resolving duplicates and combining arrays/objects.
  - Acceptance: settings.json is valid JSON without syntax errors.
  - Success: File loads in VSCode without conflicts.
  - Constraints: Preserve all unique settings; for duplicates, keep the latest or merge logically (e.g., combine serverSampling objects).

- [x] Check git status in fresh-root/apps/web and stash changes if any.
  - Acceptance: No uncommitted changes that could interfere with migration.
  - Success: Git status shows clean or changes stashed.
  - Constraints: Use git stash if needed; avoid force operations.

- [x] Run ESLint migration codemod: npx @next/codemod@canary next-lint-to-eslint-cli in fresh-root/apps/web.
  - Acceptance: Migration completes without errors.
  - Success: ESLint config updated to use CLI instead of next lint.
  - Constraints: Ensure Node.js and npm are available; handle any prompts automatically.

- [x] Fix ESLint warnings in schedule-wizard.tsx: Remove unused props or prefix with _, replace 'any' with proper types.
  - Acceptance: No unused vars or explicit any warnings in the file.
  - Success: pnpm lint passes for this file.
  - Constraints: Maintain component functionality; use TypeScript best practices for types.

- [x] Fix ESLint warnings in messaging.place.ts: Remove unused imports.
  - Acceptance: No unused imports warnings in the file.
  - Success: pnpm lint passes for this file.
  - Constraints: Ensure removed imports are not needed elsewhere; check for side effects.

- [x] Run pnpm lint to verify all fixes.
  - Acceptance: No ESLint warnings or errors.
  - Success: Command exits with code 0.
  - Constraints: Run in fresh-root/apps/web directory.

- [ ] Test the app if needed (optional: run dev server and check for runtime errors).
  - Acceptance: App starts without errors.
  - Success: No console errors in browser.
  - Constraints: Use browser_action if visual verification is required.

## Overall Acceptance Criteria
- settings.json is valid and conflict-free.
- ESLint migration is complete and deprecated deps are fixed.
- All ESLint warnings are resolved.
- No breaking changes to existing functionality.

## Success Criteria
- pnpm lint passes without warnings.
- VSCode settings load without errors.
- Git status is clean or changes are properly managed.

## Constraints
- Operate within /home/patrick/fresh-schedules CWD.
- Do not overwrite files without confirmation (but plan is approved).
- Follow best practices for code edits.
- If any step fails, stop and ask for guidance.
