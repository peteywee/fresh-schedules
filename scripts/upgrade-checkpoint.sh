#!/usr/bin/env bash
set -euo pipefail

# upgrade-checkpoint.sh
# Helper to run staged upgrade commands and create git checkpoints so a long
# upgrade process can be resumed if the terminal or CI stops unexpectedly.
# By default this script will create annotated tags as checkpoints (faster and
# fewer commits). To use commit-style checkpoints set GIT_CHECKPOINT_POLICY=commit
#
# Usage:
#   ./scripts/upgrade-checkpoint.sh <step-name>
# Example:
#   ./scripts/upgrade-checkpoint.sh pre-upgrade
#
# Behavior:
# - Runs a list of commands defined for the step (see STEPS associative array)
# - After each command, creates a checkpoint tag (or commit if configured)
# - If a command fails, the script exits non-zero; you can re-run the step to
#   continue or inspect the last tag (checkpoint) to restore state.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

GIT_POLICY="${GIT_CHECKPOINT_POLICY:-tag}" # tag | commit

create_checkpoint() {
  local name="$1"
  local short_cmd="$2"
  local ts
  ts=$(date -u +"%Y%m%dT%H%M%SZ")
  local tag_name="checkpoint/$ts/$name"

  if [ "$GIT_POLICY" = "commit" ]; then
    git add -A
    git commit -m "chore(checkpoint): $name - $short_cmd" || true
    echo "Created checkpoint commit for: $name"
  else
    # create annotated tag with the staged changes recorded in the tag message
    git add -A || true
    git commit -m "chore(checkpoint-temp): $name - $short_cmd" || true
    git tag -a "$tag_name" -m "checkpoint: $name\ncmd: $short_cmd\nts: $ts" || true
    echo "Created checkpoint tag: $tag_name"
  fi
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

# Split commands by newlines
IFS=$'\n' read -rd '' -a COMMANDS <<<"$COMMANDS_STRING" || true

for cmd in "${COMMANDS[@]}"; do
  echo "Running: $cmd"
  if ! eval "$cmd"; then
    echo "Command failed: $cmd" >&2
    ./scripts/critical-failure.sh 120 "upgrade-checkpoint failed on: $cmd"
    exit 1
  fi
  # commit or tag a checkpoint with the step and the short command
  short_cmd=$(echo "$cmd" | cut -c1-80)
  create_checkpoint "$STEP" "$short_cmd"
done

echo "Step '$STEP' completed. Checkpoint created (policy: $GIT_POLICY)."
