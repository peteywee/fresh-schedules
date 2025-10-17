'use client';

import { useEffect, useMemo, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { DollarSign, SlidersHorizontal } from 'lucide-react';
import { z } from 'zod';
import { computeAllowedBudget, computeAllowedHours, computeForecastSales } from '@/lib/forecast';
import { getCurrentOrgId } from '@/lib/org';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};
function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }

const Schema = z.object({
  lastYearSameDaySales: z.number().min(0),
  recentTrendPct: z.number().min(-100).max(100),
  blendRatio: z.number().min(0).max(1),
  laborPct: z.number().min(0).max(100),
  avgWage: z.number().min(0.01),
});
type FormState = z.infer<typeof Schema>;

export default function ForecastPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [state, setState] = useState<FormState>({ lastYearSameDaySales: 4900, recentTrendPct: 5, blendRatio: 0.5, laborPct: 25, avgWage: 15 });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setOrgId(getCurrentOrgId()); }, []);
  useEffect(() => { (async () => {
    if (!orgId) return;
    const db = getFirestore(app());
    const ref = doc(db, 'orgs', orgId, 'settings', 'defaults');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      setState({
        lastYearSameDaySales: d.lastYearSameDaySales ?? 4900,
        recentTrendPct: d.recentTrendPct ?? 5,
        blendRatio: d.blendRatio ?? 0.5,
        laborPct: d.laborPct ?? 25,
        avgWage: d.avgWage ?? 15,
      });
    }
    setLoaded(true);
  })(); }, [orgId]);

  const forecastSales = useMemo(() => computeForecastSales(state), [state]);
  const allowedDollars = useMemo(() => computeAllowedBudget(forecastSales, state.laborPct), [forecastSales, state.laborPct]);
  const allowedHours = useMemo(() => computeAllowedHours(allowedDollars, state.avgWage), [allowedDollars, state.avgWage]);

  const save = async () => {
    const parsed = Schema.safeParse(state);
    if (!parsed.success) { alert('Please fix invalid inputs.'); return; }
    if (!orgId) return;
    setSaving(true);
    const db = getFirestore(app());
    await setDoc(doc(db, 'orgs', orgId, 'settings', 'defaults'), parsed.data, { merge: true });
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6"><SlidersHorizontal/><h1 className="text-2xl font-semibold">Forecast & Labor Budget</h1></div>
      {!loaded ? (<div className="text-sm text-gray-500">Loading defaults…</div>) : (
        <div className="grid gap-4">
          <fieldset className="border rounded-2xl p-4">
            <legend className="px-2 text-sm font-semibold">Inputs</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="grid gap-1 text-sm"><span>Same-day last year ($)</span>
                <input type="number" className="border rounded-lg px-3 py-2" value={state.lastYearSameDaySales}
                  onChange={(e)=>setState(s=>({...s,lastYearSameDaySales:Number(e.target.value)}))} />
              </label>
              <label className="grid gap-1 text-sm"><span>Recent trend (%)</span>
                <input type="number" className="border rounded-lg px-3 py-2" value={state.recentTrendPct}
                  onChange={(e)=>setState(s=>({...s,recentTrendPct:Number(e.target.value)}))} />
              </label>
              <label className="grid gap-1 text-sm"><span>Blend (trend vs last year)</span>
                <input type="range" min={0} max={1} step={0.05} value={state.blendRatio}
                  onChange={(e)=>setState(s=>({...s,blendRatio:Number(e.target.value)}))} />
                <span className="text-xs opacity-70">{Math.round(state.blendRatio*100)}% trend / {Math.round((1-state.blendRatio)*100)}% last year</span>
              </label>
              <label className="grid gap-1 text-sm"><span>Labor % of sales</span>
                <input type="number" className="border rounded-lg px-3 py-2" value={state.laborPct}
                  onChange={(e)=>setState(s=>({...s,laborPct:Number(e.target.value)}))} />
              </label>
              <label className="grid gap-1 text-sm"><span>Average wage ($/hr)</span>
                <input type="number" className="border rounded-lg px-3 py-2" value={state.avgWage}
                  onChange={(e)=>setState(s=>({...s,avgWage:Number(e.target.value)}))} />
              </label>
            </div>
            <div className="mt-4"><button onClick={save} disabled={saving} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50">{saving?'Saving…':'Save Defaults'}</button></div>
          </fieldset>

          <div className="border rounded-2xl p-4">
            <div className="flex items-center gap-2"><DollarSign/><h2 className="font-semibold">Results</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm">
              <div className="border rounded-xl p-3"><div className="opacity-70">Forecast Sales</div><div className="text-xl font-semibold">${forecastSales.toLocaleString()}</div></div>
              <div className="border rounded-xl p-3"><div className="opacity-70">Allowed Dollars</div><div className="text-xl font-semibold">${allowedDollars.toLocaleString()}</div></div>
              <div className="border rounded-xl p-3"><div className="opacity-70">Allowed Hours</div><div className="text-xl font-semibold">{allowedHours.toLocaleString()} hrs</div></div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Formula: allowed$ = forecastSales × (labor%/100); allowedHours = allowed$ ÷ avgWage.</p>
          </div>
        </div>
      )}
    </div>
  );
}
