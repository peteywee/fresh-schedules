#!/usr/bin/env bash
set -euo pipefail

# run_build_copilot_context.sh
# Wrapper to generate CopilotFullContext.place.md from a repo checkout.
# Usage:
#   bash run_build_copilot_context.sh /path/to/repo

ROOT="${1:-.}"
OUT="${2:-CopilotFullContext.place.md}"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="${NODE_BIN:-node}"

if ! command -v "$NODE" >/dev/null 2>&1; then
  echo "Node is required. Install Node.js 18+ and retry." >&2
  exit 127
fi

"$NODE" "$DIR/build_copilot_context.mjs" "$ROOT" "$OUT"
echo "✅ Generated $OUT"
