/**
 * @fileoverview Cloud Functions for secure invite token management.
 * Implements server-side validation of invite tokens with single-use and expiry checks.
 */
import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin if not already initialized
try {
  initializeApp();
} catch (e) {
  // App already initialized
}

const db = getFirestore();

/**
 * Data structure for invite tokens stored in Firestore.
 * @interface InviteToken
 * @property {string} organizationId - The organization ID this invite is for
 * @property {string} role - The role to be granted ('admin' | 'manager' | 'staff')
 * @property {string} createdBy - UID of the user who created the invite
 * @property {Timestamp} createdAt - When the invite was created
 * @property {Timestamp} expiresAt - When the invite expires
 * @property {boolean} used - Whether the invite has been redeemed
 * @property {string} [usedBy] - UID of the user who redeemed the invite
 * @property {Timestamp} [usedAt] - When the invite was redeemed
 */
interface InviteToken {
  organizationId: string;
  role: "admin" | "manager" | "staff";
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp;
  used: boolean;
  usedBy?: string;
  usedAt?: FirebaseFirestore.Timestamp;
}

/**
 * Redeems a join token to add a user to an organization.
 * 
 * @security This function implements several security measures:
 * - Verifies the user is authenticated
 * - Validates the invite token exists and hasn't been used
 * - Checks the invite hasn't expired
 * - Ensures single-use by marking the token as used atomically
 * - Prevents users from arbitrarily joining organizations
 * 
 * @param {object} data - The request data
 * @param {string} data.inviteToken - The invite token ID (NOT the org ID)
 * @returns {Promise<{success: boolean, organizationId: string, role: string}>}
 * @throws {HttpsError} If authentication fails, token is invalid, expired, or already used
 */
export const redeemJoinToken = onCall(
  { maxInstances: 10 },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to redeem an invite token"
      );
    }

    const { inviteToken } = request.data;
    const userId = request.auth.uid;

    // Validate input
    if (!inviteToken || typeof inviteToken !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "inviteToken must be a non-empty string"
      );
    }

    logger.info("Attempting to redeem invite", {
      inviteToken,
      userId,
    });

    // Use a transaction to ensure atomic single-use token redemption
    try {
      const result = await db.runTransaction(async (transaction) => {
        // Get the invite document
        const inviteRef = db.collection("invites").doc(inviteToken);
        const inviteDoc = await transaction.get(inviteRef);

        // Verify invite exists
        if (!inviteDoc.exists) {
          throw new HttpsError(
            "not-found",
            "Invalid invite token"
          );
        }

        const invite = inviteDoc.data() as InviteToken;

        // Verify invite hasn't been used
        if (invite.used) {
          throw new HttpsError(
            "failed-precondition",
            "This invite has already been used"
          );
        }

        // Verify invite hasn't expired
        const now = new Date();
        if (invite.expiresAt.toDate() < now) {
          throw new HttpsError(
            "failed-precondition",
            "This invite has expired"
          );
        }

        // Check if user is already a member
        const memberRef = db
          .collection("organizations")
          .doc(invite.organizationId)
          .collection("members")
          .doc(userId);
        const memberDoc = await transaction.get(memberRef);

        if (memberDoc.exists) {
          throw new HttpsError(
            "already-exists",
            "You are already a member of this organization"
          );
        }

        // Mark invite as used
        transaction.update(inviteRef, {
          used: true,
          usedBy: userId,
          usedAt: FieldValue.serverTimestamp(),
        });

        // Create member document
        transaction.set(memberRef, {
          userId,
          organizationId: invite.organizationId,
          role: invite.role,
          joinedAt: FieldValue.serverTimestamp(),
          invitedBy: invite.createdBy,
        });

        return {
          organizationId: invite.organizationId,
          role: invite.role,
        };
      });

      logger.info("Invite redeemed successfully", {
        inviteToken,
        userId,
        organizationId: result.organizationId,
        role: result.role,
      });

      return {
        success: true,
        organizationId: result.organizationId,
        role: result.role,
      };
    } catch (error) {
      // Re-throw HttpsError
      if (error instanceof HttpsError) {
        throw error;
      }

      // Log and wrap unexpected errors
      logger.error("Failed to redeem invite", {
        inviteToken,
        userId,
        error,
      });

      throw new HttpsError(
        "internal",
        "Failed to redeem invite token. Please try again later."
      );
    }
  }
);
