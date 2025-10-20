import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// This is required for all backend functions to interact with Firebase services.
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import and export the cloud functions.
// This makes them deployable and accessible to the Firebase environment.
import { autoClockOutWorker } from "./autoClockOutWorker";
import { attendanceReplicator } from "./attendanceReplicator";

export {
  autoClockOutWorker,
  attendanceReplicator,
};