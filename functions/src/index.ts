/**
 * @fileoverview Main entrypoint for Firebase Functions.
 * This file is the primary location for defining and exporting cloud functions.
 * It is pre-configured with global options for cost control and includes examples
 * of how to import and structure function triggers.
 *
 * To add new functions, import the required triggers from `firebase-functions`
 * and export them from this file.
 *
 * @example
 * ```typescript
 * import { onCall } from "firebase-functions/v2/https";
 *
 * export const myFunction = onCall((request) => {
 *   // Function logic here
 * });
 * ```
 *
 * @see https://firebase.google.com/docs/functions
 */
import { setGlobalOptions } from "firebase-functions";

// Set global options for all functions, such as the maximum number of instances.
// This is a cost-control measure to prevent unexpected traffic from scaling up
// too many function instances. This can be overridden on a per-function basis.
// Note: This applies to v2 functions. For v1 functions, use `runWith()`.
setGlobalOptions({ maxInstances: 10 });

// Export invite management functions
export { redeemJoinToken } from "./invites";

// Export attendance tracking functions
export { autoClockOutWorker } from "./attendance";
