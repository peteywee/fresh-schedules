#!/usr/bin/env bash
set -euo pipefail

# upgrade-checkpoint.sh
# Helper to run staged upgrade commands and create git checkpoints so a long
# upgrade process can be resumed if the terminal or CI stops unexpectedly.
#
# Usage:
#   ./scripts/upgrade-checkpoint.sh <step-name>
# Example:
#   ./scripts/upgrade-checkpoint.sh pre-upgrade
#
# Behavior:
# - Runs a list of commands defined for the step (see STEPS associative array)
# - After each command, optionally creates a small git commit with a checkpoint
# - If a command fails, the script exits non-zero and the last committed
#   checkpoint preserves progress. Re-run the script to continue.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

commit_checkpoint() {
  local name="$1"
  git add -A
  # create a lightweight checkpoint commit
  git commit -m "chore(checkpoint): $name" || true
}

# Define steps and commands. Add or modify as-needed.
declare -A STEPS

STEPS[pre-upgrade]='pnpm -w install'
STEPS[upgrade-firebase]='pnpm up firebase@12.4.0 -w'
STEPS[install-after-firebase]='pnpm -w install'
STEPS[typecheck]='pnpm -r typecheck'
STEPS[build]='pnpm -r build'
STEPS[test]='pnpm -r test'
STEPS[upgrade-typescript]='pnpm up typescript@5.9.3 -w'
STEPS[upgrade-eslint]='pnpm up eslint@9.37.0 @typescript-eslint/eslint-plugin@8.46.0 @typescript-eslint/parser@8.46.0 eslint-config-prettier@10.1.8 -w'
STEPS[lint-fix]='npx eslint . --ext .ts,.tsx --fix || true'

if [ $# -lt 1 ]; then
  echo "Usage: $0 <step-name>"
  echo "Available steps: ${!STEPS[@]}"
  exit 2
fi

STEP="$1"
COMMANDS_STRING="${STEPS[$STEP]:-}"
if [ -z "$COMMANDS_STRING" ]; then
  echo "Unknown step: $STEP"
  echo "Available steps: ${!STEPS[@]}"
  exit 2
fi

# Split commands by '&&' or newlines. We treat semi-colon/separate commands as sequential lines.
IFS=$'\n' read -rd '' -a COMMANDS <<<"$COMMANDS_STRING" || true

for cmd in "${COMMANDS[@]}"; do
  echo "Running: $cmd"
  eval "$cmd"
  # commit a checkpoint with the step and the short command
  short_cmd=$(echo "$cmd" | cut -c1-80)
  commit_checkpoint "$STEP: $short_cmd"
done

echo "Step '$STEP' completed. A checkpoint commit has been created."
