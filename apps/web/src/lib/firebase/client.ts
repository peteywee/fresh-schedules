"use client";

import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

import { firebaseConfig } from '@/lib/env';

let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) {
    return cachedApp;
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cachedApp = app;
  return app;
}

export async function initAnalytics() {
  if (typeof window === 'undefined') {
    return null;
  }
  const app = getFirebaseApp();
  if (await isSupported().catch(() => false)) {
    return getAnalytics(app);
  }
  return null;
}
