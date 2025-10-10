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
