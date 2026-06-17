import type { Metadata } from "next"

import { CampaignDetailClient } from "@/components/dashboard/campaign-detail-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/mock-data"

type BrandListingDetailPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Campaign — Perkley",
  robots: { index: false, follow: false },
}

export default async function BrandListingDetailPage({ params }: BrandListingDetailPageProps) {
  const { id } = await params

  return (
    <DashboardShell
      nav={getBrandNav(`/dashboard/brand/campaigns/${id}`)}
      userName="Saurav"
      variant="detail"
    >
      <CampaignDetailClient
        campaignId={id}
        mode="brand"
        backHref="/dashboard/brand/campaigns"
        backLabel="Back to My Brand"
      />
    </DashboardShell>
  )
}
