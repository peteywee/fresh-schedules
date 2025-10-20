import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

/**
 * Scheduled function that runs every 5 minutes to automatically clock out users
 * who have missed their shift's end time plus a grace period.
 *
 * Logic:
 * 1. Queries all timesheets across all orgs where `outAt` is null.
 * 2. For each open timesheet, it fetches the corresponding shift.
 * 3. It calculates the auto-clock-out time (shift end time + grace period).
 * 4. If the current time is past the auto-clock-out time, it updates the
 *    timesheet with an `outAt` timestamp and creates a 'late_clockout' alert.
 */
export const autoClockOutWorker = functions.runWith({
    // Use environment variables for configuration
    secrets: ["AUTO_CLOCKOUT_GRACE_MINUTES"],
}).pubsub.schedule("every 5 minutes").onRun(async (context) => {
    const db = getFirestore();
    const now = new Date();
    const graceMinutes = parseInt(process.env.AUTO_CLOCKOUT_GRACE_MINUTES || "25");

    console.log(`Running autoClockOutWorker with a ${graceMinutes} minute grace period.`);

    const openTimesheets = await db.collectionGroup("timesheets").where("outAt", "==", null).get();

    if (openTimesheets.empty) {
        console.log("No open timesheets found. Exiting.");
        return null;
    }

    const promises: Promise<any>[] = [];

    for (const sheetDoc of openTimesheets.docs) {
        const timesheet = sheetDoc.data();
        const { orgId, shiftId, uid } = timesheet;

        if (!orgId || !shiftId) {
            console.log(`Skipping timesheet ${sheetDoc.id} due to missing orgId or shiftId.`);
            continue;
        }

        const shiftRef = db.doc(`orgs/${orgId}/shifts/${shiftId}`);
        const shiftDoc = await shiftRef.get();

        if (!shiftDoc.exists) {
            console.warn(`Shift ${shiftId} for timesheet ${sheetDoc.id} not found.`);
            continue;
        }

        const shift = shiftDoc.data()!;

        // Combine shift day (Timestamp) and end time (HH:mm string)
        const shiftDay = (shift.day as admin.firestore.Timestamp).toDate();
        const [endHours, endMinutes] = shift.end.split(':').map(Number);

        const shiftEnd = new Date(shiftDay.getFullYear(), shiftDay.getMonth(), shiftDay.getDate(), endHours, endMinutes);

        const clockOutTime = new Date(shiftEnd.getTime() + graceMinutes * 60 * 1000);

        if (now > clockOutTime) {
            console.log(`Timesheet ${sheetDoc.id} for user ${uid} is late. Auto-clocking out.`);

            // 1. Update the timesheet
            const p1 = sheetDoc.ref.update({
                outAt: shiftEnd, // Clock out at the scheduled end time
                source: "auto",
                updatedAt: FieldValue.serverTimestamp(),
            });
            promises.push(p1);

            // 2. Create an alert
            const alertRef = db.collection(`orgs/${orgId}/alerts`).doc();
            const p2 = alertRef.set({
                type: "late_clockout",
                message: `User ${uid} was automatically clocked out for shift ${shiftId}.`,
                severity: "low",
                createdAt: FieldValue.serverTimestamp(),
                resolved: false,
                uid: uid,
                shiftId: shiftId,
            });
            promises.push(p2);
        }
    }

    await Promise.all(promises);
    console.log(`Processed ${openTimesheets.size} timesheets. ${promises.length / 2} users were clocked out.`);
    return null;
});