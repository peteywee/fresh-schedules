// TODO: This file is a temporary workaround to allow the build to pass after the dependency updates.
// The component that uses this mock should be updated to not rely on it, and this file should be deleted.
import type { HoursBreakdown } from '@/components/app/hours-chart';
import type { WeeklySchedule } from '@/components/app/schedule-calendar';

export const sampleSchedule: WeeklySchedule = {
  weekOf: '2024-01-01',
  shifts: [
    { id: '1', day: 'Monday', role: 'Cashier', start: '09:00', end: '17:00', assignee: 'Alice' },
    { id: '2', day: 'Tuesday', role: 'Stocker', start: '10:00', end: '18:00', assignee: 'Bob' },
  ],
};

export const sampleHours: HoursBreakdown[] = [
  { label: 'Alice', hours: 40 },
  { label: 'Bob', hours: 38.5 },
  { label: 'Charlie', hours: 25 },
];