/**
 * @fileoverview A component to display a chart of hours worked by each staff member.
 * It can either take pre-calculated hours breakdown or calculate it from a weekly schedule.
 */
import { memo, useMemo } from 'react';
import type { WeeklySchedule } from './schedule-calendar';

/**
 * Represents the data structure for the hours breakdown of a single person.
 * @property {string} label - The name of the person (e.g., staff member's name).
 * @property {number} hours - The total number of hours assigned to this person.
 */
export type HoursBreakdown = {
  label: string;
  hours: number;
};

/**
 * Calculates the total hours for each assignee from a weekly schedule.
 * @param {WeeklySchedule} schedule - The weekly schedule containing shifts with assignees.
 * @returns {HoursBreakdown[]} An array of objects, each containing the assignee's name and their total hours.
 */
function calculateHours(schedule: WeeklySchedule): HoursBreakdown[] {
  const hoursMap: Record<string, number> = {};
  schedule.shifts.forEach((shift) => {
    if (shift.assignee) {
      const start = new Date(`1970-01-01T${shift.start}:00`);
      const end = new Date(`1970-01-01T${shift.end}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      hoursMap[shift.assignee] = (hoursMap[shift.assignee] || 0) + hours;
    }
  });
  return Object.entries(hoursMap).map(([label, hours]) => ({ label, hours }));
}

/**
 * A React component that renders a bar chart showing the distribution of hours.
 * It provides a visual snapshot of staff allocation to help managers avoid over-scheduling.
 *
 * @param {object} props - The component props.
 * @param {HoursBreakdown[]} [props.data] - Pre-calculated hours data to display.
 * @param {WeeklySchedule} [props.schedule] - A weekly schedule to calculate hours data from. If provided, it overrides `data`.
 * @returns {React.ReactElement} The rendered hours chart component.
 */
export const HoursChart = memo(function HoursChart({ data, schedule }: { data?: HoursBreakdown[]; schedule?: WeeklySchedule }): React.ReactElement {
  const computedData = useMemo(() => schedule ? calculateHours(schedule) : data || [], [data, schedule]);
  if (computedData.length === 0) {
    return (
      <section className="fs-card">
        <header style={{ marginBottom: '1.25rem' }}>
          <div className="fs-tag">Manager hours</div>
          <h2 style={{ margin: '0.75rem 0 0' }}>Coverage snapshot</h2>
          <p style={{ color: '#cbd5f5', margin: '0.75rem 0 0' }}>
            No hours assigned yet. Add shifts to see coverage.
          </p>
        </header>
      </section>
    );
  }

  const maxHours = Math.max(...computedData.map((item) => item.hours));

  return (
    <section className="fs-card">
      <header style={{ marginBottom: '1.25rem' }}>
        <div className="fs-tag">Manager hours</div>
        <h2 style={{ margin: '0.75rem 0 0' }}>Coverage snapshot</h2>
        <p style={{ color: '#cbd5f5', margin: '0.75rem 0 0' }}>
          Visual reference to ensure no one is over-allocated before publishing the schedule.
        </p>
      </header>
      <div className="fs-grid" style={{ gap: '1rem' }}>
        {computedData.map((item) => {
          const percentage = maxHours === 0 ? 0 : Math.round((item.hours / maxHours) * 100);
          return (
            <div key={item.label} className="hours-bar">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{item.label}</span>
                <span>{item.hours.toFixed(1)}h</span>
              </div>
              <div className="hours-bar-track">
                <div className="hours-bar-fill" style={{ width: `${percentage}%`, minWidth: '4%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
