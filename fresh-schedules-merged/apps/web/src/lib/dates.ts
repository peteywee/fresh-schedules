import { startOfWeek, addDays, format } from 'date-fns';

export function getWeekStart(d: Date, weekStartsOn: 0|1 = 1) {
  return startOfWeek(d, { weekStartsOn });
}

export function fmtWeekKey(d: Date) {
  // Approximate: YYYY-Www by Monday week start
  const year = d.getFullYear();
  const start = getWeekStart(d, 1);
  const first = new Date(year, 0, 1);
  const diff = (+start - +getWeekStart(first, 1)) / (7*24*3600*1000);
  const n = Math.max(1, Math.floor(diff) + 1);
  return `${year}-W${String(n).padStart(2,'0')}`;
}

export function fmtDayStr(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export function dayFromWeek(weekStart: Date, dayIndex: number) {
  return addDays(getWeekStart(weekStart, 1), dayIndex);
}
