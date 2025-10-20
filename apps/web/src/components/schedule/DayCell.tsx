"use client";
import React from "react";

type Props = {
  dateISO: string;
  totalShifts: number;
  openShifts: number;
  isCurrentMonth: boolean;
  onAdd: () => void;
};

export default function DayCell({ dateISO, totalShifts, openShifts, isCurrentMonth, onAdd }: Props) {
  return (
    <div className={"relative border rounded-xl p-2 min-h-28 " + (isCurrentMonth ? "bg-white" : "bg-gray-50 opacity-70")}>
      <div className="text-xs font-semibold">{dateISO.slice(-2)}</div>
      <div className="mt-1 text-[11px] text-gray-600">shifts: {totalShifts}</div>
      <div className="text-[11px] text-gray-600">open: {openShifts}</div>
      <button
        aria-label="Add shift"
        onClick={onAdd}
        className="absolute bottom-2 right-2 h-7 w-7 rounded-full border bg-white hover:bg-gray-50 text-xl leading-none"
        title={`Add shift on ${dateISO}`}
      >+</button>
    </div>
  );
}