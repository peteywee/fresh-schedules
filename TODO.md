# TODO: Clean Up Develop Branch, Organize Files into Folders, Replace Placeholders, Run Tests, Ensure CI Green

## Acceptance Criteria
- Files organized into appropriate folders for ease of maintenance (e.g., config files in `config/`, Firebase files in `firebase/`, tools in `tools/`).
- All placeholder files replaced with proper implementations using environment variables.
- Files renamed from `.place.` to standard extensions.
- No hardcoded secrets or configuration values remain.
- Project builds successfully with `pnpm -r build`.
- E2E tests pass.
- No errors, warnings, or outdated dependencies.
- CI pipeline passes on `develop` branch.
- Documentation updated to reflect changes.

## Detailed Todo List
- [ ] Get Firebase project info using Firebase CLI (e.g., `firebase projects:list`, `firebase use`) to determine required env vars for both client SDK and Admin SDK.
- [ ] Create `config/` folder and move `.editorconfig`, `.gitignore`, `.nvmrc`, `.pr_agent.toml` into it.
- [ ] Create `tools/` folder and move `build_copilot_context.mjs` into it.
- [ ] Move `.firebaserc`, `firestore.rules`, `firestore.indexes.json` to `firebase/` folder.
- [ ] Update any references to moved files in scripts or docs.
- [ ] Add `firebase-admin` dependency to `services/api/package.json`.
- [ ] Implement `services/api/src/firebase.ts` with Firebase Admin SDK initialization using environment variables (e.g., `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL`).
- [ ] Rename `services/api/src/firebase.place.ts` to `services/api/src/firebase.ts`.
- [ ] Add `NEXT_PUBLIC_FIREBASE_VAPID_KEY` to `apps/web/src/lib/env.ts` schema and config.
- [ ] Implement `apps/web/src/lib/messaging.ts` with VAPID key configuration from environment variables.
- [ ] Rename `apps/web/src/lib/messaging.place.ts` to `apps/web/src/lib/messaging.ts`.
- [ ] Update `docs/guides/copilot-project-pack.guide.md` to remove the "9. TODO: Replace Placeholders" section.
- [ ] Run `pnpm install` to install new dependencies.
- [ ] Run `pnpm -r build` to verify the project builds successfully.
- [ ] Run E2E tests with `pnpm -r test:e2e`.
- [ ] Check for outdated dependencies with `pnpm outdated` and update if necessary.
- [ ] Run placeholder scanner script if available (`.zip/scan_and_tag_placeholders.sh`).
- [ ] Ensure no `.place.` files exist in the repository.
- [ ] Verify CI workflows pass locally or trigger CI.
