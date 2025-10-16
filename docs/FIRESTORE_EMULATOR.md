# Firestore Emulator and Local Seeding

This document explains how to run the Firestore emulator locally and seed demo data for development.

Prereqs
- Node.js and pnpm installed
- Firebase CLI: `npm i -g firebase-tools`

Run Firestore emulator

```bash
# from repo root
# start the emulator (interactive)
firebase emulators:start --only firestore

# or run in background with --project local-project
# firebase emulators:start --only firestore --project local-project &
```

Configure env for the emulator

```bash
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_ADMIN_PROJECT_ID=local-project
```

Seed data using the API seed script

```bash
# from services/api
pnpm install
pnpm run seed
```

Seed data using the service account JSON

```bash
# Create a service account key in GCP and save it locally as ./gcp-sa-key.json
export FIREBASE_ADMIN_KEYFILE=./gcp-sa-key.json
pnpm --filter @services/api run seed
```

Notes
- Do not commit service account JSON to source control.
- The seed task writes to `organizations/seed-org/shifts`.
