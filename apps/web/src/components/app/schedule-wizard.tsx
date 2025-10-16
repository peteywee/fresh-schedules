"use client";

import { useState } from "react";
import { Calendar, Users, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ScheduleCalendar,
  type WeeklySchedule,
  type ShiftAssignment,
} from "./schedule-calendar";
import { HoursChart } from "./hours-chart";

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
export function ScheduleWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<WizardStep>("select-week");
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    weekOf: new Date().toISOString().slice(0, 10),
    shifts: [],
  });

  // transient state for assigning/editing a specific shift (placeholder for modal/form)
  const [editingShift, setEditingShift] = useState<ShiftAssignment | null>(null);

  const steps = [
    { id: "select-week", title: "Select Week", icon: Calendar },
    { id: "add-shifts", title: "Add Shifts", icon: Users },
    { id: "assign-roles", title: "Assign Roles", icon: CheckCircle },
    { id: "review", title: "Review & Publish", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  /**
   * Navigates to the next step in the wizard.
   */
  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id as WizardStep);
    }
  };

  /**
   * Navigates to the previous step in the wizard.
   */
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id as WizardStep);
    }
  };

  /**
   * Handles editing or creating a shift.
   * If the shift ID contains 'new', it creates a new shift with default values.
   * Otherwise, it updates the existing shift.
   */
  const handleShiftEdit = (shift: ShiftAssignment) => {
    const isNew = typeof shift.id === "string" && shift.id.includes("new");
    if (isNew) {
      const newShift: ShiftAssignment = {
        ...shift,
        id: `${shift.day}-${Date.now()}`,
        role: 'New Role',
        start: '09:00',
        end: '17:00',
        assignee: 'Unassigned',
      };
      setSchedule((prev) => ({ ...prev, shifts: [...prev.shifts, newShift] }));
    } else {
      setSchedule((prev) => ({
        ...prev,
        shifts: prev.shifts.map((s) => (s.id === shift.id ? { ...s, ...shift } : s)),
      }));
    }
  };

  /**
   * Opens assignment UI for a shift (modal or inline form).
   * Currently stores the editing shift in state; implement UI as needed.
   */
  const handleShiftAssign = (shift: ShiftAssignment) => {
    setEditingShift(shift);
    // TODO: open modal or inline form to assign role/assignee; after assignment, call handleShiftEdit(updatedShift)
    // For now, this is a placeholder to indicate the intent.
    console.debug("Opening assign UI for shift:", shift);
  };

  /**
   * Renders the content for the current step of the wizard.
   */
  const renderStepContent = (): JSX.Element | null => {
    switch (currentStep) {
      case "select-week":
        return (
          <Card>
            <header className="card-header">
              <Calendar size={18} />
              <h3>Choose the week to schedule</h3>
            </header>
            <div className="card-body">
              <p>Select the starting date for your weekly schedule.</p>
              <input
                aria-label="Week start"
                type="date"
                value={schedule.weekOf}
                onChange={(e) => setSchedule({ ...schedule, weekOf: e.target.value })}
              />
              <div className="mt-4">
                <ScheduleCalendar schedule={schedule} onShiftEdit={handleShiftEdit} editable />
              </div>
            </div>
          </Card>
        );

      case "add-shifts":
        return (
          <Card>
            <header className="card-header">
              <Users size={18} />
              <h3>Add shifts for the week</h3>
            </header>
            <div className="card-body">
              <ScheduleCalendar schedule={schedule} onShiftEdit={handleShiftEdit} editable />
            </div>
          </Card>
        );

      case "assign-roles":
        return (
          <Card>
            <header className="card-header">
              <CheckCircle size={18} />
              <h3>Assign roles and staff</h3>
            </header>
            <div className="card-body">
              <p>Assign specific roles and staff to each shift.</p>
              <ScheduleCalendar
                schedule={schedule}
                onShiftEdit={handleShiftAssign}
                editable
              />
            </div>
          </Card>
        );

      case "review":
        return (
          <div className="fs-grid">
            <Card>
              <header className="card-header">
                <Calendar size={18} />
                <h3>Schedule Overview</h3>
              </header>
              <div className="card-body">
                <ScheduleCalendar schedule={schedule} />
              </div>
            </Card>

            <Card>
              <header className="card-header">
                <CheckCircle size={18} />
                <h3>Hours Summary</h3>
              </header>
              <div className="card-body">
                <HoursChart schedule={schedule} />
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

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
                onClick={() => setCurrentStep(step.id as WizardStep)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setCurrentStep(step.id as WizardStep);
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

      <div className="wizard-content">{renderStepContent()}</div>

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
}
