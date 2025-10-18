import { memo } from "react";
import { Card } from "@/components/ui/card";
import { ScheduleCalendar } from "../schedule-calendar";
import { HoursChart } from "../hours-chart";
import type { ShiftAssignment } from "../schedule-calendar";

interface ReviewStepProps {
  schedule: { weekOf: string; shifts: ShiftAssignment[] };
}

export const ReviewStep = memo(function ReviewStep({
  schedule
}: ReviewStepProps) {
  return (
    <div className="fs-grid">
      <Card title="Schedule Overview">
        <ScheduleCalendar schedule={schedule} />
      </Card>

      <Card title="Hours Summary">
        <HoursChart schedule={schedule} />
      </Card>
    </div>
  );
});

export default ReviewStep;
