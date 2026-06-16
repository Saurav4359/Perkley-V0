import { Suspense } from "react"

import { BrandDashboardSidebar } from "@/components/dashboard/brand-dashboard-sidebar"
import { BrandHero } from "@/components/dashboard/brand-hero"
import { BrandMarketplaceFeed } from "@/components/dashboard/brand-marketplace-feed"
import { BrandOnboardingStatusBanner } from "@/components/dashboard/brand-onboarding-status-banner"
import { BrandProfileCompleteToast } from "@/components/dashboard/brand-profile-complete-toast"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav, MARKETPLACE_LISTINGS } from "@/lib/dashboard/mock-data"

export default function BrandListingsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand")} userName="Saurav">
      <Suspense fallback={null}>
        <BrandProfileCompleteToast />
      </Suspense>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="space-y-6">
          <BrandHero userName="Saurav" />
          <BrandOnboardingStatusBanner />
          <BrandMarketplaceFeed listings={MARKETPLACE_LISTINGS} />
        </div>

        <BrandDashboardSidebar />
      </div>
    </DashboardShell>
  )
}
