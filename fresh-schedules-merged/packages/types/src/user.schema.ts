import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  primaryOrgId: z.string().optional(),
  corpIds: z.array(z.string()).optional(),
  createdAt: z.any() // Firestore Timestamp
});

export type User = z.infer<typeof UserSchema>;
