#!/usr/bin/env bash
# Seed the emulator with deterministic data
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
pnpm seed
