"use client";

import { useCallback, memo, useMemo, lazy, Suspense } from "react";
import { Calendar, Users, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ScheduleCalendar,
  type WeeklySchedule,
  type ShiftAssignment,
} from "./schedule-calendar";
import { HoursChart } from "./hours-chart";
import { useScheduleState } from "@/hooks/useScheduleState";

// Lazy load step components for better performance
const SelectWeekStep = lazy(() => import("./wizard-steps/select-week-step").then(module => ({ default: module.SelectWeekStep })));
const AddShiftsStep = lazy(() => import("./wizard-steps/add-shifts-step").then(module => ({ default: module.AddShiftsStep })));
const AssignRolesStep = lazy(() => import("./wizard-steps/assign-roles-step").then(module => ({ default: module.AssignRolesStep })));
const ReviewStep = lazy(() => import("./wizard-steps/review-step").then(module => ({ default: module.ReviewStep })));

/**
 * The type of steps in the schedule creation wizard.
 */
type WizardStep = "select-week" | "add-shifts" | "assign-roles" | "review";

// Default values used when creating a new shift
const DEFAULT_ROLE = "Staff";
const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";
const DEFAULT_ASSIGNEE: string | undefined = undefined;

/**
 * A wizard component that guides the user through the process of creating a schedule.
 * It manages the state of the schedule and the current step in the wizard.
 */
export const ScheduleWizard = memo(function ScheduleWizard(): React.ReactElement {
  const { state, dispatch, nextStep, prevStep } = useScheduleState();
  const { currentStep, schedule, editingShift } = state;

  const steps = [
    { id: "select-week", title: "Select Week", icon: Calendar },
    { id: "add-shifts", title: "Add Shifts", icon: Users },
    { id: "assign-roles", title: "Assign Roles", icon: CheckCircle },
    { id: "review", title: "Review & Publish", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  /**
   * Handles editing or creating a shift.
   * If the shift ID contains 'new', it creates a new shift with default values.
   * Otherwise, it updates the existing shift.
   */
  const handleShiftEdit = useCallback((shift: ShiftAssignment) => {
    const isNew = typeof shift.id === "string" && shift.id.includes("new");
    if (isNew) {
      const newShift: ShiftAssignment = {
        ...shift,
        id: `${shift.day}-${Date.now()}`,
        role: shift.role || DEFAULT_ROLE,
        start: shift.start || DEFAULT_START,
        end: shift.end || DEFAULT_END,
        assignee: shift.assignee || DEFAULT_ASSIGNEE,
      };
      dispatch({ type: 'ADD_SHIFT', payload: newShift });
    } else {
      dispatch({ type: 'UPDATE_SHIFT', payload: shift });
    }
  }, [dispatch]);

  /**
   * Opens assignment UI for a shift (modal or inline form).
   * Currently stores the editing shift in state; implement UI as needed.
   */
  const handleShiftAssign = useCallback((shift: ShiftAssignment) => {
    dispatch({ type: 'SET_EDITING_SHIFT', payload: shift });
    // TODO: open modal or inline form to assign role/assignee; after assignment, call handleShiftEdit(updatedShift)
    // For now, this is a placeholder to indicate the intent.
    console.debug("Opening assign UI for shift:", shift);
  }, [dispatch]);

  /**
   * Renders the content for the current step of the wizard.
   */
  const renderStepContent = useMemo((): React.ReactElement | null => {
    switch (currentStep) {
      case "select-week":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <SelectWeekStep
              schedule={schedule}
              onShiftEdit={handleShiftEdit}
              onWeekChange={(weekOf) => dispatch({ type: 'UPDATE_SCHEDULE', payload: { weekOf } })}
            />
          </Suspense>
        );

      case "add-shifts":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <AddShiftsStep
              schedule={schedule}
              onShiftEdit={handleShiftEdit}
            />
          </Suspense>
        );

      case "assign-roles":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <AssignRolesStep
              schedule={schedule}
              onShiftEdit={handleShiftAssign}
            />
          </Suspense>
        );

      case "review":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ReviewStep schedule={schedule} />
          </Suspense>
        );

      default:
        return null;
    }
  }, [currentStep, schedule, handleShiftEdit, handleShiftAssign, dispatch]);

  return (
    <div className="fs-card" role="region" aria-label="Schedule wizard">
      <header>
        <h2>Create Your Schedule</h2>
        <div className="wizard-progress" role="tablist" aria-label="Wizard steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <div
                key={step.id}
                role="tab"
                aria-selected={isActive}
                className={`wizard-step ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
                onClick={() => dispatch({ type: 'SET_STEP', payload: step.id as WizardStep })}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    dispatch({ type: 'SET_STEP', payload: step.id as WizardStep });
                  }
                }}
              >
                <Icon size={20} />
                <span>{step.title}</span>
              </div>
            );
          })}
        </div>
      </header>

      <div className="wizard-content">{renderStepContent}</div>

      <footer className="wizard-footer">
        <Button
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          aria-disabled={currentStepIndex === 0}
          icon={ArrowLeft}
        >
          Back
        </Button>

        <Button
          onClick={nextStep}
          disabled={currentStepIndex === steps.length - 1}
          aria-disabled={currentStepIndex === steps.length - 1}
          icon={ArrowRight}
        >
          Next
        </Button>
      </footer>
    </div>
  );
});
