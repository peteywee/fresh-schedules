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
