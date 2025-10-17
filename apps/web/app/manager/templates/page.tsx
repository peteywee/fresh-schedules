'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { getCurrentOrgId } from '@/lib/org';

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Shift Templates</h1>

      <div className="border rounded-2xl p-4 mb-6">
        <div className="grid gap-2">
          <label className="text-sm">Template Name
            <input className="border rounded-lg px-3 py-2 w-full" value={name} onChange={(e)=>setName(e.target.value)} />
          </label>
          <div className="text-xs text-gray-600">MVP: Edit the sample shifts in code or add UI later.</div>
          <button onClick={addTemplate} className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50">
            <Plus size={16}/> Save Template
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {templates.map(t => (
          <div key={t.id} className="border rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{t.name}</div>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50" onClick={()=>removeTemplate(t.id)}>
                <Trash2 size={16}/> Delete
              </button>
            </div>
            <div className="mt-2 text-xs">
              {t.shifts.map((s, i) => (
                <div key={i} className="opacity-80">Day {s.dayIndex} • {s.roleTag} • {s.start}–{s.end}</div>
              ))}
            </div>
          </div>
        ))}
        {templates.length===0 && <div className="text-sm text-gray-500 text-center border rounded-xl p-8">No templates yet.</div>}
      </div>
    </div>
  );
}
