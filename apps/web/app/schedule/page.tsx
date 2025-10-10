import { HoursChart, type HoursBreakdown } from '@/components/app/hours-chart';
import { ScheduleCalendar, type WeeklySchedule } from '@/components/app/schedule-calendar';

import { sampleSchedule, sampleHours } from './schedule.mock';

export const metadata = { title: 'Schedule · Fresh Schedules' };

export default function SchedulePage() {
  return (
    <div className="fs-grid" style={{ gap: '2rem' }}>
      <ScheduleCalendar schedule={sampleSchedule} />
      <HoursChart data={sampleHours} />
    </div>
  );
}
