import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type MonthCounts = Record<string, { total: number; open: number }>; // YYYY-MM-DD

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getMonthRange(d: Date): { startISO: string; endISO: string } {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth()+1, 0);
  return { startISO: toISODate(start), endISO: toISODate(end) };
}

export async function fetchMonthCounts(args: {
  orgId: string; startISO: string; endISO: string;
  eventId?: string|null; boothId?: string|null;
}): Promise<MonthCounts> {
  const { orgId, startISO, endISO, eventId, boothId } = args;
  const clauses: any[] = [
    where("orgId", "==", orgId),
    where("dayStr", ">=", startISO),
    where("dayStr", "<=", endISO),
  ];
  if (eventId) clauses.push(where("eventId", "==", eventId));
  if (boothId) clauses.push(where("boothId", "==", boothId));

  const q = query(collectionGroup(db(), "shifts"), ...clauses);
  const snap = await getDocs(q);
  const out: MonthCounts = {};
  snap.forEach((doc) => {
    const d = doc.data();
    const key = d.dayStr as string;
    const isOpen = !d.assignedUid;
    if (!out[key]) out[key] = { total: 0, open: 0 };
    out[key].total += 1;
    if (isOpen) out[key].open += 1;
  });
  return out;
}