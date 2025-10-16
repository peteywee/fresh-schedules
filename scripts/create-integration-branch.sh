#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"

BASE_REF="${1:-origin/develop}"   # change to origin/main if you prefer
INTEGRATION_BRANCH="${2:-integrate/all-features}"
EXCLUDE_REGEX="origin/(main|develop|HEAD|automation/upgrade-runner|feature/mcp-server-tests)"

echo "Base ref: $BASE_REF"
echo "Integration branch: $INTEGRATION_BRANCH"

# ensure we have latest
git fetch --all --prune

# create integration branch from base
git checkout -B "$INTEGRATION_BRANCH" "$BASE_REF"

# clean previous conflict list
> "$ROOT/merge-conflicts.txt"

# iterate remote branches
for remote in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin); do
  # skip excluded refs
  if [[ "$remote" =~ $EXCLUDE_REGEX ]]; then
    echo "Skipping $remote"
    continue
  fi

  # strip origin/
  br="${remote#origin/}"
  echo "=== Attempting merge of $br ==="

  # Attempt merge with merge commit; if fails, record and abort merge
  if git merge --no-edit --no-ff "origin/$br" -m "Merge origin/$br into $INTEGRATION_BRANCH"; then
    echo "Merged origin/$br"
  else
    echo "Conflict merging $br — aborting and logging"
    git merge --abort || true
    echo "$br" >> "$ROOT/merge-conflicts.txt"
  fi
done

echo "Done. Conflicts (if any) are listed in merge-conflicts.txt"
echo "Integration branch: $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)"
