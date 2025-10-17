import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: any;
  updatedAt: any;
  primaryOrgId?: string | null;
  orgIds?: string[];
  corpIds?: string[];
  tz?: string | null;
  locale?: string | null;
  roles?: Record<string, 'admin'|'manager'|'staff'>;
};

export async function ensureUserProfile(): Promise<UserProfile> {
  const auth = getAuth(app());
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const db = getFirestore(app());
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      primaryOrgId: null,
      orgIds: [],
      corpIds: [],
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      roles: {},
    };
    await setDoc(ref, profile, { merge: true });
    return (await getDoc(ref)).data() as UserProfile;
  } else {
    // touch updatedAt
    await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true });
    return snap.data() as UserProfile;
  }
}