import { z } from 'zod';

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
