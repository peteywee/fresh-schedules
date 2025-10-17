import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  primaryOrgId: z.string().optional(),
  corpIds: z.array(z.string()).optional(),
  createdAt: z.any() // Firestore Timestamp
});

export type User = z.infer<typeof UserSchema>;

export const ShiftSchema = z.object({
  shiftId: z.string(),
  uid: z.string().optional(),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm'),
  roleTag: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled']),
  createdAt: z.any(),
  updatedAt: z.any(),
  createdBy: z.string()
}).refine(
  (data) => {
    const [startHr, startMin] = data.start.split(':').map(Number);
    const [endHr, endMin] = data.end.split(':').map(Number);
    const startMinutes = startHr * 60 + startMin;
    const endMinutes = endHr * 60 + endMin;
    return endMinutes > startMinutes;
  },
  { message: 'End time must be after start time' }
);

export const CreateShiftSchema = ShiftSchema.omit({ 
  shiftId: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Shift = z.infer<typeof ShiftSchema>;
export type CreateShift = z.infer<typeof CreateShiftSchema>;

export const TimesheetSchema = z.object({
  tsId: z.string(),
  uid: z.string(),
  inAt: z.any(), // Firestore Timestamp
  outAt: z.any().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  approved: z.boolean(),
  source: z.enum(['manual', 'auto']),
  createdAt: z.any(),
  updatedAt: z.any()
});

export const ClockInSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional()
});

export type Timesheet = z.infer<typeof TimesheetSchema>;
export type ClockIn = z.infer<typeof ClockInSchema>;

export const OrgEventSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional()
});

export const OrgInfoSchema = z.object({
  dressCode: z.string().optional(),
  parking: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  events: z.array(OrgEventSchema).optional()
});

export type OrgInfo = z.infer<typeof OrgInfoSchema>;
export type OrgEvent = z.infer<typeof OrgEventSchema>;

export const CorpInviteSchema = z.object({
  code: z.string().length(8),
  role: z.enum(['corpManager', 'auditor']),
  maxUses: z.number().int().positive(),
  remaining: z.number().int().min(0),
  createdBy: z.string(),
  createdAt: z.any(),
  expiresAt: z.any().optional()
});

export const OrgInviteSchema = z.object({
  code: z.string().length(8),
  role: z.enum(['admin', 'manager', 'staff']),
  maxUses: z.number().int().positive(),
  remaining: z.number().int().min(0),
  createdBy: z.string(),
  createdAt: z.any(),
  expiresAt: z.any().optional()
});

export const CreateInviteSchema = z.object({
  role: z.string(),
  maxUses: z.number().int().positive(),
  expiresInDays: z.number().int().positive().optional()
});

export type CorpInvite = z.infer<typeof CorpInviteSchema>;
export type OrgInvite = z.infer<typeof OrgInviteSchema>;
export type CreateInvite = z.infer<typeof CreateInviteSchema>;
