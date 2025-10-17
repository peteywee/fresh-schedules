import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }

export type WeekStatus = 'draft' | 'published';

export type WeekDoc = {
  status: WeekStatus;
  publishedAt?: any; // Timestamp
  publishedBy?: string; // uid
  // Optional snapshot fields set at publish time:
  allowedDollars?: number;
  allowedHours?: number;
  note?: string;
};

export async function getWeek(dbOrgId: string, weekKey: string): Promise<WeekDoc | null> {
  const db = getFirestore(app());
  const ref = doc(db, 'orgs', dbOrgId, 'weeks', weekKey);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as WeekDoc) : null;
}

type PublishOptions = {
  allowedDollars?: number;
  allowedHours?: number;
  note?: string;
};

export async function publishWeek(dbOrgId: string, weekKey: string, opts: PublishOptions = {}) {
  const db = getFirestore(app());
  const auth = getAuth(app());
  const uid = auth.currentUser?.uid ?? 'system';
  const ref = doc(db, 'orgs', dbOrgId, 'weeks', weekKey);
  await setDoc(ref, {
    status: 'published',
    publishedAt: serverTimestamp(),
    publishedBy: uid,
    ...(opts.allowedDollars != null ? { allowedDollars: opts.allowedDollars } : {}),
    ...(opts.allowedHours != null ? { allowedHours: opts.allowedHours } : {}),
    ...(opts.note ? { note: opts.note } : {}),
  }, { merge: true });
}

export async function unpublishWeek(dbOrgId: string, weekKey: string) {
  const db = getFirestore(app());
  const ref = doc(db, 'orgs', dbOrgId, 'weeks', weekKey);
  await setDoc(ref, { status: 'draft' }, { merge: true });
}
