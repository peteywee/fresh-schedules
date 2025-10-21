#!/usr/bin/env bash
# Start Firestore emulator and other emulators if needed
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npx firebase emulators:start --only firestore
