"use client";
/**
 * @fileoverview Firebase Cloud Messaging (FCM) service worker registration.
 * This file handles the registration of the FCM service worker and configures
 * it with the VAPID key loaded from environment variables following security best practices.
 */

import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { getFirebaseApp } from './firebase/client';

/**
 * Registers the Firebase Cloud Messaging service worker and requests notification permission.
 * The VAPID key must be provided via the NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable.
 * 
 * @returns {Promise<string | null>} The FCM token if registration is successful, null otherwise.
 * @throws {Error} If service workers are not supported or registration fails.
 * 
 * @example
 * ```typescript
 * if ('serviceWorker' in navigator) {
 *   registerMessagingServiceWorker().then((token) => {
 *     if (token) {
 *       console.log('FCM Token:', token);
 *       // Send token to your backend
 *     }
 *   }).catch(error => {
 *     console.error('Messaging service worker registration failed:', error);
 *   });
 * }
 * ```
 */
export async function registerMessagingServiceWorker(): Promise<string | null> {
  // Check if running in browser environment
  if (typeof window === 'undefined') {
    console.warn('registerMessagingServiceWorker called in non-browser environment');
    return null;
  }

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser');
    return null;
  }

  // Check if VAPID key is configured
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn('NEXT_PUBLIC_FIREBASE_VAPID_KEY is not configured. FCM will not be enabled.');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Initialize Firebase Messaging
    const app = getFirebaseApp();
    const messaging = getMessaging(app);

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('FCM Token obtained:', token);
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error during FCM registration:', error);
    throw error;
  }
}

/**
 * Sets up a listener for foreground messages.
 * When the app is in the foreground, this handler will be called for incoming messages.
 * 
 * @param {Function} callback - Function to call when a message is received.
 * @returns {Function} Unsubscribe function to stop listening for messages.
 * 
 * @example
 * ```typescript
 * const unsubscribe = onForegroundMessage((payload) => {
 *   console.log('Foreground message received:', payload);
 *   // Display notification or update UI
 * });
 * 
 * // Later, to stop listening:
 * unsubscribe();
 * ```
 */
export function onForegroundMessage(callback: (payload: unknown) => void): () => void {
  if (typeof window === 'undefined') {
    console.warn('onForegroundMessage called in non-browser environment');
    return () => {};
  }

  try {
    const app = getFirebaseApp();
    const messaging = getMessaging(app);
    
    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return () => {};
  }
}
