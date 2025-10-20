"use client";
import React from "react";
import DayCell from "./DayCell";
import NewShiftDialog from "./NewShiftDialog";
import { fetchMonthCounts, getMonthRange, toISODate } from "@/lib/monthQuery";

type Props = {
  monthStart: Date;   // first day of month
  orgId: string;
  filters?: { eventId?: string|null; boothId?: string|null };
};

export default function MonthGrid({ monthStart, orgId, filters }: Props) {
  const [counts, setCounts] = React.useState<Record<string, {total:number;open:number}>>({});
  const [showNew, setShowNew] = React.useState<null | {dateISO:string}>(null);

  React.useEffect(() => {
    const { startISO, endISO } = getMonthRange(monthStart);
    fetchMonthCounts({ orgId, startISO, endISO, ...filters }).then(setCounts);
  }, [monthStart, orgId, filters]);

  // Build display grid: start on Monday
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const startDay = (first.getDay() + 6) % 7; // Monday=0
  const startDate = new Date(first);
  startDate.setDate(first.getDate() - startDay);

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i=0;i<42;i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === monthStart.getMonth() });
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-600 px-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {cells.map((c, idx) => {
          const iso = toISODate(c.date);
          const cts = counts[iso] ?? { total: 0, open: 0 };
          return (
            <DayCell
              key={iso+"-"+idx}
              dateISO={iso}
              totalShifts={cts.total}
              openShifts={cts.open}
              isCurrentMonth={c.inMonth}
              onAdd={() => setShowNew({ dateISO: iso })}
            />
          );
        })}
      </div>
      {showNew && (
        <NewShiftDialog
          dateISO={showNew.dateISO}
          orgId={orgId}
          onClose={() => setShowNew(null)}
          onCreated={() => {
            // refresh counts quickly
            const { startISO, endISO } = getMonthRange(monthStart);
            fetchMonthCounts({ orgId, startISO, endISO, ...filters }).then(setCounts);
          }}
        />
      )}
    </div>
  );
}