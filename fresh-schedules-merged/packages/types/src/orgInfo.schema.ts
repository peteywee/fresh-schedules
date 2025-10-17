import { z } from 'zod';

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
