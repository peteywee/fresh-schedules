import { Router } from 'express';
import { createShiftInput, roleEnum } from '@packages/types';
import { getFirestore } from '../firebase';

import { getFirestore } from '../firebase';
import { authenticateFirebaseToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

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

type Shift = z.infer<typeof createShiftInput> & {
  id: string;
  createdAt: string;
  createdByRole: string;
};

export function createShiftRouter() {
  const router = Router();
  const cache = new ShiftCache();

  // Apply authentication middleware to all routes
  router.use(authenticateFirebaseToken);

  // POST /api/shifts - Create a new shift (admin and manager only)
  router.post('/', requireRole('admin', 'manager'), async (req: AuthenticatedRequest, res) => {
    const parsed = createShiftInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: parsed.error.flatten() });
    }

    // Ensure the user can only create shifts for their own organization
    if (req.user?.orgId && parsed.data.orgId !== req.user.orgId) {
      return res.status(403).json({ ok: false, error: 'Cannot create shifts for other organizations' });
    }

    const id = `sh_${Date.now()}`;
    const payload = {
      ...parsed.data,
      id: `sh_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdByRole: req.user!.role!,
      createdBy: req.user!.uid,
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
        .doc(shift.orgId)
        .collection('shifts')
        .doc(shift.id)
        .set(shift);

      return res.status(201).json({ ok: true, id: shift.id, persisted: true });
    } catch (error) {
      console.warn('PLACEHOLDER: Firestore persistence skipped', error);
      return res.status(202).json({ ok: true, id: shift.id, persisted: false, reason: 'firestore_not_configured' });
    }
  });

  router.get('/', async (req, res) => {
    const { orgId } = req.query;
    if (!orgId || typeof orgId !== 'string') {
      return res.status(400).json({ ok: false, error: 'orgId required' });
    }

    const cached = cache.getOrgShifts(orgId);
    if (cached) {
      return res.json({ ok: true, shifts: cached.shifts, cached: true });
    }

    try {
      const db = await getFirestore();
      const snapshot = await db
        .collection('organizations')
        .doc(orgId)
        .collection('shifts')
        .get();

      const shifts: CachedShift[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as CachedShift));

      cache.setOrgShifts(orgId, shifts);
      return res.json({ ok: true, shifts, cached: false });
    } catch (error) {
      console.warn('Firestore query failed, using cache if available', error);
      const staleShifts = cache.getStaleOrgShifts(orgId);
      if (staleShifts) {
        return res.json({ ok: true, shifts: staleShifts, cached: true, fallback: true });
      }
      return res.status(500).json({ ok: false, error: 'Failed to retrieve shifts' });
    }
  });

  // GET /api/shifts - Retrieve shifts for an organization
  router.get('/', async (req: AuthenticatedRequest, res) => {
    const { orgId } = req.query;
    if (!orgId || typeof orgId !== 'string') {
      return res.status(400).json({ ok: false, error: 'orgId required' });
    }

    // Ensure the user can only query shifts for their own organization
    if (req.user?.orgId && orgId !== req.user.orgId) {
      return res.status(403).json({ ok: false, error: 'Cannot query shifts for other organizations' });
    }

    // Build a cache key for org-level shifts
    const cacheKey = `shifts:org:${orgId}`;
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
