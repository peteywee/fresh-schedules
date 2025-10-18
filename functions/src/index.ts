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
import { onRequest } from "firebase-functions/v1"; // Corrected import for v1
import * as logger from "firebase-functions/logger";

// Set global options for all functions, such as the maximum number of instances.
// This is a cost-control measure to prevent unexpected traffic from scaling up
// too many function instances. This can be overridden on a per-function basis.
// Note: This applies to v2 functions. For v1 functions, use `runWith()`.
setGlobalOptions({ maxInstances: 10 });

// Example of a simple HTTP-triggered function (currently commented out).
// To enable it, uncomment the code block.
/*
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});
*/
