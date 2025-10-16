import { useReducer } from 'react';
import type { WeeklySchedule, ShiftAssignment } from '@/components/app/schedule-calendar';

type WizardStep = "select-week" | "add-shifts" | "assign-roles" | "review";

interface ScheduleState {
  currentStep: WizardStep;
  schedule: WeeklySchedule;
  editingShift: ShiftAssignment | null;
}

type ScheduleAction =
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'UPDATE_SCHEDULE'; payload: Partial<WeeklySchedule> }
  | { type: 'ADD_SHIFT'; payload: ShiftAssignment }
  | { type: 'UPDATE_SHIFT'; payload: ShiftAssignment }
  | { type: 'SET_EDITING_SHIFT'; payload: ShiftAssignment | null };

const initialState: ScheduleState = {
  currentStep: "select-week",
  schedule: {
    weekOf: new Date().toISOString().slice(0, 10),
    shifts: [],
  },
  editingShift: null,
};

function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_SCHEDULE':
      return { ...state, schedule: { ...state.schedule, ...action.payload } };
    case 'ADD_SHIFT':
      return {
        ...state,
        schedule: { ...state.schedule, shifts: [...state.schedule.shifts, action.payload] },
      };
    case 'UPDATE_SHIFT':
      return {
        ...state,
        schedule: {
          ...state.schedule,
          shifts: state.schedule.shifts.map((shift) =>
            shift.id === action.payload.id ? action.payload : shift
          ),
        },
      };
    case 'SET_EDITING_SHIFT':
      return { ...state, editingShift: action.payload };
    default:
      return state;
  }
}

export function useScheduleState() {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  const nextStep = () => {
    const steps: WizardStep[] = ["select-week", "add-shifts", "assign-roles", "review"];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex < steps.length - 1) {
      dispatch({ type: 'SET_STEP', payload: steps[currentIndex + 1] });
    }
  };

  const prevStep = () => {
    const steps: WizardStep[] = ["select-week", "add-shifts", "assign-roles", "review"];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: steps[currentIndex - 1] });
    }
  };

  return {
    state,
    dispatch,
    nextStep,
    prevStep,
  };
}
