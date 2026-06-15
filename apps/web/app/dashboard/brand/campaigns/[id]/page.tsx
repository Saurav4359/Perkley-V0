import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ListingDetailView } from "@/components/dashboard/listing-detail-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getListingDetail } from "@/lib/dashboard/campaign-details"
import { getBrandNav } from "@/lib/dashboard/mock-data"

type BrandListingDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: BrandListingDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const listing = getListingDetail(id)
  return {
    title: listing ? `${listing.title} — Perkley` : "Listing not found",
    robots: { index: false, follow: false },
  }
}

export default async function BrandListingDetailPage({ params }: BrandListingDetailPageProps) {
  const { id } = await params
  const listing = getListingDetail(id)
  if (!listing) notFound()

  return (
    <DashboardShell
      nav={getBrandNav(`/dashboard/brand/campaigns/${id}`)}
      userName="Saurav"
      variant="detail"
    >
      <ListingDetailView
        listing={listing}
        mode="brand"
        backHref="/dashboard/brand/campaigns"
        backLabel="Back to campaigns"
      />
    </DashboardShell>
  )
}
