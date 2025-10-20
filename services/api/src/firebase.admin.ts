import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK using application default credentials when available
export function initAdmin() {
  initializeApp(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ? { credential: applicationDefault() } : {}
  );
  return getFirestore();
}
