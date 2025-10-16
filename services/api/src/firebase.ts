/**
 * @fileoverview Firebase Admin SDK initialization for server-side operations.
 * This module initializes the Firebase Admin SDK using environment variables
 * and provides access to Firestore. No hardcoded credentials are stored here.
 */

import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

/**
 * Initializes Firebase Admin SDK if not already initialized.
 * Reads configuration from environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY
 * 
 * Falls back to Application Default Credentials if running in a GCP environment.
 * @returns {admin.app.App} The initialized Firebase Admin app instance.
 */
function initializeFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if app is already initialized
    firebaseApp = admin.app();
    return firebaseApp;
  } catch (error) {
    // App not initialized, proceed with initialization
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // If credentials are provided via environment variables, use them
  if (projectId && clientEmail && privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      }),
      projectId,
    });
  } else {
    // Fall back to Application Default Credentials (useful for Cloud Run, Cloud Functions, etc.)
    firebaseApp = admin.initializeApp();
  }

  return firebaseApp;
}

export type FirestoreDocRef = {
  collection: (path: string) => FirestoreCollectionRef;
  set: (data: Record<string, unknown>) => Promise<void>;
};

export type FirestoreCollectionRef = {
  doc: (id?: string) => FirestoreDocRef;
};

export type FirestoreLike = {
  collection: (path: string) => FirestoreCollectionRef;
};

/**
 * Gets the Firestore instance from the initialized Firebase Admin app.
 * @returns {Promise<FirestoreLike>} A promise that resolves to the Firestore instance.
 * @throws {Error} If Firebase Admin SDK initialization fails.
 */
export async function getFirestore(): Promise<FirestoreLike> {
  try {
    const app = initializeFirebaseAdmin();
    return app.firestore() as unknown as FirestoreLike;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw new Error('Firebase Admin SDK initialization failed. Ensure environment variables are set correctly.');
  }
}
