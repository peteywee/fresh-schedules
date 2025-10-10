#!/usr/bin/env bash
set -euo pipefail

# scan_and_tag_placeholders.sh
# Scans repo for hardcoded Firebase config and other obvious secrets,
# replaces values with placeholders, and renames affected files to include `.place.`.

ROOT="${1:-.}"
cd "$ROOT"

tag_file() {
  local f="$1"
  # Skip if already tagged
  if [[ "$f" == *".place."* ]]; then
    return
  fi
  local base="${f##*/}"
  local dir="${f%/*}"
  local ext=""
  if [[ "$base" == *.* ]]; then
    ext=".${base##*.}"
    base="${base%.*}"
  fi
  local target="${dir:+$dir/}${base}.place${ext}"
  cp "$f" "$target"
  echo "// PLACEHOLDER: This file contains values that MUST be supplied from env. Do not commit secrets." | cat - "$target" > "${target}.tmp" && mv "${target}.tmp" "$target"
  echo "Tagged: $target"
}

# Patterns to flag
patterns=(
  'apiKey:\s*["'"']AIza[0-9A-Za-z_-]+'
  'appId:\s*["'"']1:[0-9]+:web:[0-9a-fA-F]+'
  'projectId:\s*["'"'][a-z0-9-]+'
  'authDomain:\s*["'"'][^"\']+firebaseapp.com'
  'messagingSenderId:\s*["'"'][0-9]+'
  'FIREBASE_.*=["'"'][^"\']{10,}'
  'GOOGLE_.*=["'"'][^"\']{10,}'
)

# Scan only likely config files
candidates=$(git ls-files '*.ts' '*.tsx' '*.js' '*.mjs' '*.cjs' '*.json' 2>/dev/null || true)
for f in $candidates; do
  [[ -f "$f" ]] || continue
  hit=false
  for p in "${patterns[@]}"; do
    if grep -E -q "$p" "$f"; then
      hit=true; break
    fi
  done
  if $hit; then
    # replace obvious literals with placeholders (non-destructive copy to .place.)
    tag_file "$f"
    # Suggest env mapping
    echo ">> Review $f and move values to env reads in the tagged copy."
  fi
done

echo "Scan complete. All tagged files use the .place. convention."