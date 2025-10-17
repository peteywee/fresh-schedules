"use client"
import dynamic from 'next/dynamic'

const ScheduleWizard = dynamic(
  () => import('@/components/app/schedule-wizard').then(mod => mod.ScheduleWizard),
  { ssr: false }
)

export default function SchedulePage() {
  return <ScheduleWizard />;
}
