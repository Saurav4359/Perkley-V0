"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useBrandOnboardingProgress } from "@/hooks/use-brand-onboarding-progress"
import { RECENT_ACTIVITY, RECENT_WINNERS } from "@/lib/dashboard/mock-data"

const SIDEBAR_STATS = [
  { label: "Active spend", value: "12.4L" },
  { label: "Pending reviews", value: "9" },
] as const

export function BrandDashboardSidebar() {
  const { canLaunch, requirements } = useBrandOnboardingProgress()

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
      stats={[...SIDEBAR_STATS]}
      steps={steps}
      stepsTitle={canLaunch ? "How Perkley works" : "Brand verification"}
      connectedSteps={!canLaunch}
      winners={RECENT_WINNERS}
      activity={RECENT_ACTIVITY}
    />
  )
}
