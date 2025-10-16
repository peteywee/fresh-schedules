import { memo } from "react";
import { Card } from "@/components/ui/card";
import { ScheduleCalendar } from "../schedule-calendar";
import type { ShiftAssignment } from "../schedule-calendar";

interface AddShiftsStepProps {
  schedule: { weekOf: string; shifts: ShiftAssignment[] };
  onShiftEdit: (shift: ShiftAssignment) => void;
}

export const AddShiftsStep = memo(function AddShiftsStep({
  schedule,
  onShiftEdit
}: AddShiftsStepProps) {
  return (
    <Card title="Add shifts for the week">
      <ScheduleCalendar schedule={schedule} onShiftEdit={onShiftEdit} editable />
    </Card>
  );
});
