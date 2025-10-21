/**
 * @fileoverview Cloud Functions for attendance tracking and auto clock-out.
 * Implements secure attendance ledger management with UTC timestamps.
 */
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import * as crypto from "crypto";

// Initialize Firebase Admin if not already initialized
try {
  initializeApp();
} catch (e) {
  // App already initialized
}

const db = getFirestore();

/**
 * Generates a secure hash for attendance ledger entries.
 * 
 * @param {string} data - The data to hash
 * @returns {string} The hashed data
 * @throws {Error} If LEDGER_HASH_SALT is not configured
 */
function generateLedgerHash(data: string): string {
  const salt = process.env.LEDGER_HASH_SALT;
  
  if (!salt) {
    throw new Error("LEDGER_HASH_SALT environment variable is not configured");
  }
  
  return crypto
    .createHmac("sha256", salt)
    .update(data)
    .digest("hex");
}

/**
 * Data structure for shift documents.
 * @interface ShiftData
 * @property {string} id - Shift ID
 * @property {string} organizationId - Organization ID
 * @property {string} scheduleId - Schedule ID
 * @property {string} [assignedUid] - UID of assigned staff member
 * @property {Timestamp} startTime - Shift start time
 * @property {Timestamp} endTime - Shift end time
 * @property {Timestamp} [clockInAt] - When staff clocked in
 * @property {Timestamp} [clockOutAt] - When staff clocked out
 * @property {Timestamp} [autoClockOutAt] - When auto clock-out occurred
 */
interface ShiftData {
  id: string;
  organizationId: string;
  scheduleId: string;
  assignedUid?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  clockInAt?: Timestamp;
  clockOutAt?: Timestamp;
  autoClockOutAt?: Timestamp;
}

/**
 * Automatically clocks out staff members for shifts that have ended.
 * 
 * @security This function:
 * - Validates LEDGER_HASH_SALT is configured before processing
 * - Uses UTC timestamps consistently via Firestore Timestamp
 * - Writes to attendance_ledger which is protected by Firestore rules
 * - Logs operations with structured data without leaking sensitive fields
 * 
 * @description Runs every hour to check for shifts that ended but weren't clocked out.
 * Only processes shifts where:
 * - The shift has an assigned staff member
 * - The staff member clocked in
 * - The staff member hasn't clocked out yet
 * - The shift end time has passed
 * 
 * @fires Scheduled function that runs every hour
 */
export const autoClockOutWorker = onSchedule(
  {
    schedule: "0 * * * *", // Run every hour at minute 0
    timeZone: "UTC",
    maxInstances: 1,
  },
  async (event) => {
    // Validate environment configuration early
    if (!process.env.LEDGER_HASH_SALT) {
      logger.error("LEDGER_HASH_SALT environment variable is not configured. Skipping auto clock-out.");
      return;
    }

    const now = Timestamp.now();
    logger.info("Starting auto clock-out worker", {
      timestamp: now.toDate().toISOString(),
    });

    try {
      // Query for shifts that need auto clock-out
      // Conditions:
      // 1. Shift has ended (endTime < now)
      // 2. Staff member has clocked in (clockInAt exists)
      // 3. Staff member hasn't clocked out (clockOutAt doesn't exist)
      // 4. No auto clock-out has occurred (autoClockOutAt doesn't exist)
      
      const shiftsSnapshot = await db
        .collectionGroup("shifts")
        .where("clockInAt", "!=", null)
        .where("clockOutAt", "==", null)
        .where("autoClockOutAt", "==", null)
        .where("endTime", "<", now)
        .limit(100) // Process in batches
        .get();

      if (shiftsSnapshot.empty) {
        logger.info("No shifts requiring auto clock-out");
        return;
      }

      logger.info(`Found ${shiftsSnapshot.size} shifts requiring auto clock-out`);

      // Process each shift
      const batch = db.batch();
      const ledgerEntries: Array<{
        shiftId: string;
        organizationId: string;
        staffUid: string;
        clockOutTime: string;
      }> = [];

      shiftsSnapshot.forEach((doc) => {
        const shift = doc.data() as ShiftData;
        
        // Skip if no assigned staff member
        if (!shift.assignedUid) {
          return;
        }

        // Use the shift's actual end time as clock-out time (UTC Timestamp)
        // This ensures consistent timezone handling
        const clockOutTime = shift.endTime;

        // Update shift with clock-out time
        batch.update(doc.ref, {
          clockOutAt: clockOutTime,
          autoClockOutAt: now,
          updatedAt: Timestamp.now(),
        });

        // Prepare ledger entry data
        ledgerEntries.push({
          shiftId: doc.id,
          organizationId: shift.organizationId,
          staffUid: shift.assignedUid,
          clockOutTime: clockOutTime.toDate().toISOString(),
        });

        // Create attendance ledger entry
        const ledgerData = {
          shiftId: doc.id,
          organizationId: shift.organizationId,
          staffUid: shift.assignedUid,
          scheduleId: shift.scheduleId,
          clockInAt: shift.clockInAt,
          clockOutAt: clockOutTime,
          autoClockOut: true,
          recordedAt: now,
          // Generate secure hash of the attendance record
          hash: generateLedgerHash(
            `${doc.id}|${shift.assignedUid}|${shift.clockInAt?.toMillis()}|${clockOutTime.toMillis()}`
          ),
        };

        const ledgerRef = db.collection("attendance_ledger").doc();
        batch.set(ledgerRef, ledgerData);
      });

      // Commit all changes atomically
      await batch.commit();

      logger.info("Auto clock-out completed successfully", {
        processedCount: ledgerEntries.length,
        // Log summary without sensitive details
        summary: ledgerEntries.map((entry) => ({
          shiftId: entry.shiftId,
          organizationId: entry.organizationId,
          // Do not log actual timestamps or user IDs in production logs
        })),
      });
    } catch (error) {
      logger.error("Auto clock-out worker failed", {
        error: error instanceof Error ? error.message : String(error),
        // Don't leak sensitive error details
      });
      throw error;
    }
  }
);
