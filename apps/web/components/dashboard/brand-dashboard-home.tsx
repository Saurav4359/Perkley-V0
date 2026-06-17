"use client"

import { BrandDashboardSidebar } from "@/components/dashboard/brand-dashboard-sidebar"
import { BrandHero } from "@/components/dashboard/brand-hero"
import { BrandMarketplaceFeed } from "@/components/dashboard/brand-marketplace-feed"
import { BrandOnboardingStatusBanner } from "@/components/dashboard/brand-onboarding-status-banner"
import { BrandProfileCompleteToast } from "@/components/dashboard/brand-profile-complete-toast"
import { useBrandProfile } from "@/hooks/use-profile"

export function BrandDashboardHome() {
  const profile = useBrandProfile()
  const userName = profile.data?.brandName ?? "Brand"

  return (
    <>
      <BrandProfileCompleteToast />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="space-y-6">
          <BrandHero userName={userName} />
          <BrandOnboardingStatusBanner />
          <BrandMarketplaceFeed />
        </div>
        <BrandDashboardSidebar />
      </div>
    </>
  )
}
