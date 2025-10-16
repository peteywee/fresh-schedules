#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/seed-dev.sh
# Starts the firestore emulator (if not already running) and seeds sample data using the API seed script.

# Check for firebase
if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase CLI not found. Install with: npm i -g firebase-tools"
  exit 1
fi

echo "Starting Firestore emulator..."
# This will run in foreground; user can ctrl+c if they want.
# Recommend running in a separate terminal or backgrounding the process.
firebase emulators:start --only firestore --project local-project &
EMULATOR_PID=$!
sleep 2

export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_ADMIN_PROJECT_ID=local-project

echo "Seeding data via services/api..."
(cd services/api && pnpm run seed)

# Stop emulator if we started it
if ps -p $EMULATOR_PID >/dev/null 2>&1; then
  echo "Stopping emulator (pid=$EMULATOR_PID)"
  kill $EMULATOR_PID || true
fi

echo "Done."
