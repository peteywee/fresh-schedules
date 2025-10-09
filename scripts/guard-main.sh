#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')}"

# notes branch is free; everything else enforced
if [[ "$BRANCH" == "notes" || "$BRANCH" == "" ]]; then
  echo "guard: branch '$BRANCH' — no enforcement."
  exit 0
fi

echo "guard: enforcing doc/notes/todo policy on branch '$BRANCH'"

FORBIDDEN=(
  "docs/**"
  "notes/**"
  "todos/**"
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
)

ALLOW=("README.md" "CHANGELOG.md")

is_allowed() {
  local f="$1"
  for a in "${ALLOW[@]}"; do
    [[ "$f" == $a ]] && return 0
  done
  return 1
}

FILES="$(git diff --name-only --cached || true)"
violations=()

for f in $FILES; do
  [[ -e "$f" ]] || continue
  if is_allowed "$f"; then continue; fi
  for glob in "${FORBIDDEN[@]}"; do
    if [[ "$f" == $glob ]]; then
      violations+=("$f")
      break
    fi
  done
done

if (( ${#violations[@]} )); then
  echo "ERROR: These files are not allowed on '$BRANCH':"
  printf '  - %s\n' "${violations[@]}"
  cat <<MSG

Move them to:
  docs/bibles/*.bible.md
  docs/wt/*.wt.md
  docs/guides/*.guide.md
  docs/research/*.r.md
  docs/diagrams/*.(drawio|mermaid.md)
  notes/*.note.md or *.scratch.*
  todos/*.todo.md

Or commit them on the 'notes' branch.
MSG
  exit 1
fi

echo "guard: OK — no forbidden files staged."
