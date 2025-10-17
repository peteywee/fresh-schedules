# Firestore Emulator and Local Seeding

This document explains how to run the Firestore emulator locally and seed demo data for development.

## Prerequisites

- Node.js and pnpm installed
- Firebase CLI: `npm i -g firebase-tools`

## Run Firestore Emulator

```bash
# from repo root
# start the emulator (interactive)
firebase emulators:start --only firestore

# run the emulator in the background (append '&' to run as a background process)
firebase emulators:start --only firestore --project local-project &
```

## Configure Environment for the Emulator

```bash
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_ADMIN_PROJECT_ID=local-project
```

## Seed Data Using the API Seed Script

```bash
# from services/api
pnpm install
pnpm run seed
```

## Seed Data Using the Service Account JSON

```bash
# Create a service account key in GCP and save it locally as ./gcp-sa-key.json
export FIREBASE_ADMIN_KEYFILE=./gcp-sa-key.json
pnpm --filter @services/api run seed
```

## Notes

- Do not commit service account JSON to source control.
- The seed task writes to `organizations/seed-org/shifts`.
