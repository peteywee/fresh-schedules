/**
 * @fileoverview Environment variable management for the client-side.
 * This module uses Zod to validate and parse environment variables required by the application,
 * ensuring that all necessary configuration is present and correctly formatted.
 * It specifically handles Firebase configuration variables prefixed with `NEXT_PUBLIC_`.
 */
import { z } from 'zod';

/**
 * Zod schema for validating client-side environment variables.
 * Ensures that all required Firebase configuration values are present.
 * @property {string} NEXT_PUBLIC_FIREBASE_API_KEY - Firebase API Key.
 * @property {string} NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN - Firebase Authentication Domain.
 * @property {string} NEXT_PUBLIC_FIREBASE_PROJECT_ID - Firebase Project ID.
 * @property {string} NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET - Firebase Storage Bucket.
 * @property {string} NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID - Firebase Messaging Sender ID.
 * @property {string} NEXT_PUBLIC_FIREBASE_APP_ID - Firebase App ID.
 * @property {string} [NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID] - Firebase Measurement ID (optional).
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is required'),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_VAPID_KEY is required'),
});

/**
 * Raw client environment variables extracted from `process.env`.
 * @type {Record<string, string | undefined>}
 */
const rawClientEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
};

const parsed = clientEnvSchema.safeParse(rawClientEnv);

if (!parsed.success) {
  const formatted = parsed.error.format();
  throw new Error(`Invalid client environment variables. Details: ${JSON.stringify(formatted)}`);
}

/**
 * The validated and parsed client-side environment variables.
 * Use this object to access environment variables in the application.
 * @type {z.infer<typeof clientEnvSchema>}
 */
export const clientEnv = parsed.data;

/**
 * Firebase configuration object.
 * This object is constructed from the validated environment variables and can be used
 * to initialize the Firebase app.
 * @property {string} apiKey - Firebase API Key.
 * @property {string} authDomain - Firebase Authentication Domain.
 * @property {string} projectId - Firebase Project ID.
 * @property {string} storageBucket - Firebase Storage Bucket.
 * @property {string} messagingSenderId - Firebase Messaging Sender ID.
 * @property {string} appId - Firebase App ID.
 * @property {string} [measurementId] - Firebase Measurement ID (optional).
 */
export const firebaseConfig = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
