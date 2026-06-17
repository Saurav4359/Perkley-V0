"use client"

import { notFound } from "next/navigation"

import { BrandCampaignReview } from "@/components/dashboard/brand-campaign-review"
import { ListingDetailView } from "@/components/dashboard/listing-detail-view"
import { useCampaign } from "@/hooks/use-campaigns"
import { useCampaignLeaderboard } from "@/hooks/use-leaderboard"
import { apiCampaignToListingDetail } from "@/lib/dashboard/campaign-adapter"
import { getListingDetail, type ListingDetail } from "@/lib/dashboard/campaign-details"
import { ApiError } from "@/lib/api/client"
import type { LeaderboardEntry } from "@/lib/dashboard/types"

type CampaignDetailClientProps = {
  campaignId: string
  mode?: "brand" | "brand-browse" | "creator"
  backHref?: string
  backLabel?: string
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function CampaignDetailClient({
  campaignId,
  mode = "creator",
  backHref,
  backLabel,
}: CampaignDetailClientProps) {
  const isUuid = UUID_RE.test(campaignId)

  // Legacy mock ids (e.g. "b1") still resolve from local sample data.
  const mockListing: ListingDetail | undefined = isUuid
    ? undefined
    : getListingDetail(campaignId)

  const { data, isLoading, error } = useCampaign(isUuid ? campaignId : undefined)
  const leaderboardQuery = useCampaignLeaderboard(
    isUuid ? campaignId : undefined,
    data?.type === "bounty"
  )

  if (mockListing) {
    return (
      <ListingDetailView
        listing={mockListing}
        mode={mode}
        backHref={backHref}
        backLabel={backLabel}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="border-t border-border bg-background px-6 py-24 text-center text-sm text-muted-foreground">
        Loading campaign…
      </div>
    )
  }

  if (error instanceof ApiError && error.status === 404) {
    notFound()
  }

  if (!data) {
    return (
      <div className="border-t border-border bg-background px-6 py-24 text-center text-sm text-muted-foreground">
        Couldn&apos;t load this campaign. Please try again.
      </div>
    )
  }

  const listing = apiCampaignToListingDetail(data)
  if (data.type === "bounty" && leaderboardQuery.data) {
    listing.leaderboard = leaderboardQuery.data.entries.map(
      (entry): LeaderboardEntry => ({
        rank: entry.rank,
        creatorId: entry.creatorId,
        creatorName: entry.creatorName,
        creatorInitials: entry.creatorInitials,
        followers: entry.followers,
        views: entry.views,
        likes: entry.likes,
        comments: entry.comments,
        score: entry.score,
        submissionId: entry.submissionId,
      })
    )
  }

  return (
    <>
      <ListingDetailView
        listing={listing}
        mode={mode}
        backHref={backHref}
        backLabel={backLabel}
      />
      {mode === "brand" ? <BrandCampaignReview campaignId={data.id} /> : null}
    </>
  )
}
