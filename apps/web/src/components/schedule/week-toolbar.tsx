'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Timestamp, query, where } from 'firebase/firestore';
import { CalendarPlus, Copy } from 'lucide-react';
import { useState } from 'react';
import { dayFromWeek, fmtDayStr, fmtWeekKey, getWeekStart } from '@/lib/dates';
import { getCurrentOrgId } from '@/lib/org';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};
function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }

type TemplateShift = {
  roleTag: string;
  dayIndex: number; // 0-6 (Mon=0)
  start: string;    // "HH:mm"
  end: string;      // "HH:mm"
};

export default function WeekToolbar({ weekStart }: { weekStart: Date }) {
  const [orgId] = useState<string | null>(getCurrentOrgId());
  const [busy, setBusy] = useState(false);

  const applyTemplate = async () => {
    if (!orgId) return alert('No org selected.');
    setBusy(true);
    const db = getFirestore(app());
    const tSnap = await getDocs(collection(db, 'orgs', orgId, 'shiftTemplates'));
    if (tSnap.empty) { setBusy(false); alert('No templates found. Create one first.'); return; }
    const tpl = tSnap.docs[0].data() as { name: string; shifts: TemplateShift[] };
    const wk = fmtWeekKey(weekStart);

    for (const s of tpl.shifts) {
      const day = dayFromWeek(weekStart, s.dayIndex);
      await addDoc(collection(db, 'orgs', orgId, 'shifts'), {
        day,
        dayStr: fmtDayStr(day),
        weekKey: wk,
        start: s.start,
        end: s.end,
        roleTag: s.roleTag,
        status: 'draft',
        createdAt: Timestamp.now(),
      });
    }
    setBusy(false);
  };

  const copyLastWeek = async () => {
    if (!orgId) return alert('No org selected.');
    setBusy(true);
    const db = getFirestore(app());
    const lastWeekStart = getWeekStart(new Date(weekStart.getTime() - 7*24*3600*1000), 1);
    const lastKey = fmtWeekKey(lastWeekStart);
    const curKey = fmtWeekKey(weekStart);

    const qSnap = await getDocs(query(collection(db, 'orgs', orgId, 'shifts'), where('weekKey','==', lastKey)));
    if (qSnap.empty) { setBusy(false); alert('No shifts found for last week.'); return; }

    for (const d of qSnap.docs) {
      const s = d.data() as any;
      const oldDay = s.day?.toDate?.() ?? new Date(s.day);
      const newDay = new Date(oldDay.getTime() + 7*24*3600*1000);
      await addDoc(collection(db, 'orgs', orgId, 'shifts'), {
        roleTag: s.roleTag,
        start: s.start,
        end: s.end,
        status: 'draft',
        day: newDay,
        dayStr: fmtDayStr(newDay),
        weekKey: curKey,
        createdAt: Timestamp.now(),
      });
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={applyTemplate} disabled={busy}
        className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-sm" title="Apply first template">
        <CalendarPlus size={16}/> {busy ? 'Applying…' : 'Apply Template'}
      </button>
      <button onClick={copyLastWeek} disabled={busy}
        className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-sm" title="Copy last week">
        <Copy size={16}/> {busy ? 'Copying…' : 'Copy Last Week'}
      </button>
    </div>
  );
}
