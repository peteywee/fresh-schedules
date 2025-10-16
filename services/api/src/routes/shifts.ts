import { Router } from 'express';
import { z } from 'zod';
import { createShiftInput } from '@packages/types';

import { getFirestore } from '../firebase';

const RoleHeader = z.enum(['admin', 'manager', 'staff']);

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

  return router;
}
