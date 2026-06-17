"use client"

import { notFound } from "next/navigation"
import { useMemo } from "react"

import { BrandCampaignReview } from "@/components/dashboard/brand-campaign-review"
import { ListingDetailView } from "@/components/dashboard/listing-detail-view"
import { useCampaign, usePublicCampaigns } from "@/hooks/use-campaigns"
import { useCampaignLeaderboard } from "@/hooks/use-leaderboard"
import { apiCampaignToFeedItem, apiCampaignToListingDetail } from "@/lib/dashboard/campaign-adapter"
import { ApiError } from "@/lib/api/client"
import type { LeaderboardEntry } from "@/lib/dashboard/types"

type CampaignDetailClientProps = {
  campaignId: string
  mode?: "brand" | "brand-browse" | "creator"
  backHref?: string
  backLabel?: string
}

export function CampaignDetailClient({
  campaignId,
  mode = "creator",
  backHref,
  backLabel,
}: CampaignDetailClientProps) {
  const { data, isLoading, error } = useCampaign(campaignId)
  const relatedQuery = usePublicCampaigns(
    data ? { type: data.type, niche: data.niche } : {}
  )
  const leaderboardQuery = useCampaignLeaderboard(
    campaignId,
    data?.type === "bounty"
  )

  const relatedListings = useMemo(() => {
    if (!data || !relatedQuery.data) return []
    return relatedQuery.data
      .filter((item) => item.id !== data.id && item.status === "active")
      .slice(0, 3)
      .map(apiCampaignToFeedItem)
  }, [data, relatedQuery.data])

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
        relatedListings={relatedListings}
      />
      {mode === "brand" ? <BrandCampaignReview campaignId={data.id} /> : null}
    </>
  )
}
