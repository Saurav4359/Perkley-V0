"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useOnboardingProgress } from "@/hooks/use-onboarding-progress"
import {
  RECENT_ACTIVITY,
  RECENT_WINNERS,
} from "@/lib/dashboard/mock-data"

const SIDEBAR_STATS = [
  { label: "Live campaigns", value: "48", trend: "12%" },
  { label: "Total earnings", value: "₹1,24,500", trend: "23%" },
] as const

export function CreatorDashboardSidebar() {
  const { canParticipate, requirements } = useOnboardingProgress()

  const steps = canParticipate
    ? [
        { label: "Complete your creator profile", done: true },
        { label: "Join your first bounty or campaign", done: false },
        { label: "Submit work and track earnings", done: false },
      ]
    : requirements.map((item) => ({
        label: item.label,
        done: item.done,
      }))

  return (
    <DashboardSidebar
      stats={[...SIDEBAR_STATS]}
      steps={steps}
      stepsTitle={canParticipate ? "How Perkley works" : "Profile setup"}
      connectedSteps={!canParticipate}
      winners={RECENT_WINNERS}
      activity={RECENT_ACTIVITY}
    />
  )
}
