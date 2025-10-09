// Shared Zod schemas and types (refactored)
import { z } from "zod";

export const roleEnum = z.enum(["admin", "manager", "staff"]);

export const userRefSchema = z.object({
  uid: z.string(),
  displayName: z.string().optional(),
  email: z.string().email().optional()
});

export const orgSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerUid: z.string(),
  createdAt: z.string()
});
export type Org = z.infer<typeof orgSchema>;

export const eventSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  startDate: z.string(), // ISO
  endDate: z.string(),   // ISO
  status: z.enum(["draft","published"]).default("draft")
});
export type Event = z.infer<typeof eventSchema>;

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
export type Shift = z.infer<typeof shiftSchema>;

export const createShiftInput = shiftSchema.pick({
  orgId: true, eventId: true, role: true, staffUid: true, startTime: true, endTime: true, breakMinutes: true
});

export const timesheetSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  staffUid: z.string(),
  shiftId: z.string(),
  clockIn: z.string(),  // ISO
  clockOut: z.string().optional(),
  approved: z.boolean().default(false)
});
export type Timesheet = z.infer<typeof timesheetSchema>;
