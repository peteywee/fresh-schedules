import { z } from 'zod';

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
