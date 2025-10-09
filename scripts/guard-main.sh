#!/usr/bin/env bash
set -euo pipefail
BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')}"

# Enforce NO docs/notes/todos or *.place.* on main only.
if [[ "$BRANCH" != "main" ]]; then
  echo "guard: branch '$BRANCH' — no enforcement (docs allowed on develop)."
  exit 0
fi

echo "guard: enforcing no-docs policy on 'main'"

FORBIDDEN=(
  "docs/**"
  "todos/**"
  "notes/**"
  "*.bible.md"
  "*.wt.md"
  "*.guide.md"
  "*.r.md"
  "*.note.md"
  "*.todo.md"
  "*.scratch.md"
  "*.scratch.txt"
  "*.mermaid.md"
  "*.drawio"
  "*.place.*"
)

ALLOW=("README.md" "CHANGELOG.md")

is_allowed() { local f="$1"; for a in "${ALLOW[@]}"; do [[ "$f" == $a ]] && return 0; done; return 1; }

FILES="$(git diff --name-only --cached || true)"
violations=()
for f in $FILES; do
  [[ -e "$f" ]] || continue
  is_allowed "$f" && continue
  for glob in "${FORBIDDEN[@]}"; do
    [[ "$f" == $glob ]] && { violations+=("$f"); break; }
  done
done

if (( ${#violations[@]} )); then
  echo "ERROR: These files are forbidden on 'main':"
  printf '  - %s\n' "${violations[@]}"
  cat <<MSG

Docs/notes/todos and *.place.* are allowed on 'develop' only.
Move these off your 'main' commit or open a PR to 'develop' instead.
MSG
  exit 1
fi

echo "guard: OK — main is clean."
