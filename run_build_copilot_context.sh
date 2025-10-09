#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-.}"
OUT="${2:-CopilotFullContext.place.md}"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required (v18+). Install and retry." >&2
  exit 127
fi
node "$(dirname "$0")/build_copilot_context.mjs" "$ROOT" "$OUT"
echo "✅ Generated $OUT"
