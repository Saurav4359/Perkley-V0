"use client"

import { useMemo } from "react"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useCreatorActivity, useCreatorStats } from "@/hooks/use-dashboard"
import { useCreatorProfile } from "@/hooks/use-profile"
import { useOnboardingProgress } from "@/hooks/use-onboarding-progress"
import { dashboardActivityToSidebar } from "@/lib/dashboard/dashboard-adapter"
import { formatInr } from "@/lib/dashboard/utils"

export function CreatorDashboardSidebar() {
  const { canParticipate, requirements } = useOnboardingProgress()
  const profileQuery = useCreatorProfile()
  const statsQuery = useCreatorStats()
  const activityQuery = useCreatorActivity()

  const stats = useMemo(() => {
    if (!statsQuery.data) return []
    return [
      { label: "Live campaigns", value: String(statsQuery.data.openCampaigns) },
      {
        label: "Total earnings",
        value: `₹${formatInr(statsQuery.data.estimatedEarningsInr)}`,
      },
    ]
  }, [statsQuery.data])

  const activity = useMemo(
    () => activityQuery.data?.map(dashboardActivityToSidebar) ?? [],
    [activityQuery.data]
  )

  const steps = canParticipate
    ? [
        {
          label: "Complete your creator profile",
          done:
            canParticipate || (profileQuery.data?.completion ?? 0) >= 80,
        },
        {
          label: "Join your first bounty or campaign",
          done:
            (statsQuery.data?.acceptedApplications ?? 0) > 0 ||
            (statsQuery.data?.applications ?? 0) > 0,
        },
        {
          label: "Submit work and track earnings",
          done: (statsQuery.data?.submissions ?? 0) > 0,
        },
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
      activity={activity}
      isLoading={statsQuery.isLoading || activityQuery.isLoading}
    />
  )
}
