import { parse, differenceInMinutes, format } from 'date-fns';

export function calculateDuration(start: string, end: string): number {
  const startDate = parse(start, 'HH:mm', new Date());
  const endDate = parse(end, 'HH:mm', new Date());
  
  const minutes = differenceInMinutes(endDate, startDate);
  return Math.round((minutes / 60) * 100) / 100; // Hours with 2 decimals
}

export function formatShiftTime(start: string, end: string): string {
  const startDate = parse(start, 'HH:mm', new Date());
  const endDate = parse(end, 'HH:mm', new Date());
  
  return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
}

export function isOverlapping(
  shift1: { start: string; end: string },
  shift2: { start: string; end: string }
): boolean {
  const s1Start = parse(shift1.start, 'HH:mm', new Date());
  const s1End = parse(shift1.end, 'HH:mm', new Date());
  const s2Start = parse(shift2.start, 'HH:mm', new Date());
  const s2End = parse(shift2.end, 'HH:mm', new Date());
  
  return s1Start < s2End && s2Start < s1End;
}

export function addMinutes(time: string, minutes: number): string {
  const date = parse(time, 'HH:mm', new Date());
  date.setMinutes(date.getMinutes() + minutes);
  return format(date, 'HH:mm');
}
