import { Router } from 'express';
import { z } from 'zod';
import { createShiftInput } from '@packages/types';

import { getFirestore } from '../firebase';

// Simple in-memory cache for shifts (for demo purposes)
interface CachedShift {
  id: string;
  createdAt: string;
  createdByRole: string;
  orgId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  cachedAt?: number;
}

interface OrgShiftsCache {
  shifts: CachedShift[];
  cachedAt: number;
}

const shiftsCache = new Map<string, CachedShift | OrgShiftsCache>();
// Allow cache TTL to be configured via environment variable, defaulting to 5 minutes
const CACHE_TTL = process.env.SHIFTS_CACHE_TTL_MS
  ? parseInt(process.env.SHIFTS_CACHE_TTL_MS, 10)
  : 5 * 60 * 1000; // 5 minutes

const RoleHeader = z.enum(['admin', 'manager', 'staff']);

type Shift = z.infer<typeof createShiftInput> & {
  id: string;
  createdAt: string;
  createdByRole: string;
};

export function createShiftRouter() {
  const router = Router();

  router.post('/', async (req, res) => {
    const role = RoleHeader.safeParse(req.header('x-role'));
    if (!role.success || (role.data !== 'admin' && role.data !== 'manager')) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const parsed = createShiftInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: parsed.error.flatten() });
    }

    const id = `sh_${Date.now()}`;
    const payload = {
      ...parsed.data,
      id,
      createdAt: new Date().toISOString(),
      createdByRole: role.data,
    };

    // Cache the shift for faster retrieval
    shiftsCache.set(id, { ...payload, cachedAt: Date.now() });
    // Also keep an org-level cache so GET /?orgId=... can return seeded results
    try {
      const orgKey = `shifts:org:${parsed.data.orgId}`;
      const existing = shiftsCache.get(orgKey) || { shifts: [], cachedAt: 0 };
      existing.shifts = existing.shifts || [];
      existing.shifts.push(payload);
      shiftsCache.set(orgKey, { shifts: existing.shifts, cachedAt: Date.now() });
    } catch (err) {
      console.error('Error updating org-level shift cache:', err);
    }

    try {
      const db = await getFirestore();
      await db
        .collection('organizations')
        .doc(parsed.data.orgId)
        .collection('shifts')
        .doc(id)
        .set(payload);

      return res.status(201).json({ ok: true, id, persisted: true });
    } catch (error) {
      console.warn('PLACEHOLDER: Firestore persistence skipped', error);
      return res.status(202).json({ ok: true, id, persisted: false, reason: 'firestore_not_configured' });
    }
  });

  // Add GET route for retrieving shifts with caching
  router.get('/', async (req, res) => {
    const { orgId } = req.query;
    if (!orgId || typeof orgId !== 'string') {
      return res.status(400).json({ ok: false, error: 'orgId required' });
    }
    // Build a cache key for org-level shifts
    const cacheKey = `shifts:org:${orgId}`;
    const cached = shiftsCache.get(cacheKey) as OrgShiftsCache | undefined;

    // Check cache first
    const cacheKey = `org_${orgId}`;
    const cached = shiftsCache.get(cacheKey) as OrgShiftsCache | undefined;
    
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
      return res.json({ ok: true, shifts: cached.shifts, cached: true });
    }

    try {
      const db = await getFirestore();
      const snapshot = await db
        .collection('organizations')
        .doc(orgId)
        .collection('shifts')
        .get();

      const shifts = snapshot.docs.map((doc: any) => doc.data() as CachedShift);
      shiftsCache.set(cacheKey, { shifts, cachedAt: Date.now() });

      return res.json({ ok: true, shifts, cached: false });
    } catch (error) {
      console.warn('Firestore query failed, using cache if available', error);
      if (cached) {
        return res.json({ ok: true, shifts: cached.shifts, cached: true, fallback: true });
      }
      return res.status(500).json({ ok: false, error: 'Failed to retrieve shifts' });
    }
  });

  return router;
}
