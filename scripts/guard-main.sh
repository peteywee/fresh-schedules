#!/usr/bin/env bash
set -euo pipefail

# Allow CI or manual override
if [ "${SKIP_GUARD:-}" = "1" ]; then
  exit 0
fi

# Determine current branch safely (works in hooks)
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

# Visible noop change for PRability: updated_at: 2025-10-09T00:00:00Z

if [ "${branch:-}" = "main" ] || [ "${branch:-}" = "master" ]; then
  echo "ERROR: Direct commits to '$branch' are blocked by scripts/guard-main.sh."
  echo "Create a branch and open a PR instead."
  exit 1
fi

exit 0
