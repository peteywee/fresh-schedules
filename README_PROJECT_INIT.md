# Project Init — Hooking branches to Firebase

These instructions are a quick checklist to initialize a local developer environment and connect branches to Firebase projects.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Create local env

```bash
cp .env.example .env.local
# Fill `.env.local` with your Firebase client keys and set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON
```

## 3. Select a Firebase project for this branch

Add your project interactively:

```bash
pnpm init:firebase <your-project-id>
```

## 4. Start the Firestore emulator

```bash
pnpm emulators:start
```

## 5. Seed the emulator

```bash
pnpm emulators:seed
```

## 6. Deploy

```bash
pnpm deploy:functions
pnpm deploy:rules
pnpm deploy:indexes
```

### Notes

- To avoid accidental production writes, the seed script requires `--prod --yes` for production.
- Keep your service account JSON out of source control. Add it to .gitignore.
