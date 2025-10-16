import { memo } from "react";
import { Card } from "@/components/ui/card";
import { ScheduleCalendar } from "../schedule-calendar";
import type { ShiftAssignment } from "../schedule-calendar";

interface AssignRolesStepProps {
  schedule: { weekOf: string; shifts: ShiftAssignment[] };
  onShiftEdit: (shift: ShiftAssignment) => void;
}

export const AssignRolesStep = memo(function AssignRolesStep({
  schedule,
  onShiftEdit
}: AssignRolesStepProps) {
  return (
    <Card title="Assign roles and staff">
      <p>Assign specific roles and staff to each shift.</p>
      <ScheduleCalendar
        schedule={schedule}
        onShiftEdit={onShiftEdit}
        editable
      />
    </Card>
  );
});
