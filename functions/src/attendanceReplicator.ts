import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createHash } from "crypto";

/**
 * Triggered on the creation of a new attendance record.
 * This function creates a secure, append-only ledger entry for audit purposes.
 *
 * Logic:
 * 1. Retrieves the newly created attendance record.
 * 2. Creates a salted hash of the critical fields (uid, type, at, recordId)
 *    to ensure data integrity. The salt is a configured secret.
 * 3. Writes a new document to the `attendance_ledger` subcollection with the
 *    original data and the computed hash.
 * 4. Updates the original attendance record to set `isVerified` to true.
 */
export const attendanceReplicator = functions.runWith({
    secrets: ["LEDGER_HASH_SALT"],
}).firestore
    .document("orgs/{orgId}/attendance_records/{recordId}")
    .onCreate(async (snap, context) => {
        const record = snap.data();
        const { orgId, recordId } = context.params;
        const { uid, type, at } = record;
        const salt = process.env.LEDGER_HASH_SALT;

        if (!uid || !type || !at || !salt) {
            console.error("Missing critical data or salt for record:", recordId);
            return;
        }

        // 1. Create a salted hash for the ledger entry
        const dataToHash = `${uid}-${type}-${at.toMillis()}-${recordId}`;
        const hash = createHash("sha256").update(dataToHash).update(salt).digest("hex");

        const db = admin.firestore();
        const ledgerRef = db.collection(`orgs/${orgId}/attendance_ledger`).doc();

        try {
            // 2. Write to the secure ledger
            await ledgerRef.set({
                recordId: recordId,
                uid: uid,
                type: type,
                at: at,
                hash: hash,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // 3. Mark the original record as verified
            await snap.ref.update({ isVerified: true });

            console.log(`Successfully replicated attendance record ${recordId} to ledger.`);

        } catch (error) {
            console.error(`Error replicating attendance record ${recordId}:`, error);
        }
    });