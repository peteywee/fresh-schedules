dont care as much # Cleanup Main Branch and Add E2E Testing

## Approved Plan Breakdown

### 1. Add E2E Testing Setup
- [x] Create apps/web/playwright.config.ts for Playwright configuration
- [x] Create apps/web/tests/e2e/signin.spec.ts for basic /signin test
- [x] Update apps/web/package.json to add e2e scripts if needed
- [x] Install Playwright browsers

### 2. Cleanup Non-Essential Files from Main
- [ ] Delete addon/ directory
- [ ] Delete docs/ directory
- [ ] Delete scripts/ directory
- [ ] Delete build_copilot_context.mjs
- [ ] Delete run_build_copilot_context.sh
- [ ] Delete CONTEXT_README.place.md
- [ ] Delete CopilotFullContext.place.md
- [ ] Delete MASTER_PROMPT_choose_workspace.md
- [ ] Delete TODO.md (this file, after completion)
- [ ] Delete .markdownlintignore

### 3. Update Documentation
- [ ] Update README.md to add e2e testing instructions

### 4. Create PR
- [ ] Create branch blackboxai/cleanup-main
- [ ] Commit all changes
- [ ] Push branch
- [ ] Open PR

### 5. Followup and Testing
- [ ] Run e2e tests to verify
- [ ] Test that app still runs after cleanup
- [ ] Confirm PR is created and CI passes
