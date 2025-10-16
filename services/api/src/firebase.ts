import * as admin from 'firebase-admin';

export type FirestoreDocRef = admin.firestore.DocumentReference;
export type FirestoreCollectionRef = admin.firestore.CollectionReference;
export type FirestoreLike = admin.firestore.Firestore;

let firestoreInstance: admin.firestore.Firestore | null = null;

export async function getFirestore(): Promise<FirestoreLike> {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error('Missing Firebase Admin SDK environment variables: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL');
  }

  const serviceAccount = {
    type: 'service_account',
    project_id: projectId,
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID || '',
    private_key: privateKey,
    client_email: clientEmail,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL || '',
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  firestoreInstance = admin.firestore();
  return firestoreInstance;
}
