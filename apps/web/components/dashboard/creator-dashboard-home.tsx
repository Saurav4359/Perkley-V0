"use client"

import { CreatorHero } from "@/components/dashboard/creator-hero"
import { CampaignFeed } from "@/components/dashboard/campaign-feed"
import { CreatorDashboardSidebar } from "@/components/dashboard/creator-dashboard-sidebar"
import { OnboardingStatusBanner } from "@/components/dashboard/onboarding-status-banner"
import { ProfileCompleteToast } from "@/components/dashboard/profile-complete-toast"
import { useCreatorProfile } from "@/hooks/use-profile"

export function CreatorDashboardHome() {
  const profile = useCreatorProfile()
  const userName = profile.data?.displayName ?? "Creator"

  return (
    <>
      <ProfileCompleteToast />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_292px] xl:items-start xl:gap-6">
        <div className="space-y-5">
          <CreatorHero userName={userName} />
          <OnboardingStatusBanner />
          <CampaignFeed />
        </div>
        <CreatorDashboardSidebar />
      </div>
    </>
  )
}
