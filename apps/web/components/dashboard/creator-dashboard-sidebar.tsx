"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useCreatorActivity, useCreatorStats } from "@/hooks/use-dashboard"
import { useOnboardingProgress } from "@/hooks/use-onboarding-progress"
import { dashboardActivityToSidebar } from "@/lib/dashboard/dashboard-adapter"
import {
  RECENT_ACTIVITY,
  RECENT_WINNERS,
} from "@/lib/dashboard/mock-data"
import { formatInr } from "@/lib/dashboard/utils"

const FALLBACK_STATS = [
  { label: "Live campaigns", value: "48", trend: "12%" },
  { label: "Total earnings", value: "₹1,24,500", trend: "23%" },
] as const

export function CreatorDashboardSidebar() {
  const { canParticipate, requirements } = useOnboardingProgress()
  const statsQuery = useCreatorStats()
  const activityQuery = useCreatorActivity()

  const stats = statsQuery.data
    ? [
        { label: "Live campaigns", value: String(statsQuery.data.openCampaigns) },
        {
          label: "Total earnings",
          value: `₹${formatInr(statsQuery.data.estimatedEarningsInr)}`,
        },
      ]
    : [...FALLBACK_STATS]

  const activity =
    activityQuery.data && activityQuery.data.length > 0
      ? activityQuery.data.map(dashboardActivityToSidebar)
      : RECENT_ACTIVITY

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
      stats={stats}
      steps={steps}
      stepsTitle={canParticipate ? "How Perkley works" : "Profile setup"}
      connectedSteps={!canParticipate}
      winners={RECENT_WINNERS}
      activity={activity}
    />
  )
}
