"use client";

import { useState } from 'react';
import { Calendar, Users, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScheduleCalendar, type WeeklySchedule, type ShiftAssignment } from './schedule-calendar';
import { HoursChart } from './hours-chart';

type WizardStep = 'select-week' | 'add-shifts' | 'assign-roles' | 'review';

export function ScheduleWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-week');
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    weekOf: '2023-10-02',
    shifts: [],
  });

  const steps = [
    { id: 'select-week', title: 'Select Week', icon: Calendar },
    { id: 'add-shifts', title: 'Add Shifts', icon: Users },
    { id: 'assign-roles', title: 'Assign Roles', icon: CheckCircle },
    { id: 'review', title: 'Review & Publish', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id as WizardStep);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id as WizardStep);
    }
  };

  const handleShiftEdit = (shift: ShiftAssignment) => {
    if (shift.id.includes('new')) {
      const newShift: ShiftAssignment = {
        ...shift,
        id: `${shift.day}-${Date.now()}`,
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
              className="fs-input"
            />
          </Card>
        );
      case 'add-shifts':
        return (
          <Card title="Add shifts for the week" icon={Users}>
            <p>Click on time slots to add shifts. This step takes about 2 minutes.</p>
            <ScheduleCalendar schedule={schedule} onShiftEdit={handleShiftEdit} editable />
          </Card>
        );
      case 'assign-roles':
        return (
          <Card title="Assign roles and staff" icon={CheckCircle}>
            <p>Assign specific roles and staff to each shift.</p>
            <ScheduleCalendar schedule={schedule} />
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
