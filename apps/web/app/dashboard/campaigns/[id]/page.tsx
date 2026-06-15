import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ListingDetailView } from "@/components/dashboard/listing-detail-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getListingDetail } from "@/lib/dashboard/campaign-details"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

type CreatorListingDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: CreatorListingDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const listing = getListingDetail(id)
  return {
    title: listing ? `${listing.title} — Perkley` : "Listing not found",
    robots: { index: false, follow: false },
  }
}

export default async function CreatorListingDetailPage({
  params,
}: CreatorListingDetailPageProps) {
  const { id } = await params
  const listing = getListingDetail(id)
  if (!listing) notFound()

  return (
    <DashboardShell nav={getCreatorNav(`/dashboard/campaigns/${id}`)} userName="Saurav" variant="detail">
      <ListingDetailView listing={listing} mode="creator" />
    </DashboardShell>
  )
}
