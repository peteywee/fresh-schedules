import { readFileSync } from 'fs';
import * as admin from 'firebase-admin';
import path from 'path';

/**
 * Seed helper for local development.
 *
 * Usage:
 *  - With service account JSON file: set FIREBASE_ADMIN_KEYFILE=/path/to/key.json
 *  - With env vars: set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
 *  - For emulator: set FIRESTORE_EMULATOR_HOST=localhost:8080 and run the emulator
 */

async function initFirestore() {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('Using Firestore emulator at', process.env.FIRESTORE_EMULATOR_HOST);
    process.env.GOOGLE_CLOUD_PROJECT = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'local-project';
    admin.initializeApp();
    return admin.firestore();
  }

  const keyFile = process.env.FIREBASE_ADMIN_KEYFILE;
  if (keyFile) {
    const fullPath = path.isAbsolute(keyFile) ? keyFile : path.join(process.cwd(), keyFile);
    const json = JSON.parse(readFileSync(fullPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(json as admin.ServiceAccount) });
    return admin.firestore();
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase admin credentials. Set FIREBASE_ADMIN_KEYFILE or FIREBASE_ADMIN_PROJECT_ID/FIREBASE_ADMIN_CLIENT_EMAIL/FIREBASE_ADMIN_PRIVATE_KEY');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    } as admin.ServiceAccount),
  });

  return admin.firestore();
}

async function seed() {
  const db = await initFirestore();

  const orgRef = db.collection('organizations').doc('seed-org');
  const shiftsRef = orgRef.collection('shifts');

  const sampleShifts = [
    {
      eventId: 'opening-shift',
      role: 'Manager',
      staffUid: 'alice',
      startTime: '2025-10-20T09:00:00Z',
      endTime: '2025-10-20T17:00:00Z',
    },
    {
      eventId: 'closing-shift',
      role: 'Staff',
      staffUid: 'bob',
      startTime: '2025-10-20T13:00:00Z',
      endTime: '2025-10-20T21:00:00Z',
    },
  ];

  console.log('Seeding', sampleShifts.length, 'shifts to organizations/seed-org/shifts');
  for (const s of sampleShifts) {
    const id = `seed_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await shiftsRef.doc(id).set({ ...s, id, createdAt: new Date().toISOString() });
    console.log('Wrote', id);
  }

  console.log('Done seeding');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
