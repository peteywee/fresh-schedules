/**
 * @fileoverview Placeholder module for Firebase Admin SDK initialization.
 * This module provides a stubbed implementation of Firestore initialization
 * that returns mock data when Firebase Admin credentials are not configured.
 * Replace this with the actual firebase.ts module once environment variables are set.
 */

export type FirestoreDocRef = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (data: any) => Promise<void>;
};

export type FirestoreCollectionRef = {
  doc: (id: string) => FirestoreDocRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: () => Promise<{ docs: any[] }>;
};

export type FirestoreLike = {
  collection: (path: string) => FirestoreCollectionRef;
};

/**
 * Returns a placeholder Firestore instance that simulates basic operations.
 * This allows the API to function without real Firebase credentials for development/demo purposes.
 * @throws {Error} Always throws to indicate Firestore is not configured.
 */
export async function getFirestore(): Promise<FirestoreLike> {
  throw new Error('Firestore not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY, and FIREBASE_ADMIN_CLIENT_EMAIL environment variables.');
}
