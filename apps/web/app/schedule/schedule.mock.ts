import type { WeeklySchedule } from '@/components/app/schedule-calendar';
import type { HoursBreakdown } from '@/components/app/hours-chart';

export const sampleSchedule: WeeklySchedule = {
  weekOf: '2023-10-02', // Monday
  shifts: [
    {
      id: '1',
      day: 'Monday',
      role: 'Manager',
      start: '09:00',
      end: '17:00',
      assignee: 'Alice',
      location: 'Main Floor',
    },
    {
      id: '2',
      day: 'Monday',
      role: 'Bartender',
      start: '18:00',
      end: '02:00',
      assignee: 'Bob',
    },
    {
      id: '3',
      day: 'Tuesday',
      role: 'Server',
      start: '11:00',
      end: '19:00',
      assignee: 'Charlie',
    },
    {
      id: '4',
      day: 'Wednesday',
      role: 'Manager',
      start: '10:00',
      end: '18:00',
      assignee: 'Alice',
    },
    {
      id: '5',
      day: 'Thursday',
      role: 'Bartender',
      start: '16:00',
      end: '00:00',
      assignee: 'Diana',
    },
    {
      id: '6',
      day: 'Friday',
      role: 'Server',
      start: '12:00',
      end: '20:00',
      assignee: 'Eve',
    },
    {
      id: '7',
      day: 'Saturday',
      role: 'Manager',
      start: '08:00',
      end: '16:00',
      assignee: 'Bob',
    },
    {
      id: '8',
      day: 'Sunday',
      role: 'Bartender',
      start: '14:00',
      end: '22:00',
      assignee: 'Charlie',
    },
  ],
};

export const sampleHours: HoursBreakdown[] = [
  { label: 'Alice', hours: 40 },
  { label: 'Bob', hours: 35 },
  { label: 'Charlie', hours: 30 },
  { label: 'Diana', hours: 25 },
  { label: 'Eve', hours: 20 },
];
