#!/usr/bin/env bash
set -euo pipefail

# Prevent committing very large files or common SDK archives into the repository.
# Usage: install as .git/hooks/pre-commit or run from CI to fail fast.

MAX_BYTES=${MAX_BYTES:-5242880} # 5MB default

echo "[guard] Checking staged files for size > $MAX_BYTES bytes..."

# Find staged files
staged_files=$(git diff --cached --name-only --diff-filter=ACM)

blocked=0
for f in $staged_files; do
  # skip deletions
  if [ ! -f "$f" ]; then
    continue
  fi

  size=$(wc -c <"$f" | tr -d ' ')
  if [ "$size" -ge "$MAX_BYTES" ]; then
    echo "[guard] ERROR: Staged file '$f' is too large ($size bytes). Max allowed is $MAX_BYTES bytes."
    blocked=1
  fi

  # Block common SDK archives or folders
  case "$f" in
    *.tar.gz|*.tgz|*.zip|google-cloud-sdk*|*/node_modules/*)
      echo "[guard] ERROR: Staged file or path looks like an archive/SDK or node_modules: $f"
      blocked=1
      ;;
  esac
done

if [ "$blocked" -ne 0 ]; then
  echo "[guard] Commit blocked due to large files or forbidden patterns. Remove the files from staging or set MAX_BYTES to a higher value if intentional."
  exit 1
fi

echo "[guard] OK: staged files are within size limits."
exit 0
