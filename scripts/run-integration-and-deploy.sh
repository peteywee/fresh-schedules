#!/usr/bin/env bash
set -euo pipefail

# scripts/run-integration-and-deploy.sh
# One-shot automation to:
#  - create backup tags for remote branches (except main/develop)
#  - create an integration branch (integrate/all-features) from origin/develop
#  - merge all remote branches (except main/develop) into the integration branch
#  - push the integration branch to origin
#  - optionally create a PR and dispatch the 'upgrade-runner' workflow against it
#
# Usage:
#   ./scripts/run-integration-and-deploy.sh [--create-pr] [--run-workflow] [--base origin/develop]
#
# Notes:
# - Conflicting merges are aborted and recorded in merge-conflicts.txt
# - Backup tags are created for each remote branch as backup/<branch>/<TIMESTAMP>
# - This script is intentionally conservative: it will not delete any branches.
# - You should review the integration branch and the workflow run before deleting branches.

# Defaults
BASE_REF="${BASE_REF:-origin/develop}"
INTEGRATION_BRANCH="${INTEGRATION_BRANCH:-integrate/all-features}"
CREATE_PR=0
RUN_WORKFLOW=0
REPO="peteywee/fresh-schedules"
WORKFLOW_FILE="upgrade-runner.yml"
TS=$(date -u +"%Y%m%dT%H%M%SZ")

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --create-pr) CREATE_PR=1; shift ;;
    --run-workflow) RUN_WORKFLOW=1; shift ;;
    --base) BASE_REF="$2"; shift 2 ;;
    --integration-branch) INTEGRATION_BRANCH="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,200p' "$0" | sed -n '1,120p'
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 2 ;;
  esac
done

echo "Running integration automation"
echo "Base ref: $BASE_REF"
echo "Integration branch: $INTEGRATION_BRANCH"

# Ensure working tree is clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree not clean. Please commit or stash changes before running this script." >&2
  git status --porcelain
  exit 1
fi

# Fetch all remote refs
git fetch --all --prune

# Create backup tags for all remote branches (exclude keep list)
KEEP_REGEX='^(origin/(main|develop|HEAD))$'
MERGE_CONFLICTS_FILE="merge-conflicts.txt"
> "$MERGE_CONFLICTS_FILE"

echo "Creating backup tags for remote branches (excluding main/develop)"
for remote in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin); do
  if [[ "$remote" =~ $KEEP_REGEX ]]; then
    echo "Skipping backup for $remote"
    continue
  fi
  # normalize branch name (drop origin/)
  br_short=${remote#origin/}
  TAG_NAME="backup/${br_short}/${TS}"
  echo "Tagging $remote -> $TAG_NAME"
  # create annotated tag pointing at the remote branch commit
  git tag -a "$TAG_NAME" "origin/$br_short" -m "Backup of origin/$br_short at $TS" || true
done

# Push tags (so backups are remote)
echo "Pushing backup tags to origin..."
git push origin --tags || echo "Failed to push tags; you may push manually with 'git push origin --tags'"

# Create integration branch from base
echo "Creating integration branch $INTEGRATION_BRANCH from $BASE_REF"
git checkout -B "$INTEGRATION_BRANCH" "$BASE_REF"

# Build list of branches to merge (exclude main/develop/integration branch and workflow branch)
EXCLUDE='^(main|develop|HEAD|integrate/all-features|automation/upgrade-runner)$'
BRANCHES=()
while IFS= read -r ref; do
  br=${ref#origin/}
  if [[ $br =~ $EXCLUDE ]]; then
    continue
  fi
  BRANCHES+=("$br")
done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's@refs/remotes/@@')

if [ ${#BRANCHES[@]} -eq 0 ]; then
  echo "No branches found to merge. Exiting.";
  exit 0
fi

echo "Branches to merge:"
for b in "${BRANCHES[@]}"; do echo " - $b"; done

# Merge branches one-by-one
for br in "${BRANCHES[@]}"; do
  echo "\n=== Merging origin/$br into $INTEGRATION_BRANCH ==="
  if git merge --no-edit --no-ff "origin/$br" -m "Merge origin/$br into $INTEGRATION_BRANCH"; then
    echo "Merged origin/$br"
  else
    echo "Conflict merging origin/$br — aborting merge and recording for manual resolution"
    git merge --abort || true
    echo "$br" >> "$MERGE_CONFLICTS_FILE"
    continue
  fi
done

# Show merge conflict summary
if [ -s "$MERGE_CONFLICTS_FILE" ]; then
  echo "The following branches had merge conflicts and require manual resolution:" >&2
  cat "$MERGE_CONFLICTS_FILE" >&2
else
  echo "All branches merged successfully (no conflicts)."
fi

# Push integration branch up
echo "Pushing $INTEGRATION_BRANCH to origin..."
git push --set-upstream origin "$INTEGRATION_BRANCH"

# Optionally create PR and/or dispatch workflow
if [ "$CREATE_PR" -eq 1 ] || [ "$RUN_WORKFLOW" -eq 1 ]; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "gh CLI not found — install GitHub CLI to auto-create PR or dispatch workflow" >&2
  fi
fi

if [ "$CREATE_PR" -eq 1 ]; then
  echo "Creating PR from $INTEGRATION_BRANCH to develop via gh..."
  gh pr create --repo "$REPO" --base develop --head "$INTEGRATION_BRANCH" --title "Integrate all features into develop" --body "Automated integration PR created by scripts/run-integration-and-deploy.sh. Backup tags: backup/*/${TS}."
fi

if [ "$RUN_WORKFLOW" -eq 1 ]; then
  echo "Dispatching workflow $WORKFLOW_FILE against $INTEGRATION_BRANCH"
  gh workflow run "$WORKFLOW_FILE" --repo "$REPO" --ref "$INTEGRATION_BRANCH" || echo "Workflow dispatch failed; run it manually in the Actions UI."
fi

echo "Done. Inspect the integration branch and the merge-conflicts.txt file if there were conflicts."
