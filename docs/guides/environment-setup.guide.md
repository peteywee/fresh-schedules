# Environment Setup Guide

This guide explains how to configure environment variables for the Fresh Schedules application.

## Overview

The application has been configured to use environment variables for all sensitive configuration, following security best practices. No credentials or API keys are hardcoded in the source code.

## Web App (Next.js)

The web application requires Firebase client configuration to enable authentication and real-time features.

### Setup Steps

1. Copy the example environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Get your Firebase project configuration:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Select your web app or create a new one
   - Copy the configuration values

3. Update `apps/web/.env.local` with your Firebase configuration

### Required Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Optional Variables

```env
# Firebase Analytics (optional)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Push Notifications (optional)
# Required only if you want to enable FCM push notifications
# Get from: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

## API Service (Express)

The API service requires Firebase Admin SDK credentials to perform server-side operations like writing to Firestore.

### Setup Steps

1. Copy the example environment file:
   ```bash
   cp services/api/.env.example services/api/.env
   ```

2. Get your Firebase Admin SDK credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

3. Extract values from the downloaded JSON and update `services/api/.env`:
   - `FIREBASE_PROJECT_ID` → `project_id` from JSON
   - `FIREBASE_CLIENT_EMAIL` → `client_email` from JSON
   - `FIREBASE_PRIVATE_KEY` → `private_key` from JSON (keep the quotes and newlines)

### Required Variables

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Alternative: Application Default Credentials

If you're deploying to Google Cloud Platform (Cloud Run, Cloud Functions, etc.), you can omit these variables. The SDK will automatically use Application Default Credentials, which are managed by GCP.

## Verification

After setting up your environment variables:

1. **Web App**: Run `pnpm --filter @apps/web dev` and verify there are no environment validation errors
2. **API Service**: Run `pnpm --filter @services/api dev` and check the logs for successful Firebase initialization

## Security Notes

- **Never commit `.env` or `.env.local` files to version control** - they are already in `.gitignore`
- Use different Firebase projects for development and production
- Rotate credentials regularly
- Use Firebase Security Rules to restrict access to your Firestore database
- For production deployments, use your hosting platform's secret management (e.g., GitHub Secrets, Cloud Run environment variables)

## Troubleshooting

### Web App

**Error: "Invalid client environment variables"**
- Make sure all required `NEXT_PUBLIC_FIREBASE_*` variables are set
- Restart the dev server after changing environment variables
- Verify variable names match exactly (case-sensitive)

### API Service

**Error: "Firebase Admin SDK initialization failed"**
- Verify `FIREBASE_PRIVATE_KEY` includes the full key with header and footer
- Check that newlines in the private key are properly escaped (`\n`)
- Ensure the service account has appropriate permissions in Firebase Console

**Error: "Permission denied" when writing to Firestore**
- Check your Firestore Security Rules
- Verify the service account has the "Cloud Datastore User" role
- Make sure you're using the correct project ID

## Related Documentation

- [Firebase Configuration Documentation](https://firebase.google.com/docs/web/setup)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
