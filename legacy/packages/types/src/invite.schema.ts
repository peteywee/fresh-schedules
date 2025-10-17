import { z } from 'zod';

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
