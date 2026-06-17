"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useBrandActivity, useBrandStats } from "@/hooks/use-dashboard"
import { useBrandOnboardingProgress } from "@/hooks/use-brand-onboarding-progress"
import { dashboardActivityToSidebar } from "@/lib/dashboard/dashboard-adapter"
import { RECENT_ACTIVITY, RECENT_WINNERS } from "@/lib/dashboard/mock-data"

const FALLBACK_STATS = [
  { label: "Active spend", value: "12.4L" },
  { label: "Pending reviews", value: "9" },
] as const

export function BrandDashboardSidebar() {
  const { canLaunch, requirements } = useBrandOnboardingProgress()
  const statsQuery = useBrandStats()
  const activityQuery = useBrandActivity()

  const stats = statsQuery.data
    ? [
        { label: "Active campaigns", value: String(statsQuery.data.activeCampaigns) },
        { label: "Pending reviews", value: String(statsQuery.data.pendingReviews) },
      ]
    : [...FALLBACK_STATS]

  const activity =
    activityQuery.data && activityQuery.data.length > 0
      ? activityQuery.data.map(dashboardActivityToSidebar)
      : RECENT_ACTIVITY

  const steps = canLaunch
    ? [
        { label: "Set up your brand profile", done: true },
        { label: "Launch your first bounty", done: false },
        { label: "Review submissions and pay winners", done: false },
      ]
    : requirements.map((item) => ({
        label: item.label,
        done: item.done,
      }))

  return (
    <DashboardSidebar
      stats={stats}
      steps={steps}
      stepsTitle={canLaunch ? "How Perkley works" : "Brand verification"}
      connectedSteps={!canLaunch}
      winners={RECENT_WINNERS}
      activity={activity}
      activityHref="/dashboard/brand/notifications"
    />
  )
}
