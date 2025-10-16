#!/usr/bin/env bash
# Path: scripts/guard-main.sh
set -euo pipefail

# Guard Main Content
# Usage: scripts/guard-main.sh [target-branch]
# Called from .github/workflows/guard-content.yml (ref: 5fe0f9cb61d7197838d84e542eb78ea7b849cf53)
TARGET_BRANCH="${1:-main}"
echo "Guard: checking changes vs origin/${TARGET_BRANCH}"

# Ensure we have the target branch ref available (handle shallow checkouts)
git fetch --no-tags --prune origin "${TARGET_BRANCH}" >/dev/null 2>&1 || {
  echo "Warning: initial git fetch failed; attempting full fetch"
  git fetch --no-tags --prune --unshallow origin "${TARGET_BRANCH}" >/dev/null 2>&1 || true
}

# Compute changed files between PR HEAD and target branch
CHANGED_FILES="$(git diff --name-only "origin/${TARGET_BRANCH}...HEAD" || true)"

if [[ -z "${CHANGED_FILES//[$'\t\r\n ']}" ]]; then
  echo "No changed files detected vs origin/${TARGET_BRANCH}."
  # Nothing to guard: allow job to succeed (adjust if policy prefers failing)
  exit 0
fi

echo "Changed files:"
printf '%s\n' "${CHANGED_FILES}"

# Policy checks — fail fast and list offending files with GitHub annotations.

# 1) Disallow files under docs/, notes/, todos/ anywhere in path
if printf '%s\n' "${CHANGED_FILES}" | grep -E '(^|/)(docs|notes|todos)(/|$)' >/dev/null; then
  echo "::error::PR contains files under docs/, notes/, or todos/ — forbidden on main."
  printf '%s\n' "${CHANGED_FILES}" | grep -E '(^|/)(docs|notes|todos)(/|$)' || true
  exit 1
fi

# 2) Disallow any filename containing ".place." (e.g., secrets.place.json)
if printf '%s\n' "${CHANGED_FILES}" | grep -E '\.place\.[^/]+$' >/dev/null; then
  echo "::error::PR contains files matching '*.place.*' — forbidden on main. Use env or secure storage."
  printf '%s\n' "${CHANGED_FILES}" | grep -E '\.place\.[^/]+$' || true
  exit 1
fi

# All checks passed
echo "Guard: policy checks passed."
exit 0
