'use client';

import { useEffect, useMemo, useState } from 'react';
import WeekToolbar from './components/WeekToolbar';
import PublishBar from './components/PublishBar';
import { getCurrentOrgId } from '@/lib/org';
import { initializeApp, getApps } from 'firebase/app';
import { collection, getFirestore, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { fmtWeekKey, getWeekStart } from '@/lib/dates';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};
function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }

type Shift = {
  id: string;
  roleTag: string;
  start: string;
  end: string;
  status: 'draft' | 'published' | 'cancelled';
  weekKey: string;
  dayStr: string;
};

export default function SchedulePage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date(), 1));
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => { setOrgId(getCurrentOrgId()); }, []);
  useEffect(() => {
    if (!orgId) return;
    const db = getFirestore(app());
    const wk = fmtWeekKey(weekStart);
    const qRef = query(collection(db, 'orgs', orgId, 'shifts'), where('weekKey','==', wk), orderBy('dayStr'));
    const unsub = onSnapshot(qRef, (snap) => {
      setShifts(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });
    return () => unsub();
  }, [orgId, weekStart]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of shifts) c[s.dayStr] = (c[s.dayStr] ?? 0) + 1;
    return c;
  }, [shifts]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Week Schedule</h1>
        <div className="flex items-center gap-3">
          <PublishBar weekStart={weekStart}/>
          <WeekToolbar weekStart={weekStart}/>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3">
        {Array.from({length:7}).map((_,i) => {
          const d = new Date(weekStart.getTime() + i*24*3600*1000);
          const key = d.toISOString().slice(0,10);
          const dayShifts = shifts.filter(s => s.dayStr === key);
          return (
            <div key={key} className="border rounded-xl p-3">
              <div className="text-sm font-semibold">{d.toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'})}</div>
              <div className="text-xs opacity-60 mb-2">{dayShifts.length} shift(s)</div>
              <div className="grid gap-2">
                {dayShifts.map(s => (
                  <div key={s.id} className="border rounded-lg p-2 text-xs">
                    <div className="font-medium">{s.roleTag}</div>
                    <div className="opacity-70">{s.start}–{s.end}</div>
                    <div className="opacity-60">status: {s.status}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
