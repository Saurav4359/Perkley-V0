import type { Metadata } from "next"

import { CampaignDetailClient } from "@/components/dashboard/campaign-detail-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/mock-data"

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

  return (
    <DashboardShell
      nav={getBrandNav(`/dashboard/brand/listings/${id}`)}
      userName="Saurav"
      variant="detail"
    >
      <CampaignDetailClient
        campaignId={id}
        mode="brand-browse"
        backHref="/dashboard/brand"
        backLabel="Back to listings"
      />
    </DashboardShell>
  )
}
