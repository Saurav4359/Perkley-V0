"use client"

import { useMemo } from "react"

import { CreatorHero } from "@/components/dashboard/creator-hero"
import { CampaignFeed } from "@/components/dashboard/campaign-feed"
import { CreatorDashboardSidebar } from "@/components/dashboard/creator-dashboard-sidebar"
import { OnboardingStatusBanner } from "@/components/dashboard/onboarding-status-banner"
import { ProfileCompleteToast } from "@/components/dashboard/profile-complete-toast"
import { usePublicCampaigns } from "@/hooks/use-campaigns"
import { useCreatorStats } from "@/hooks/use-dashboard"
import { useCreatorProfile } from "@/hooks/use-profile"
import { formatInrLakhs } from "@/lib/dashboard/utils"

export function CreatorDashboardHome() {
  const profile = useCreatorProfile()
  const stats = useCreatorStats()
  const campaigns = usePublicCampaigns()
  const userName = profile.data?.displayName ?? "Creator"

  const totalRewardLabel = useMemo(() => {
    if (!campaigns.data?.length) return "—"
    const total = campaigns.data.reduce(
      (sum, campaign) => sum + (campaign.totalBudget ?? campaign.fixedReward ?? 0),
      0
    )
    return total > 0 ? formatInrLakhs(total) : "—"
  }, [campaigns.data])

  const socialProof = useMemo(() => {
    const count = stats.data?.openCampaigns ?? campaigns.data?.length ?? 0
    if (count === 0) return "New campaigns launching on Perkley"
    if (count === 1) return "1 live campaign on Perkley right now"
    return `${count} live campaigns on Perkley right now`
  }, [campaigns.data?.length, stats.data?.openCampaigns])

  return (
    <>
      <ProfileCompleteToast />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_292px] xl:items-start xl:gap-6">
        <div className="space-y-5">
          <CreatorHero
            userName={userName}
            totalRewardLabel={totalRewardLabel}
            socialProof={socialProof}
          />
          <OnboardingStatusBanner />
          <CampaignFeed />
        </div>
        <CreatorDashboardSidebar />
      </div>
    </>
  )
}
