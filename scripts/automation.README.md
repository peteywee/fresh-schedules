# Integration & Deploy Automation

This README explains the purpose and use of `scripts/run-integration-and-deploy.sh`.

What it does

- Creates backup tags for all remote branches (excluding `main` and `develop`).
- Creates/updates an integration branch (default `integrate/all-features`) from `origin/develop`.
- Attempts to merge every remote branch (except a short exclude list) into the integration branch.
- Records conflicting branches in `merge-conflicts.txt` and aborts those merges.
- Pushes the integration branch to `origin` and optionally creates a PR and dispatches the `upgrade-runner.yml` workflow.

Safety and assumptions

- The script is conservative: it never force-deletes branches.
- It creates annotated backup tags `backup/<branch>/<TIMESTAMP>` for every remote branch it processes.
- You must have pushed your local changes and have a clean working tree before running the script.
- The `gh` CLI is required to auto-create PRs and dispatch workflows. Without `gh` the script will still create the integration branch and push it; you must create the PR and dispatch the workflow manually.

Quick start

1. Ensure you have a clean working tree and have fetched latest refs:

```bash
git fetch --all --prune
```

2. Run the script (dry-run by inspecting it first):

```bash
./scripts/run-integration-and-deploy.sh --create-pr --run-workflow
```

3. If there are merge conflicts, open `merge-conflicts.txt`, resolve them by checking out the integration branch locally and merging each conflicting branch manually.

Manual steps if gh not installed

- Create a PR in the GitHub UI from `integrate/all-features` -> `develop`.
- In the Actions tab, manually dispatch `upgrade-runner.yml` against `integrate/all-features`.

Notes

- The script is intended to be a convenience tool for consolidating feature branches into one integration branch.
- Review tags created under `backup/*` before deleting any branches.
