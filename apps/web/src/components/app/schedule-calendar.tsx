/**
 * @fileoverview A component for displaying a weekly schedule calendar.
 * It organizes shifts by day and allows for editing if enabled.
 */
import type { ReactNode } from 'react';
import { memo, useMemo, useCallback } from 'react';

/**
 * Represents a single shift assignment in the schedule.
 * @property {string} id - A unique identifier for the shift.
 * @property {string} day - The day of the week for the shift (e.g., "Monday").
 * @property {string} role - The role required for the shift (e.g., "Bartender").
 * @property {string} start - The start time of the shift (e.g., "09:00").
 * @property {string} end - The end time of the shift (e.g., "17:00").
 * @property {string} [assignee] - The name of the person assigned to the shift.
 * @property {string} [location] - The location of the shift.
 * @property {ReactNode} [notes] - Any additional notes for the shift.
 */
export type ShiftAssignment = {
  id: string;
  day: string; // Monday ... Sunday
  role: string;
  start: string; // ISO time string or HH:mm
  end: string;
  assignee?: string;
  location?: string;
  notes?: ReactNode;
};

/**
 * Represents a full weekly schedule.
 * @property {string} weekOf - The starting date of the week, typically a Monday in ISO date format.
 * @property {ShiftAssignment[]} shifts - An array of shift assignments for the week.
 */
export type WeeklySchedule = {
  weekOf: string; // ISO date string (Monday)
  shifts: ShiftAssignment[];
};

const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Gets a localized short weekday name.
 * For example, "Monday" becomes "Mon".
 * @param {string} day - The full name of the day (e.g., "Monday").
 * @param {string} [locale=navigator.language] - The locale to use for formatting.
 * @returns {string} The abbreviated day name.
 */
function getLocalizedDayAbbreviation(day: string, locale: string = typeof navigator !== 'undefined' ? navigator.language : 'en-US'): string {
  // Find the next date that matches the given day name
  const baseDate = new Date(Date.UTC(2024, 0, 1)); // Monday, Jan 1, 2024
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = daysOfWeek.indexOf(day);
  if (dayIndex === -1) return day.slice(0, 3);
  // Adjust baseDate to the correct day
  const date = new Date(baseDate);
  date.setUTCDate(baseDate.getUTCDate() + ((dayIndex + 7 - baseDate.getUTCDay()) % 7));
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
}

/**
 * Formats a time range string.
 * @param {string} start - The start time.
 * @param {string} end - The end time.
 * @returns {string} The formatted time range (e.g., "09:00 – 17:00").
 */
function formatRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

/**
 * A React component that displays a weekly schedule in a calendar grid format.
 * Shifts are grouped by day, and each shift can be clicked to trigger an edit action.
 *
 * @param {object} props - The component props.
 * @param {WeeklySchedule} props.schedule - The schedule data to display.
 * @param {(shift: ShiftAssignment) => void} [props.onShiftEdit] - Callback function when a shift is clicked for editing.
 * @param {boolean} [props.editable=false] - If true, allows shifts to be edited.
 * @returns {JSX.Element} The rendered schedule calendar component.
 */
export const ScheduleCalendar = memo(function ScheduleCalendar({
  schedule,
  onShiftEdit,
  editable = false
}: {
  schedule: WeeklySchedule;
  onShiftEdit?: (shift: ShiftAssignment) => void;
  editable?: boolean;
}): React.ReactElement {
  const grouped = useMemo(() => orderedDays.map((day) => ({
    day,
    slots: schedule.shifts.filter((shift) => shift.day === day),
  })), [schedule.shifts]);

  const handleSlotClick = useCallback((slot: ShiftAssignment) => {
    if (editable && onShiftEdit) {
      onShiftEdit(slot);
    }
  }, [editable, onShiftEdit]);

  return (
    <section className="fs-card">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
        <div>
          <div className="fs-tag">Week of {schedule.weekOf}</div>
          <h2 style={{ marginTop: '0.75rem', marginBottom: 0 }}>Weekly coverage</h2>
        </div>
      </header>

      <div className="schedule-grid">
        {grouped.map(({ day, slots }) => (
          <div key={day} className="schedule-column">
            <h3>{getLocalizedDayAbbreviation(day)}</h3>
            {slots.length === 0 ? (
              <button
                type="button"
                className="schedule-slot"
                style={{ opacity: 0.6, cursor: editable ? 'pointer' : 'default' }}
                onClick={() => editable && onShiftEdit?.({ id: `${day}-new`, day, role: '', start: '', end: '' })}
              >
                <small>Add shift</small>
              </button>
            ) : (
              slots.map((slot) => (
                <div
                  key={slot.id}
                  className="schedule-slot"
                  onClick={() => handleSlotClick(slot)}
                  style={{ cursor: editable ? 'pointer' : 'default' }}
                >
                  <strong>{slot.role}</strong>
                  <small>{formatRange(slot.start, slot.end)}</small>
                  {slot.assignee && <small>Assigned: {slot.assignee}</small>}
                  {slot.location && <small>Location: {slot.location}</small>}
                  {slot.notes}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </section>
  );
});
