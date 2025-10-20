export const FLAGS = {
  DEFAULT_VIEW: process.env.NEXT_PUBLIC_DEFAULT_VIEW ?? "month",
  EVENTS_ENABLED: (process.env.NEXT_PUBLIC_EVENTS_ENABLED ?? "true") === "true",
  ATTENDANCE_ENABLED: (process.env.NEXT_PUBLIC_ATTENDANCE_ENABLED ?? "true") === "true",
  SCHEDULE_WIZARD_ENABLED: (process.env.NEXT_PUBLIC_SCHEDULE_WIZARD_ENABLED ?? "false") === "true",
};