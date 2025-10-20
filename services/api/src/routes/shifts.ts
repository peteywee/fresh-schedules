import { Router } from 'express';
import { createShiftInput } from '@packages/types';
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

// Maximum number of shifts to cache per organization
const envMaxShifts = Number(process.env.SHIFTS_CACHE_MAX);
const MAX_ORG_SHIFTS = Number.isFinite(envMaxShifts) && envMaxShifts > 0
  ? envMaxShifts
  : 1000;

export function createShiftRouter() {
  const router = Router();

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
      id,
      createdAt: new Date().toISOString(),
      createdByRole: req.user!.role!,
      createdBy: req.user!.uid,
    };

    // Cache the shift for faster retrieval
    shiftsCache.set(id, { ...payload, cachedAt: Date.now() });
    // Also keep an org-level cache so GET /?orgId=... can return seeded results
    try {
      const orgKey = `shifts:org:${parsed.data.orgId}`;
      const existing = shiftsCache.get(orgKey) as OrgShiftsCache | undefined;
      if (existing) {
        // Deduplicate by id
        const idx = existing.shifts.findIndex(s => s.id === payload.id);
        if (idx >= 0) {
          existing.shifts[idx] = payload;
        } else {
          existing.shifts.push(payload);
          // Enforce max size (drop oldest)
          if (existing.shifts.length > MAX_ORG_SHIFTS) {
            existing.shifts.splice(0, existing.shifts.length - MAX_ORG_SHIFTS);
          }
        }
        shiftsCache.set(orgKey, { shifts: existing.shifts, cachedAt: Date.now() });
      } else {
        shiftsCache.set(orgKey, { shifts: [payload], cachedAt: Date.now() });
      }
    } catch (err) {
      console.error('Error updating org-level shift cache:', err);
    }

    try {
      const db = await getFirestore();
      await db
        .collection('organizations')
        .doc(payload.orgId)
        .collection('shifts')
        .doc(payload.id)
        .set(payload);

      return res.status(201).json({ ok: true, id: payload.id, persisted: true });
    } catch (error) {
      console.warn('PLACEHOLDER: Firestore persistence skipped', error);
      return res.status(202).json({ ok: true, id: payload.id, persisted: false, reason: 'firestore_not_configured' });
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

      // Validate the structure of data returned from Firestore before casting
      const shifts: CachedShift[] = snapshot.docs
        .map((doc) => {
          const data = doc.data() as Record<string, unknown>;
          const orgIdFromDoc = typeof data.orgId === 'string' ? data.orgId : orgId;
          if (
            typeof doc.id !== 'string' ||
            typeof orgIdFromDoc !== 'string' ||
            typeof data.createdAt !== 'string' ||
            typeof data.createdByRole !== 'string'
          ) {
            return null;
          }
          return {
            ...data,
            id: doc.id,
            orgId: orgIdFromDoc,
            createdAt: data.createdAt as string,
            createdByRole: data.createdByRole as string,
          } as CachedShift;
        })
        .filter((s): s is CachedShift => s !== null);

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
