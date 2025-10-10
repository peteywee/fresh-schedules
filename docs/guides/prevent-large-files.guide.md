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
