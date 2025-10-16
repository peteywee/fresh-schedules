#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/guard-main.sh [target-branch]
# Example in workflow: bash scripts/guard-main.sh main
TARGET_BRANCH="${1:-main}"

echo "Guard: comparing HEAD to origin/${TARGET_BRANCH}"

# Ensure origin and target are available
git fetch --no-tags --prune origin "${TARGET_BRANCH}"

# Determine changed files between current HEAD and the target branch
CHANGED_FILES=$(git diff --name-only "origin/${TARGET_BRANCH}...HEAD" || true)

if [[ -z "${CHANGED_FILES}" ]]; then
  echo "No changes detected vs origin/${TARGET_BRANCH}. Nothing to guard."
  # Fail to surface the situation in CI (adjust if you prefer success)
  echo "::error::No changes found vs origin/${TARGET_BRANCH} - failing guard to force review."
  exit 1
fi

echo "Files changed (count: $(wc -w <<<"${CHANGED_FILES}") ):"
echo "${CHANGED_FILES}"

# --- Project-specific checks go here ---
# Examples (uncomment/adjust to fit policy):
# 1) Prevent changes that modify protected files:
# if echo "${CHANGED_FILES}" | grep -E '^package-lock.json|^yarn.lock' >/dev/null; then
#   echo "::error::Lockfile changes are not allowed in this workflow."
#   exit 1
# fi
#
# 2) Require at least one change in app/ or features/:
# if ! echo "${CHANGED_FILES}" | grep -E '^(app|features|packages)/' >/dev/null; then
#   echo "::error::PR must modify source in app/ or features/."
#   exit 1
# fi
#
# 3) Run lightweight checks (lint/test) - only if dependencies are installed:
# if command -v pnpm >/dev/null; then
#   pnpm -w -s lint || { echo "::error::Lint failed"; exit 1; }
# fi

echo "Guard checks placeholder passed. Implement needed checks in this script."
exit 0
