#!/usr/bin/env bash
set -euo pipefail

# scripts/critical-failure.sh
# Log and create a lightweight checkpoint when a critical failure occurs.
# Intended to be called from long-running scripts (e.g. upgrade-checkpoint.sh)
# Usage: scripts/critical-failure.sh <error-code> "human readable message"
#
# Error codes (suggested):
# 100 - CHECKPOINT_MISSING
# 101 - SCRIPT_ABORTED
# 102 - COMMAND_FAILED
# 110 - PNPM_INSTALL_FAILED
# 120 - UPGRADE_COMMAND_FAILED
# 200 - TYPECHECK_FAILED
# 201 - BUILD_FAILED
# 202 - TESTS_FAILED
# 255 - UNKNOWN_FATAL

CODE=${1:-255}
MSG=${2:-"unknown error"}
TS=$(date -u +"%Y%m%dT%H%M%SZ")
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOGFILE="$ROOT_DIR/scripts/critical-failures.log"

# Gather git info if available
GIT_COMMIT=""
GIT_BRANCH=""
if command -v git >/dev/null 2>&1; then
  GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || true)
  GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
fi

ENTRY="{\"ts\":\"$TS\",\"code\":$CODE,\"msg\":\"$(echo "$MSG" | sed -e 's/"/\\"/g')\",\"branch\":\"$GIT_BRANCH\",\"commit\":\"$GIT_COMMIT\"}"

# Ensure log dir exists
mkdir -p "$(dirname "$LOGFILE")"

# Append to log
echo "$ENTRY" >> "$LOGFILE"

echo "CRITICAL: $CODE - $MSG" >&2
echo "Logged failure to $LOGFILE" >&2

# Try to create a lightweight git checkpoint and tag (if git is available)
if [ -z "${SKIP_GIT:-}" ] && command -v git >/dev/null 2>&1; then
  # stage the log file
  git add -- "$LOGFILE" || true
  git commit -m "chore(checkpoint): critical-failure $CODE - $(echo "$MSG" | cut -c1-80)" || true
  TAG_NAME="critical-failure/$TS"
  git tag -a "$TAG_NAME" -m "Critical failure $CODE: $(echo "$MSG" | cut -c1-80)" || true
  echo "Created git checkpoint and tag: $TAG_NAME" >&2
else
  echo "Git not available or SKIP_GIT set — skipping git checkpoint." >&2
fi

# Exit with the provided code
exit $CODE
