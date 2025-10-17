'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { getCurrentOrgId } from '@/lib/org';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};
function app() { return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig); }

type TemplateShift = { roleTag: string; dayIndex: number; start: string; end: string; };
type Template = { id: string; name: string; shifts: TemplateShift[]; };

export default function TemplatesPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [name, setName] = useState('Default Template');
  const [shifts, setShifts] = useState<TemplateShift[]>([
    { roleTag: 'Front', dayIndex: 0, start: '09:00', end: '17:00' },
    { roleTag: 'Back',  dayIndex: 0, start: '10:00', end: '18:00' },
  ]);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => { setOrgId(getCurrentOrgId()); }, []);
  useEffect(() => { (async () => {
    if (!orgId) return;
    const db = getFirestore(app());
    const snap = await getDocs(collection(db, 'orgs', orgId, 'shiftTemplates'));
    setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
  })(); }, [orgId]);

  const addTemplate = async () => {
    if (!orgId) return;
    const db = getFirestore(app());
    const ref = await addDoc(collection(db, 'orgs', orgId, 'shiftTemplates'), { name, shifts });
    setTemplates(t => [...t, { id: ref.id, name, shifts }]);
  };

  const removeTemplate = async (id: string) => {
    if (!orgId) return;
    const db = getFirestore(app());
    await deleteDoc(doc(db, 'orgs', orgId, 'shiftTemplates', id));
    setTemplates(t => t.filter(x => x.id !== id));
  };

  return (
    <>
      <PageHeader
        title="Shift Templates"
        description="Create and manage reusable shift templates to speed up scheduling."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input id="template-name" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">MVP: Edit the sample shifts in code or add UI later to manage shifts within a template.</p>
            <Button onClick={addTemplate} className="mt-2 w-fit">
              <Plus size={16} className="mr-2"/> Save Template
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {templates.map(t => (
          <Card key={t.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t.name}</div>
                <Button variant="outline" size="icon" onClick={()=>removeTemplate(t.id)}>
                  <Trash2 size={16}/>
                  <span className="sr-only">Delete Template</span>
                </Button>
              </div>
              <div className="mt-2 text-xs space-y-1">
                {t.shifts.map((s, i) => (
                  <div key={i} className="text-muted-foreground">Day {s.dayIndex} • {s.roleTag} • {s.start}–{s.end}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length===0 && <div className="text-sm text-center text-muted-foreground border rounded-xl p-8 bg-card">No templates yet. Create one to get started.</div>}
      </div>
    </>
  );
}
