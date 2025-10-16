/**
 * @fileoverview A multi-step wizard component for creating a weekly schedule.
 * It guides the user through selecting a week, adding shifts, assigning roles, and reviewing the schedule.
 */
"use client";

import { useState } from 'react';
import { Calendar, Users, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScheduleCalendar, type WeeklySchedule, type ShiftAssignment } from './schedule-calendar';
import { HoursChart } from './hours-chart';

/**
 * The type of steps in the schedule creation wizard.
 */
type WizardStep = 'select-week' | 'add-shifts' | 'assign-roles' | 'review';

// Default values used when creating a new shift
const DEFAULT_ROLE: string = 'Staff';
const DEFAULT_START: string = '09:00';
const DEFAULT_END: string = '17:00';
const DEFAULT_ASSIGNEE: string | undefined = undefined;

/**
 * A wizard component that guides the user through the process of creating a schedule.
 * It manages the state of the schedule and the current step in the wizard.
 * @returns {JSX.Element} The rendered schedule wizard component.
 */
export function ScheduleWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-week');
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    weekOf: new Date().toISOString().slice(0, 10),
    shifts: [],
  });

  const steps = [
    { id: 'select-week', title: 'Select Week', icon: Calendar },
    { id: 'add-shifts', title: 'Add Shifts', icon: Users },
    { id: 'assign-roles', title: 'Assign Roles', icon: CheckCircle },
    { id: 'review', title: 'Review & Publish', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

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
   * @param {ShiftAssignment} shift - The shift to be edited or created.
   */
  const handleShiftEdit = (shift: ShiftAssignment) => {
    if (shift.id.includes('new')) {
      const newShift: ShiftAssignment = {
        ...shift,
        id: `${shift.day}-${crypto.randomUUID()}`,
        role: DEFAULT_ROLE,
        start: DEFAULT_START,
        end: DEFAULT_END,
        assignee: DEFAULT_ASSIGNEE,
      };
      setSchedule({ ...schedule, shifts: [...schedule.shifts, newShift] });
    } else {
      // Update the existing shift in the schedule
      setSchedule({
        ...schedule,
        shifts: schedule.shifts.map(s => s.id === shift.id ? { ...s, ...shift } : s),
      });
    }
  };

  /**
   * Renders the content for the current step of the wizard.
   * @returns {JSX.Element | null} The JSX element for the current step, or null.
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 'select-week':
        return (
          <Card title="Choose the week to schedule" icon={Calendar}>
            <p>Select the starting date for your weekly schedule.</p>
            <input
              type="date"
              value={schedule.weekOf}
              onChange={(e) => setSchedule({ ...schedule, weekOf: e.target.value })}
            />
            <ScheduleCalendar schedule={schedule} onShiftEdit={handleShiftEdit} editable />
          </Card>
        );
      case 'add-shifts':
        return (
          <Card title="Add shifts for the week" icon={Users}>
            <ScheduleCalendar schedule={schedule} onShiftEdit={handleShiftEdit} editable />
          </Card>
        );
      case 'assign-roles':
        return (
          <Card title="Assign roles and staff" icon={CheckCircle}>
            <p>Assign specific roles and staff to each shift.</p>
            <ScheduleCalendar schedule={schedule} onShiftEdit={handleShiftEdit} editable />
          </Card>
        );
      case 'review':
        return (
          <div className="fs-grid">
            <Card title="Schedule Overview" icon={Calendar}>
              <ScheduleCalendar schedule={schedule} />
            </Card>
            <Card title="Hours Summary" icon={CheckCircle}>
              <HoursChart schedule={schedule} />
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fs-card">
      <header>
        <h2>Create Your Schedule</h2>
        <div className="wizard-progress">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <div key={step.id} className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <Icon size={20} />
                <span>{step.title}</span>
              </div>
            );
          })}
        </div>
      </header>

      <div className="wizard-content">
        {renderStepContent()}
      </div>

      <footer>
        <Button onClick={prevStep} disabled={currentStepIndex === 0} icon={ArrowLeft} iconPosition="left">
          Back
        </Button>
        <Button onClick={nextStep} disabled={currentStepIndex === steps.length - 1} icon={ArrowRight} iconPosition="right">
          Next
        </Button>
      </footer>
    </div>
  );
}
