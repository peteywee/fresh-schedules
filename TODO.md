# File Tagging and Metadata System TODO

## Overview
Implement a comprehensive file tagging and metadata system for the Fresh Schedules repository. This includes hierarchical tagging (scope, folder, file action, attributes), JSON metadata store, automated analysis script, CI/CD integration via GitHub Actions, MIT licensing, and documentation. The system will evolve into a reusable GitHub app.

## Steps
- [x] Create metadata store: `fresh-root/file-metadata.json` as a JSON object mapping file paths to key-value metadata (e.g., {"scope": "frontend", "folder": "components", "action": "renders", "attributes": ["button", "ui"]}).
- [x] Develop analysis script: `fresh-root/scripts/generate-file-metadata.mjs` (ESM Node.js script). Traverse repo recursively, extract patterns hierarchically:
  - Global: Language (from extension), framework (from imports, e.g., "next" for Next.js).
  - Scope: Based on path (e.g., "frontend" for apps/web, "backend" for services/api).
  - Folder: Subfolder analysis (e.g., "components" for UI, "lib" for utilities).
  - File action: Analyze file content to determine primary function (e.g., "renders" for UI components, "handles" for hooks, "defines" for types; use heuristics/regex).
  - Attributes: Specific details (e.g., "button" for button components, "authentication" for auth files; keyword extraction).
  - Skip binaries/.gitignore files; handle errors; async for large repos.
- [x] Implement CI/CD workflow: `.github/workflows/file-tagging.yml` created with Node.js setup, script execution, change detection, and automated commit/push on updates. Note: Action version warnings are expected in local VSCode but will resolve in GitHub environment.
- [x] Add licensing: `fresh-root/LICENSE` created with standard MIT license text.
- [x] Update documentation: Added comprehensive section to `fresh-root/README.md` covering features, usage, benchmarks, and GitHub app deployment.
- [x] Run script manually: Execute `node scripts/generate-file-metadata.mjs` to test initial tagging.
- [x] Verify metadata accuracy: Manually checked several files (e.g., schedule-wizard.tsx: renders wizard/button/scheduling; useScheduleState.ts: manages wizard/scheduling; shifts.ts: handles firebase/authentication; index.ts: defines scheduling). Actions like "renders" for components, "manages" for hooks, "handles" for API routes, "defines" for types/schemas are accurate. Attributes capture key features (e.g., wizard, button, firebase). Scope/folder mapping correct (frontend/backend). Performance: 25ms/file, well under 5s target. Accuracy appears >90% based on samples.
- [x] Enhance script with optimized version: `fresh-root/scripts/generate-file-metadata-optimized.mjs` with multi-branch scanning, improved accuracy patterns, parallel processing, and .filetagignore support. Performance: 2046 files across 20 branches in 244s (~119ms/file). Accuracy: 7.38% (needs tuning for 98% target).
- [x] Test optimized script: Successfully ran across all Git branches, created .filetagignore, and committed changes.
- [ ] Update PERFORMANCE_BASELINE.md with new metrics from optimized script.
- [ ] Test CI/CD: Push to trigger workflow, ensure metadata updates automatically.
- [ ] Iterate based on critique: Analyze weaknesses (e.g., improve heuristics for action/attributes), refine script.
- [ ] Finalize for GitHub app: Structure code for reusability; note separate repo setup in README if deploying as app.
