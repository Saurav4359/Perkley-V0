import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { BountyLeaderboard } from "@/components/dashboard/bounty-leaderboard"
import { CampaignDetailBody } from "@/components/dashboard/campaign-detail/campaign-detail-body"
import { CampaignDetailHero } from "@/components/dashboard/campaign-detail/campaign-detail-hero"
import { CampaignDetailSidebar } from "@/components/dashboard/campaign-detail/campaign-detail-sidebar"
import { SubmitPostForm } from "@/components/dashboard/submit-post-form"
import type { ListingDetail } from "@/lib/dashboard/campaign-details"
import { LISTINGS } from "@/lib/dashboard/listings-data"
import { LISTING_TYPE_COPY } from "@/lib/dashboard/types"

type ListingDetailViewProps = {
  listing: ListingDetail
  mode?: "brand" | "creator"
  backHref?: string
  backLabel?: string
}

export function ListingDetailView({
  listing,
  mode = "creator",
  backHref = "/dashboard",
  backLabel = "Back to listings",
}: ListingDetailViewProps) {
  const related = LISTINGS.filter(
    (item) => item.id !== listing.id && item.status === "active" && item.type === listing.type
  ).slice(0, 3)

  const prizeTiersForBoard =
    listing.type === "bounty"
      ? [
          { rank: 1, amount: listing.prizeStructure.first },
          { rank: 2, amount: listing.prizeStructure.second },
          { rank: 3, amount: listing.prizeStructure.third },
        ]
      : undefined

  return (
    <div className="border-t border-border bg-background">
      <div className="border-b border-border px-4 py-3 sm:px-6 lg:px-10">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {backLabel}
        </Link>
      </div>

      <CampaignDetailHero listing={listing} tagline={LISTING_TYPE_COPY[listing.type]} />

      <div className="grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="border-b border-border lg:border-b-0 lg:border-r">
          <CampaignDetailSidebar listing={listing} related={related} mode={mode} />
        </div>
        <div className="min-w-0">
          <CampaignDetailBody sections={listing.sections} />
          {listing.type === "bounty" ? (
            <div className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
              <BountyLeaderboard
                entries={listing.leaderboard}
                isLive={listing.status === "active"}
                prizeTiers={prizeTiersForBoard}
              />
            </div>
          ) : null}
          {mode === "creator" && listing.status === "active" ? (
            <div className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
              <SubmitPostForm listing={listing} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
