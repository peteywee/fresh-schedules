'use client';

import { useEffect, useMemo, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { DollarSign, SlidersHorizontal } from 'lucide-react';
import { z } from 'zod';
import { computeAllowedBudget, computeAllowedHours, computeForecastSales } from '@/lib/forecast';
import { getCurrentOrgId } from '@/lib/org';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
    <>
      <PageHeader
        title="Forecast & Labor Budget"
        description="Set your planning inputs to calculate labor budgets."
      />
      {!loaded ? (<div className="text-sm text-muted-foreground">Loading defaults…</div>) : (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><SlidersHorizontal/> Inputs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastYearSales">Same-day last year ($)</Label>
                <Input type="number" id="lastYearSales" value={state.lastYearSameDaySales}
                  onChange={(e)=>setState(s=>({...s,lastYearSameDaySales:Number(e.target.value)}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trend">Recent trend (%)</Label>
                <Input type="number" id="trend" value={state.recentTrendPct}
                  onChange={(e)=>setState(s=>({...s,recentTrendPct:Number(e.target.value)}))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blend">Blend (trend vs last year)</Label>
                <Input type="range" id="blend" min={0} max={1} step={0.05} value={state.blendRatio}
                  onChange={(e)=>setState(s=>({...s,blendRatio:Number(e.target.value)}))} />
                <div className="text-xs text-muted-foreground">{Math.round(state.blendRatio*100)}% trend / {Math.round((1-state.blendRatio)*100)}% last year</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborPct">Labor % of sales</Label>
                <Input type="number" id="laborPct" value={state.laborPct}
                  onChange={(e)=>setState(s=>({...s,laborPct:Number(e.target.value)}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgWage">Average wage ($/hr)</Label>
                <Input type="number" id="avgWage" value={state.avgWage}
                  onChange={(e)=>setState(s=>({...s,avgWage:Number(e.target.value)}))} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={save} disabled={saving}>{saving?'Saving…':'Save Defaults'}</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign/> Results</CardTitle>
              <CardDescription>Your calculated labor budget based on the inputs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border rounded-xl p-3 bg-muted/50"><div className="text-muted-foreground">Forecast Sales</div><div className="text-2xl font-bold">${forecastSales.toLocaleString()}</div></div>
              <div className="border rounded-xl p-3 bg-muted/50"><div className="text-muted-foreground">Allowed Dollars</div><div className="text-2xl font-bold">${allowedDollars.toLocaleString()}</div></div>
              <div className="border rounded-xl p-3 bg-muted/50"><div className="text-muted-foreground">Allowed Hours</div><div className="text-2xl font-bold">{allowedHours.toLocaleString()}</div></div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Formula: allowed$ = forecastSales × (labor%/100); allowedHours = allowed$ ÷ avgWage.</p>
             </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
