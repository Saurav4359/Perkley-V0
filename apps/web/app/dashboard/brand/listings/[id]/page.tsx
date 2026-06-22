import type { Metadata } from "next"

import { CampaignDetailClient } from "@/components/dashboard/campaign-detail-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { QueryHydration } from "@/components/query-hydration"
import { getBrandNav } from "@/lib/dashboard/navigation"
import { prefetchCampaignDetail } from "@/lib/query/server"

type BrandMarketplaceListingPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Listing — Perkley",
  robots: { index: false, follow: false },
}

export default async function BrandMarketplaceListingPage({
  params,
}: BrandMarketplaceListingPageProps) {
  const { id } = await params
  const dehydratedState = await prefetchCampaignDetail(id)

  return (
    <DashboardShell
      nav={getBrandNav(`/dashboard/brand/listings/${id}`)}
      variant="detail"
    >
      <QueryHydration state={dehydratedState}>
        <CampaignDetailClient
          campaignId={id}
          mode="brand-browse"
          backHref="/dashboard/brand"
          backLabel="Back to listings"
        />
      </QueryHydration>
    </DashboardShell>
  )
}
