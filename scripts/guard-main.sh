#!/usr/bin/env bash
set -euo pipefail

# Forbidden globs (docs/notes/todos & endings)
FORBIDDEN=(
  "docs/**"
  "notes/**"
  "todos/**"
  "*.bible.md"
  "*.wt.md"
  "*.note.md"
  "*.todo.md"
  "*.scratch.md"
  "*.scratch.txt"
  "*.r.md"
  "*.mermaid.md"
  "*.drawio"
)

BRANCH="${1:-}"
if [[ -z "$BRANCH" ]]; then
  # Try to detect branch
  if git rev-parse --abbrev-ref HEAD &>/dev/null; then
    BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  else
    BRANCH=""
  fi
fi

# Only enforce on main
if [[ "$BRANCH" != "main" ]]; then
  echo "guard-main: branch '$BRANCH' (not main) — no checks enforced."
  exit 0
fi

echo "guard-main: enforcing content policy on branch 'main'"

# Get staged (or tracked for CI) files
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  FILES=$(git diff --name-only --cached)
else
  FILES=$(git ls-files)
fi

violations=()

match_glob() {
  local file="$1"
  for glob in "${FORBIDDEN[@]}"; do
    if [[ "$file" == $glob ]]; then
      echo "$file"
      return 0
    fi
  done
  return 1
}

while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  if m=$(match_glob "$f"); then
    violations+=("$m")
  fi
done <<< "$FILES"

if (( ${#violations[@]} )); then
  echo "ERROR: The following files are not allowed on 'main':"
  printf '  - %s\n' "${violations[@]}"
  echo
  echo "Move them to the 'notes' branch (docs/, notes/, todos/ or matching *.bible.md, *.wt.md, *.note.md, *.todo.md, *.scratch.*, *.r.md, *.mermaid.md, *.drawio)."
  exit 1
fi

echo "guard-main: OK — no forbidden files staged for 'main'."
