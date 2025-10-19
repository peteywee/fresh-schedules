// apps/web/lib/week.ts
import { getISOWeek, getISOWeekYear, addWeeks, startOfISOWeek, endOfISOWeek, parseISO } from "date-fns";

/** "YYYY-Www" (ISO) */
export function toISOWeekKey(d: Date | string) {
  const date = typeof d === "string" ? parseISO(d) : d;
  const y = getISOWeekYear(date);
  const w = getISOWeek(date);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

/** Previous ISO week key (handles year boundaries correctly) */
export function prevISOWeekKey(weekKey: string) {
  const [yStr, wStr] = weekKey.split("-W");
  const y = parseInt(yStr, 10);
  const w = parseInt(wStr, 10);
  // build a representative date within that ISO week
  const base = startOfISOWeek(isoWeekToDate(y, w));
  return toISOWeekKey(addWeeks(base, -1));
}

/** Next ISO week key */
export function nextISOWeekKey(weekKey: string) {
  const [yStr, wStr] = weekKey.split("-W");
  const y = parseInt(yStr, 10);
  const w = parseInt(wStr, 10);
  const base = startOfISOWeek(isoWeekToDate(y, w));
  return toISOWeekKey(addWeeks(base, 1));
}

/** Representative Date for an ISO week (Mon of that week) */
export function isoWeekToDate(year: number, isoWeek: number) {
  // Jan 4th is always in week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  // back up to Monday
  const week1Monday = startOfISOWeek(jan4);
  // add (isoWeek-1) weeks
  return addWeeks(week1Monday, isoWeek - 1);
}

/** Convenience ranges for fetching */
export function isoWeekRange(weekKey: string) {
  const [yStr, wStr] = weekKey.split("-W");
  const y = parseInt(yStr, 10);
  const w = parseInt(wStr, 10);
  const start = startOfISOWeek(isoWeekToDate(y, w));
  const end = endOfISOWeek(start);
  return { start, end };
}