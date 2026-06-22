import type { Metadata } from "next"

import { CampaignDetailClient } from "@/components/dashboard/campaign-detail-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { QueryHydration } from "@/components/query-hydration"
import { getCreatorNav } from "@/lib/dashboard/navigation"
import { prefetchCampaignDetail } from "@/lib/query/server"

type CreatorListingDetailPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Campaign — Perkley",
  robots: { index: false, follow: false },
}

export default async function CreatorListingDetailPage({
  params,
}: CreatorListingDetailPageProps) {
  const { id } = await params
  const dehydratedState = await prefetchCampaignDetail(id)

  return (
    <DashboardShell nav={getCreatorNav(`/dashboard/campaigns/${id}`)} variant="detail">
      <QueryHydration state={dehydratedState}>
        <CampaignDetailClient campaignId={id} mode="creator" />
      </QueryHydration>
    </DashboardShell>
  )
}
