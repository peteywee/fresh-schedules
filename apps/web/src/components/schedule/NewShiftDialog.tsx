"use client";
import React from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  dateISO: string;
  orgId: string;
  defaultRoleTag?: string;
  defaultStart?: string; // "HH:mm"
  defaultEnd?: string;   // "HH:mm"
  eventId?: string|null;
  boothId?: string|null;
  onClose: () => void;
  onCreated: (shiftId: string) => void;
};

import { toISOWeekKey } from "@/lib/week";

export default function NewShiftDialog(props: Props) {
  const [roleTag, setRoleTag] = React.useState(props.defaultRoleTag ?? "Front");
  const [start, setStart] = React.useState(props.defaultStart ?? "09:00");
  const [end, setEnd] = React.useState(props.defaultEnd ?? "17:00");
  const [busy, setBusy] = React.useState(false);
  const weekKey = toISOWeekKey(props.dateISO);

  const submit = async () => {
    setBusy(true);
    try {
      const ref = await addDoc(collection(db(), "orgs", props.orgId, "shifts"), {
        orgId: props.orgId,
        dayStr: props.dateISO,
        weekKey,
        start, end, roleTag,
        status: "draft",
        eventId: props.eventId ?? null,
        boothId: props.boothId ?? null,
        createdAt: serverTimestamp()
      });
      props.onCreated(ref.id);
    } finally {
      setBusy(false);
      props.onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[360px]">
        <h3 className="text-lg font-semibold mb-3">New shift on {props.dateISO}</h3>
        <label className="text-sm block mb-2">Role
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={roleTag} onChange={e=>setRoleTag(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm block mb-2">Start
            <input type="time" className="mt-1 w-full border rounded-lg px-3 py-2" value={start} onChange={e=>setStart(e.target.value)} />
          </label>
          <label className="text-sm block mb-2">End
            <input type="time" className="mt-1 w-full border rounded-lg px-3 py-2" value={end} onChange={e=>setEnd(e.target.value)} />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={props.onClose} className="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={busy} className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            {busy ? "Saving…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}