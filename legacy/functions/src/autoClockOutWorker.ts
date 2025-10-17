import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { addMinutes, isAfter, parse } from 'date-fns';

const GRACE_MINUTES = Number(process.env.AUTO_CLOCKOUT_GRACE_MINUTES ?? '25');

type Timesheet = {
  uid: string;
  inAt: admin.firestore.Timestamp;
  outAt?: admin.firestore.Timestamp | null;
  shiftId?: string | null;
  source?: 'manual' | 'auto';
};

type Shift = {
  day: admin.firestore.Timestamp;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

function parseShiftEnd(shift: Shift): Date {
  const base = shift.day.toDate();
  return parse(shift.end, 'HH:mm', base);
}

export const autoClockOutWorker = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const db = admin.firestore();
    const orgsSnap = await db.collection('orgs').get();

    let batched = db.batch();
    let n = 0;

    for (const org of orgsSnap.docs) {
      const orgId = org.id;
      const tsRef = db.collection('orgs').doc(orgId).collection('timesheets');
      const open = await tsRef.where('outAt', '==', null).limit(500).get();
      if (open.empty) continue;

      for (const tsDoc of open.docs) {
        const ts = tsDoc.data() as Timesheet;
        if (!ts.shiftId) continue;
        const shiftSnap = await db.collection('orgs').doc(orgId).collection('shifts').doc(ts.shiftId).get();
        if (!shiftSnap.exists) continue;
        const shift = shiftSnap.data() as Shift;

        const scheduledEnd = parseShiftEnd(shift);
        const cutoff = addMinutes(scheduledEnd, GRACE_MINUTES);
        if (isAfter(new Date(), cutoff)) {
          batched.update(tsDoc.ref, {
            outAt: admin.firestore.Timestamp.fromDate(cutoff),
            source: 'auto',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          const alertRef = db.collection('orgs').doc(orgId).collection('alerts').doc();
          batched.set(alertRef, {
            type: 'late_clockout',
            message: `Auto clock-out applied for uid=${ts.uid} (shift ${ts.shiftId}).`,
            severity: 'medium',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            resolved: false,
          });
          n++;
          if (n % 400 === 0) { await batched.commit(); batched = db.batch(); }
        }
      }
    }
    if (n % 400 !== 0) await batched.commit();
    console.log(`autoClockOutWorker: updated ${n} timesheets`);
    return null;
  });
