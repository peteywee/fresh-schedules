import type { ReactNode } from 'react';

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

export type WeeklySchedule = {
  weekOf: string; // ISO date string (Monday)
  shifts: ShiftAssignment[];
};

const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to get localized short weekday name
function getLocalizedDayAbbreviation(day: string, locale: string = navigator.language) {
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

function formatRange(start: string, end: string) {
  return `${start} – ${end}`;
}

export function ScheduleCalendar({ 
  schedule, 
  onShiftEdit,
  editable = false 
}: { 
  schedule: WeeklySchedule; 
  onShiftEdit?: (shift: ShiftAssignment) => void;
  editable?: boolean;
}) {
  const grouped = orderedDays.map((day) => ({
    day,
    slots: schedule.shifts.filter((shift) => shift.day === day),
  }));

  const handleSlotClick = (slot: ShiftAssignment) => {
    if (editable && onShiftEdit) {
      onShiftEdit(slot);
    }
  };

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
}
