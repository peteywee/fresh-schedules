"use client";
/**
 * @fileoverview Firebase client-side initialization and utility functions.
 * This module ensures that the Firebase app is initialized only once and provides
 * functions to access the Firebase app instance, initialize Analytics, and handle authentication.
 * The "use client" directive indicates that this module is intended for client-side use in a Next.js environment.
 */

import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';

import { firebaseConfig } from '@/lib/env';

let cachedApp: FirebaseApp | null = null;

/**
 * Gets the initialized Firebase app instance.
 * If the app is already initialized, it returns the cached instance.
 * Otherwise, it initializes the app and caches it for future use.
 * This pattern prevents re-initialization on hot reloads and subsequent calls.
 * @returns {FirebaseApp} The initialized Firebase app instance.
 */
export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) {
    return cachedApp;
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cachedApp = app;
  return app;
}

/**
 * Initializes Firebase Analytics if it's supported by the browser.
 * This function should be called on the client-side. It checks for the availability
 * of the `window` object and whether Firebase Analytics is supported.
 * @returns {Promise<Analytics | null>} A promise that resolves to the Analytics instance if initialized, otherwise null.
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  const app = getFirebaseApp();
  if (await isSupported().catch(() => false)) {
    return getAnalytics(app);
  }
  return null;
}

/**
 * Gets the Firebase Auth instance.
 * @returns The Firebase Auth instance.
 */
export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return getAuth(app);
}

/**
 * Signs in with Google using Firebase Auth.
 * @returns {Promise<User>} A promise that resolves to the signed-in user.
 */
export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}
