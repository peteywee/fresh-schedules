# TODO: Address Documentation Issues and Fix All Problems

## Acceptance Criteria
- All placeholder files (e.g., `firebase.place.ts`, `messaging.place.ts`) are replaced with proper implementations using environment variables.
- Files are renamed from `.place.` to standard extensions.
- No hardcoded secrets or configuration values remain in the repository.
- Documentation is updated to reflect the changes, removing all TODOs and placeholders.
- The project builds successfully with `pnpm -r build`.
- Placeholder scanner passes without detecting any issues.

## Success Metrics
- CI pipeline passes on `develop` branch.
- No `.place.` files exist in the repository.
- All Firebase integrations (Admin SDK, Messaging) function correctly in development and production environments.
- Documentation accurately describes the current state of the codebase.

## Detailed Todo List
1. Replace the placeholder in `services/api/src/firebase.place.ts` with actual Firebase Admin SDK initialization using environment variables (e.g., `FIREBASE_ADMIN_*`).
2. Rename `services/api/src/firebase.place.ts` to `services/api/src/firebase.ts`.
3. Replace the placeholder in `apps/web/src/lib/messaging.place.ts` with VAPID key configuration from environment variables.
4. Rename `apps/web/src/lib/messaging.place.ts` to `apps/web/src/lib/messaging.ts`.
5. Update `docs/guides/copilot-project-pack.guide.md` to remove the TODO items for placeholders and update the "9) TODO: Replace placeholders" section.
6. Run the placeholder scanner script to ensure no new placeholders are detected.
7. Execute `pnpm -r build` to verify the project builds successfully.
8. Update any related documentation if necessary (e.g., add env variable examples).
9. Delete stale branches: Keep only main, develop, firebase-studio, and feature/version-bumps.
10. Fix issues in numbered topic branches (peteywee/issue15, issue23, issue25, issue26) and delete them when finished.
