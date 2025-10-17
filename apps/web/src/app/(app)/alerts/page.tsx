'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getFirestore, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { Bell, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getCurrentOrgId } from '@/lib/org';
import { PageHeader } from '@/components/page-header';

type AlertDoc = {
  id: string;
  type: 'late_clockout' | 'coverage_gap' | 'system';
  message: string;
  createdAt: any;
  resolved?: boolean;
  resolvedAt?: any;
  severity?: 'low' | 'medium' | 'high';
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }
const tsToDate = (v: any) => v?.toDate?.() ?? (v instanceof Date ? v : new Date(v ?? 0));

export default function AlertsPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(true);

  useEffect(() => { setOrgId(getCurrentOrgId()); }, []);

  useEffect(() => {
    if (!orgId) return;
    const db = getFirestore(app());
    const baseRef = collection(db, 'orgs', orgId, 'alerts');
    const q = query(baseRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as AlertDoc)));
    });
    return () => unsub();
  }, [orgId]);

  const filtered = useMemo(() => alerts.filter(a => (onlyOpen ? !a.resolved : true)), [alerts, onlyOpen]);

  const resolveAlert = async (id: string) => {
    if (!orgId) return;
    const db = getFirestore(app());
    await updateDoc(doc(db, 'orgs', orgId, 'alerts', id), { resolved: true, resolvedAt: new Date() });
  };

  return (
    <>
      <PageHeader title="Alerts">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded-sm" checked={onlyOpen} onChange={(e)=>setOnlyOpen(e.target.checked)} />
          Show only open alerts
        </label>
      </PageHeader>

      <div className="grid gap-3">
        {filtered.map((a) => {
          const when = tsToDate(a.createdAt).toLocaleString();
          const sev = a.severity ?? 'medium';
          const sevClass =
            sev === 'high' ? 'bg-red-100 text-red-800 border-red-300'
            : sev === 'low' ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-amber-100 text-amber-800 border-amber-300';
          return (
            <div key={a.id} className={`border rounded-xl p-4 flex items-start gap-3 ${sevClass}`}>
              <AlertTriangle className="mt-0.5" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm uppercase tracking-wide font-semibold">{a.type.replace('_',' ')}</span>
                  <span className="text-xs opacity-70">• {when}</span>
                  {a.resolved && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-white">Resolved</span>}
                </div>
                <div className="mt-1 text-sm">{a.message}</div>
              </div>
              {!a.resolved && (
                <button onClick={()=>resolveAlert(a.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm">
                  <CheckCircle2 size={16}/> Resolve
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground border rounded-xl p-8 bg-card">No alerts to show.</div>
        )}
      </div>
    </>
  );
}