"use client";
import React from "react";
import MonthGrid from "@/components/schedule/MonthGrid";
import { useAuthCtx } from "@/lib/auth/context";

export default function MonthPage() {
  const { orgId, loading } = useAuthCtx();
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  if (loading) return <div className="p-6">Loading…</div>;
  if (!orgId) return <div className="p-6">No organization selected or permissions missing.</div>;

  const prev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1));
  const next = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1));

  const label = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{label}</h1>
        <div className="flex gap-2">
          <a href="/schedule/week" className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50">Week View</a>
          <button onClick={prev} className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50">Prev</button>
          <button onClick={next} className="px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50">Next</button>
        </div>
      </div>
      <MonthGrid monthStart={cursor} orgId={orgId} />
    </div>
  );
}