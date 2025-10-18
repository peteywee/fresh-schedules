import { memo } from "react";
import { Card } from "@/components/ui/card";
import { ScheduleCalendar } from "../schedule-calendar";
import type { ShiftAssignment } from "../schedule-calendar";

interface SelectWeekStepProps {
  schedule: { weekOf: string; shifts: ShiftAssignment[] };
  onShiftEdit: (shift: ShiftAssignment) => void;
  onWeekChange: (weekOf: string) => void;
}

export const SelectWeekStep = memo(function SelectWeekStep({
  schedule,
  onShiftEdit,
  onWeekChange
}: SelectWeekStepProps) {
  return (
    <Card title="Choose the week to schedule">
      <p>Select the starting date for your weekly schedule.</p>
      <input
        aria-label="Week start"
        type="date"
        value={schedule.weekOf}
        onChange={(e) => onWeekChange(e.target.value)}
      />
      <div className="mt-4">
        <ScheduleCalendar schedule={schedule} onShiftEdit={onShiftEdit} editable />
      </div>
    </Card>
  );
});

export default SelectWeekStep;
