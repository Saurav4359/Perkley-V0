"use client"

import { useMemo } from "react"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useBrandActivity, useBrandStats } from "@/hooks/use-dashboard"
import { useBrandOnboardingProgress } from "@/hooks/use-brand-onboarding-progress"
import { dashboardActivityToSidebar } from "@/lib/dashboard/dashboard-adapter"

export function BrandDashboardSidebar() {
  const { canLaunch, requirements } = useBrandOnboardingProgress()
  const statsQuery = useBrandStats()
  const activityQuery = useBrandActivity()

  const stats = useMemo(() => {
    if (!statsQuery.data) return []
    return [
      { label: "Active campaigns", value: String(statsQuery.data.activeCampaigns) },
      { label: "Pending reviews", value: String(statsQuery.data.pendingReviews) },
    ]
  }, [statsQuery.data])

  const activity = useMemo(
    () => activityQuery.data?.map(dashboardActivityToSidebar) ?? [],
    [activityQuery.data]
  )

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
      activity={activity}
      activityHref="/dashboard/brand/notifications"
      isLoading={statsQuery.isLoading || activityQuery.isLoading}
    />
  )
}
