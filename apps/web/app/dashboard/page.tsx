import { Suspense } from "react"

import { CampaignFeed } from "@/components/dashboard/campaign-feed"
import { CreatorDashboardSidebar } from "@/components/dashboard/creator-dashboard-sidebar"
import { CreatorHero } from "@/components/dashboard/creator-hero"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { OnboardingStatusBanner } from "@/components/dashboard/onboarding-status-banner"
import { ProfileCompleteToast } from "@/components/dashboard/profile-complete-toast"
import { CREATOR_CAMPAIGNS, getCreatorNav } from "@/lib/dashboard/mock-data"

export default function CreatorDashboardPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard")} userName="Saurav">
      <Suspense fallback={null}>
        <ProfileCompleteToast />
      </Suspense>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_292px] xl:items-start xl:gap-6">
        <div className="space-y-5">
          <CreatorHero userName="Saurav" />
          <OnboardingStatusBanner />
          <CampaignFeed campaigns={CREATOR_CAMPAIGNS} />
        </div>

        <CreatorDashboardSidebar />
      </div>
    </DashboardShell>
  )
}
