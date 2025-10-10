// PLACEHOLDER: This file contains values that MUST be replaced using environment variables or secret storage.
// Wire Firebase Admin SDK credentials through env before using getFirestore().

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

export async function getFirestore(): Promise<FirestoreLike> {
  throw new Error('PLACEHOLDER: Connect Firebase Admin SDK and return Firestore instance.');
}
