import type { Metadata } from "next"

import { CampaignDetailClient } from "@/components/dashboard/campaign-detail-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { QueryHydration } from "@/components/query-hydration"
import { getBrandNav } from "@/lib/dashboard/navigation"
import { prefetchCampaignDetail } from "@/lib/query/server"

type BrandListingDetailPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Campaign — Perkley",
  robots: { index: false, follow: false },
}

export default async function BrandListingDetailPage({
  params,
}: BrandListingDetailPageProps) {
  const { id } = await params
  const dehydratedState = await prefetchCampaignDetail(id)

  return (
    <DashboardShell
      nav={getBrandNav(`/dashboard/brand/campaigns/${id}`)}
      variant="detail"
    >
      <QueryHydration state={dehydratedState}>
        <CampaignDetailClient
          campaignId={id}
          mode="brand"
          backHref="/dashboard/brand/campaigns"
          backLabel="Back to My Brand"
        />
      </QueryHydration>
    </DashboardShell>
  )
}
