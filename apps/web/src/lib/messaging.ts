import { getMessaging, getToken, isSupported } from 'firebase/messaging';

import { getFirebaseApp } from '@/lib/firebase/client';
import { clientEnv } from '@/lib/env';

/**
 * Registers the Firebase Cloud Messaging service worker.
 * This function initializes the messaging service and registers the service worker
 * with the VAPID key for push notifications.
 *
 * @returns {Promise<void>} A promise that resolves when the service worker is registered.
 * @throws {Error} If messaging is not supported or registration fails.
 */
export async function registerMessagingServiceWorker(): Promise<void> {
  if (!(await isSupported())) {
    throw new Error('Firebase Cloud Messaging is not supported in this browser.');
  }

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  // Register the service worker
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered for messaging:', registration);

    // Get the FCM token using the VAPID key
    const token = await getToken(messaging, {
      vapidKey: clientEnv.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log('FCM Token:', token);
      // Here you can send the token to your server or store it as needed
    } else {
      console.warn('No FCM token available.');
    }
  } else {
    throw new Error('Service Workers are not supported in this browser.');
  }
}
