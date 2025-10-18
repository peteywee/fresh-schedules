import { Router } from 'express';
import { createShiftInput, roleEnum } from '@packages/types';
import { getFirestore } from '../firebase';

interface CachedShift {
  id: string;
  createdAt: string;
  createdByRole: string;
  orgId: string;
  [key: string]: any;
  cachedAt?: number;
}

interface OrgShiftsCache {
  shifts: CachedShift[];
  cachedAt: number;
}

class ShiftCache {
  private cache = new Map<string, CachedShift | OrgShiftsCache>();
  private readonly ttl: number;

  constructor() {
    const ttlEnv = Number(process.env.SHIFTS_CACHE_TTL_MS);
    this.ttl = Number.isFinite(ttlEnv) && ttlEnv > 0 ? ttlEnv : 5 * 60 * 1000;
  }

  private getOrgKey(orgId: string): string {
    return `shifts:org:${orgId}`;
  }

  private isOrgCache(value: CachedShift | OrgShiftsCache | undefined): value is OrgShiftsCache {
    return !!value && 'shifts' in value;
  }

  setShift(shift: CachedShift): void {
    this.cache.set(shift.id, { ...shift, cachedAt: Date.now() });
  }

  addToOrgCache(shift: CachedShift): void {
    const orgKey = this.getOrgKey(shift.orgId);
    const existing = this.cache.get(orgKey);
    const shiftWithCache = { ...shift, cachedAt: Date.now() };

    if (this.isOrgCache(existing)) {
      existing.shifts.push(shiftWithCache);
      existing.cachedAt = Date.now();
    } else {
      this.cache.set(orgKey, { shifts: [shiftWithCache], cachedAt: Date.now() });
    }
  }

  getOrgShifts(orgId: string): OrgShiftsCache | null {
    const cached = this.cache.get(this.getOrgKey(orgId));
    if (this.isOrgCache(cached) && Date.now() - cached.cachedAt < this.ttl) {
      return cached;
    }
    return null;
  }

  setOrgShifts(orgId: string, shifts: CachedShift[]): void {
    this.cache.set(this.getOrgKey(orgId), { shifts, cachedAt: Date.now() });
  }

  getStaleOrgShifts(orgId: string): CachedShift[] | null {
    const cached = this.cache.get(this.getOrgKey(orgId));
    return this.isOrgCache(cached) ? cached.shifts : null;
  }
}

export function createShiftRouter() {
  const router = Router();
  const cache = new ShiftCache();

  router.post('/', async (req, res) => {
    const role = roleEnum.safeParse(req.header('x-role'));
    if (!role.success || (role.data !== 'admin' && role.data !== 'manager')) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const parsed = createShiftInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: parsed.error.flatten() });
    }

    const shift: CachedShift = {
      ...parsed.data,
      id: `sh_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdByRole: role.data,
    };

    cache.setShift(shift);
    try {
      cache.addToOrgCache(shift);
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

  return router;
}
