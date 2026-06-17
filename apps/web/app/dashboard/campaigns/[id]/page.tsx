import type { Metadata } from "next"

import { CampaignDetailClient } from "@/components/dashboard/campaign-detail-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

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

  return (
    <DashboardShell nav={getCreatorNav(`/dashboard/campaigns/${id}`)} userName="Saurav" variant="detail">
      <CampaignDetailClient campaignId={id} mode="creator" />
    </DashboardShell>
  )
}
