import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

function getAdminApp() {
  if (getApps().length === 0) {
    const privateKeyBase64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64!;
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
    
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey
      })
    });
  } else {
    adminApp = getApps()[0];
  }
  
  return adminApp;
}

const app = getAdminApp();
const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

export { adminDb, adminAuth };
