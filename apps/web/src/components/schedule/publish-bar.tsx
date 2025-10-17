'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getWeek, publishWeek, unpublishWeek, WeekDoc } from '@/lib/week';
import { fmtWeekKey } from '@/lib/dates';
import { getCurrentOrgId } from '@/lib/org';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};
function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }

export default function PublishBar({ weekStart }: { weekStart: Date }) {
  const [orgId] = useState<string | null>(getCurrentOrgId());
  const [week, setWeek] = useState<WeekDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const weekKey = fmtWeekKey(weekStart);

  useEffect(() => {
    const auth = getAuth(app());
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      if (!orgId) { setLoading(false); return; }
      setLoading(true);
      const w = await getWeek(orgId, weekKey);
      setWeek(w ?? { status: 'draft' });
      setLoading(false);
    })();
  }, [orgId, weekKey]);

  const doPublish = async () => {
    if (!orgId) return;
    setLoading(true);
    // Optionally pipe allowed$ and allowedHours snapshot here if you compute them in view state
    await publishWeek(orgId, weekKey);
    const w = await getWeek(orgId, weekKey);
    setWeek(w ?? { status: 'draft' });
    setLoading(false);
  };

  const doUnpublish = async () => {
    if (!orgId) return;
    setLoading(true);
    await unpublishWeek(orgId, weekKey);
    const w = await getWeek(orgId, weekKey);
    setWeek(w ?? { status: 'draft' });
    setLoading(false);
  };

  const status = week?.status ?? 'draft';

  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full border ${
        status === 'published' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-amber-100 border-amber-300 text-amber-800'
      }`}>
        {status === 'published' ? <CheckCircle2 size={14}/> : <Circle size={14}/>}
        {status === 'published' ? 'Published' : 'Draft'}
      </span>

      {loading ? (
        <span className="inline-flex items-center gap-2 text-sm opacity-70">
          <Loader2 className="animate-spin" size={16}/> Loading…
        </span>
      ) : status === 'published' ? (
        <button onClick={doUnpublish} className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50">
          Unpublish week
        </button>
      ) : (
        <button onClick={doPublish} className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50">
          Publish week
        </button>
      )}
    </div>
  );
}
