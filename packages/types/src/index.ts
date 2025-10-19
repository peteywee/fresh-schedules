/**
 * @fileoverview Shared Zod schemas and TypeScript types for the application.
 * This file centralizes the data structures used across different parts of the system,
 * ensuring consistency and providing a single source of truth for data validation.
 */
import { z } from "zod";

/**
 * Defines the possible roles a user can have within an organization.
 * @enum {string}
 * @property {string} admin - Administrator with full access.
 * @property {string} manager - Manager with scheduling and approval rights.
 * @property {string} staff - Staff member with access to their own schedule.
 */
export const roleEnum = z.enum(["admin", "manager", "staff"]);

/**
 * Schema for a user reference.
 * Contains basic information to identify a user.
 * @property {string} uid - The user's unique identifier.
 * @property {string} [displayName] - The user's display name.
 * @property {string} [email] - The user's email address.
 */
export const userRefSchema = z.object({
  uid: z.string(),
  displayName: z.string().optional(),
  email: z.string().email().optional()
});

/**
 * Schema for an organization.
 * @property {string} id - The unique identifier for the organization.
 * @property {string} name - The name of the organization.
 * @property {string} ownerUid - The UID of the user who owns the organization.
 * @property {string} createdAt - The ISO timestamp when the organization was created.
 */
export const orgSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerUid: z.string(),
  createdAt: z.string()
});

/**
 * Represents an organization in the system.
 * @typedef {object} Org
 * @property {string} id - The unique identifier for the organization.
 * @property {string} name - The name of the organization.
 * @property {string} ownerUid - The UID of the user who owns the organization.
 * @property {string} createdAt - The ISO timestamp when the organization was created.
 */
export type Org = z.infer<typeof orgSchema>;

/**
 * Schema for a scheduling event.
 * An event is a container for shifts, like a festival or a multi-day conference.
 * @property {string} id - The unique identifier for the event.
 * @property {string} orgId - The ID of the organization this event belongs to.
 * @property {string} name - The name of the event.
 * @property {string} startDate - The start date of the event in ISO format.
 * @property {string} endDate - The end date of the event in ISO format.
 * @property {('draft'|'published')} [status='draft'] - The status of the event.
 */
export const eventSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  startDate: z.string(), // ISO
  endDate: z.string(),   // ISO
  status: z.enum(["draft","published"]).default("draft")
});

/**
 * Represents a scheduling event.
 * @typedef {object} Event
 * @property {string} id - The unique identifier for the event.
 * @property {string} orgId - The ID of the organization this event belongs to.
 * @property {string} name - The name of the event.
 * @property {string} startDate - The start date of the event in ISO format.
 * @property {string} endDate - The end date of the event in ISO format.
 * @property {('draft'|'published')} [status='draft'] - The status of the event.
 */
export type Event = z.infer<typeof eventSchema>;

/**
 * Schema for a work shift.
 * A shift represents a single block of work for a staff member.
 * @property {string} id - The unique identifier for the shift.
 * @property {string} orgId - The ID of the organization this shift belongs to.
 * @property {string} [eventId] - The ID of the event this shift is associated with.
 * @property {string} role - The role required for this shift.
 * @property {string} [staffUid] - The UID of the staff member assigned to this shift.
 * @property {string} startTime - The start time of the shift in ISO format.
 * @property {string} endTime - The end time of the shift in ISO format.
 * @property {number} [breakMinutes=0] - The duration of the break in minutes.
 * @property {boolean} [published=false] - Whether the shift has been published.
 */
export const shiftSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  eventId: z.string().optional(),
  role: z.string(),
  staffUid: z.string().optional(),
  startTime: z.string(), // ISO
  endTime: z.string(),   // ISO
  breakMinutes: z.number().int().min(0).default(0),
  published: z.boolean().default(false)
});

/**
 * Represents a work shift.
 * @typedef {object} Shift
 * @property {string} id - The unique identifier for the shift.
 * @property {string} orgId - The ID of the organization this shift belongs to.
 * @property {string} [eventId] - The ID of the event this shift is associated with.
 * @property {string} role - The role required for this shift.
 * @property {string} [staffUid] - The UID of the staff member assigned to this shift.
 * @property {string} startTime - The start time of the shift in ISO format.
 * @property {string} endTime - The end time of the shift in ISO format.
 * @property {number} [breakMinutes=0] - The duration of the break in minutes.
 * @property {boolean} [published=false] - Whether the shift has been published.
 */
export type Shift = z.infer<typeof shiftSchema>;

/**
 * Schema for creating a new shift.
 * This is a subset of the main shift schema, containing only the fields required for creation.
 */
export const createShiftInput = shiftSchema.pick({
  orgId: true, eventId: true, role: true, staffUid: true, startTime: true, endTime: true, breakMinutes: true
});

/**
 * Schema for a timesheet entry.
 * A timesheet records the actual hours worked by a staff member for a shift.
 * @property {string} id - The unique identifier for the timesheet entry.
 * @property {string} orgId - The ID of the organization this timesheet belongs to.
 * @property {string} staffUid - The UID of the staff member this timesheet is for.
 * @property {string} shiftId - The ID of the shift this timesheet corresponds to.
 * @property {string} clockIn - The actual clock-in time in ISO format.
 * @property {string} [clockOut] - The actual clock-out time in ISO format.
 * @property {boolean} [approved=false] - Whether the timesheet has been approved.
 */
export const timesheetSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  staffUid: z.string(),
  shiftId: z.string(),
  clockIn: z.string(),  // ISO
  clockOut: z.string().optional(),
  approved: z.boolean().default(false)
});

/**
 * Represents a timesheet entry.
 * @typedef {object} Timesheet
 * @property {string} id - The unique identifier for the timesheet entry.
 * @property {string} orgId - The ID of the organization this timesheet belongs to.
 * @property {string} staffUid - The UID of the staff member this timesheet is for.
 * @property {string} shiftId - The ID of the shift this timesheet corresponds to.
 * @property {string} clockIn - The actual clock-in time in ISO format.
 * @property {string} [clockOut] - The actual clock-out time in ISO format.
 * @property {boolean} [approved=false] - Whether the timesheet has been approved.
 */
export type Timesheet = z.infer<typeof timesheetSchema>;

/**
 * Schema for an invite token.
 * Invite tokens are server-managed, single-use tokens for onboarding users to organizations.
 * @property {string} id - The unique identifier for the invite token.
 * @property {string} organizationId - The organization this invite is for.
 * @property {('admin'|'manager'|'staff')} role - The role to be granted.
 * @property {string} createdBy - UID of the user who created the invite.
 * @property {string} createdAt - ISO timestamp when the invite was created.
 * @property {string} expiresAt - ISO timestamp when the invite expires.
 * @property {boolean} [used=false] - Whether the invite has been redeemed.
 * @property {string} [usedBy] - UID of the user who redeemed the invite.
 * @property {string} [usedAt] - ISO timestamp when the invite was redeemed.
 */
export const inviteTokenSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  role: roleEnum,
  createdBy: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  used: z.boolean().default(false),
  usedBy: z.string().optional(),
  usedAt: z.string().optional()
});

/**
 * Represents an invite token.
 * @typedef {object} InviteToken
 */
export type InviteToken = z.infer<typeof inviteTokenSchema>;

/**
 * Schema for an organization member.
 * Members can only be added via Cloud Functions using validated invite tokens.
 * @property {string} userId - The UID of the member.
 * @property {string} organizationId - The organization this membership is for.
 * @property {('admin'|'manager'|'staff')} role - The member's role in the organization.
 * @property {string} joinedAt - ISO timestamp when the member joined.
 * @property {string} invitedBy - UID of the user who created the invite.
 */
export const orgMemberSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  role: roleEnum,
  joinedAt: z.string(),
  invitedBy: z.string()
});

/**
 * Represents an organization member.
 * @typedef {object} OrgMember
 */
export type OrgMember = z.infer<typeof orgMemberSchema>;

/**
 * Schema for an attendance ledger entry.
 * Attendance ledger is strictly managed by Cloud Functions with no client access.
 * @property {string} shiftId - The shift ID.
 * @property {string} organizationId - The organization ID.
 * @property {string} staffUid - The staff member's UID.
 * @property {string} scheduleId - The schedule ID.
 * @property {string} clockInAt - ISO timestamp when the staff member clocked in.
 * @property {string} clockOutAt - ISO timestamp when the staff member clocked out.
 * @property {boolean} autoClockOut - Whether this was an automatic clock-out.
 * @property {string} recordedAt - ISO timestamp when the ledger entry was created.
 * @property {string} hash - Secure hash of the attendance record for integrity.
 */
export const attendanceLedgerSchema = z.object({
  shiftId: z.string(),
  organizationId: z.string(),
  staffUid: z.string(),
  scheduleId: z.string(),
  clockInAt: z.string(),
  clockOutAt: z.string(),
  autoClockOut: z.boolean(),
  recordedAt: z.string(),
  hash: z.string()
});

/**
 * Represents an attendance ledger entry.
 * @typedef {object} AttendanceLedger
 */
export type AttendanceLedger = z.infer<typeof attendanceLedgerSchema>;
