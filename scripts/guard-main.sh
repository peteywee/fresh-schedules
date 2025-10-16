#!/usr/bin/env bash
set -euo pipefail

# Guard Main Content
# Usage: scripts/guard-main.sh [target-branch]
# Called by workflow: .github/workflows/guard-content.yml (ref: 5fe0f9cb61d7197838d84e542eb78ea7b849cf53)
TARGET_BRANCH="${1:-main}"

echo "Guard: checking changes vs origin/${TARGET_BRANCH}"

# Ensure we have the target branch ref available
git fetch --no-tags --prune origin "${TARGET_BRANCH}" || {
  echo "Warning: git fetch failed; attempting an unshallow fetch"
  git fetch --no-tags --prune --unshallow origin "${TARGET_BRANCH}" || true
}

# List changed files between PR HEAD and target branch
CHANGED_FILES=$(git diff --name-only "origin/${TARGET_BRANCH}...HEAD" || true)

if [[ -z "${CHANGED_FILES}" ]]; then
  echo "No changed files detected vs origin/${TARGET_BRANCH}."
  exit 0
fi

echo "Changed files:"
printf '%s\n' "${CHANGED_FILES}"

# --- Policy checks ---
# 1) Disallow any changes that add/modify files under docs/, notes/, or todos/ anywhere in path.
if printf '%s\n' "${CHANGED_FILES}" | grep -E '(^|/)(docs|notes|todos)(/|$)' >/dev/null; then
  echo "::error::Push/PR includes files under docs/, notes/, or todos/ — these are forbidden on main."
  printf '%s\n' "${CHANGED_FILES}" | grep -E '(^|/)(docs|notes|todos)(/|$)'
  exit 1
fi

# 2) Disallow any file with a .place.* suffix (e.g., secrets.place.json)
if printf '%s\n' "${CHANGED_FILES}" | grep -E '\.place\.[^/]+$' >/dev/null; then
  echo "::error::Files with suffix .place.* are forbidden on main (use env or secure storage)."
  printf '%s\n' "${CHANGED_FILES}" | grep -E '\.place\.[^/]+$'
  exit 1
fi

# All checks passed
echo "Guard: policy checks passed."
exit 0
