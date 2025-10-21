# Firebase Setup (Quick start)

This repository includes Firebase hosting, functions, and Firestore rules/indexes. Follow these steps to hook up your Firebase project and use local emulators.

1. Install Firebase CLI

   pnpm add -w -D firebase-tools

2. Login and init

   npx firebase login
   npx firebase use --add

Select your Firebase project for each site as appropriate.

3. Configure environment variables

Copy `.env.example` to `.env.local` for local development and fill in the client keys from the Firebase Console -> Project Settings -> General.

Set Google credentials for server (for production or administrative operations):

   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

4. Emulators (recommended for local work)

Start Firestore emulator only:

   npx firebase emulators:start --only firestore

Confirm it is running on 127.0.0.1:8080 and then run the seed script:

   export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
   pnpm seed

5. Deploying to production

To deploy functions:

   pnpm deploy:functions

To deploy Firestore rules and indexes:

   pnpm deploy:rules
   pnpm deploy:indexes


Notes

- If you need to generate a service account for production, go to the Firebase Console -> Project Settings -> Service accounts -> Generate new private key.
- Keep service account JSON files out of git (add to .gitignore).
