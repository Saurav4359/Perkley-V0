import Link from "next/link"
import { ArrowUpRight, Briefcase, Clock } from "lucide-react"

import { CampaignCountdown } from "@/components/dashboard/campaign-detail/campaign-countdown"
import { DetailSectionLabel } from "@/components/dashboard/campaign-detail/detail-primitives"
import { PrizePoolTimeline } from "@/components/dashboard/campaign-detail/prize-pool-timeline"
import { SubmitListingButton } from "@/components/dashboard/submit-listing-button"
import { buttonVariants } from "@/components/ui/button"
import type { ListingDetail } from "@/lib/dashboard/campaign-details"
import type { Campaign } from "@/lib/dashboard/feed-types"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

type CampaignDetailSidebarProps = {
  listing: ListingDetail
  related: Campaign[]
  mode?: "brand" | "brand-browse" | "creator"
}

function RelatedListing({
  item,
  hrefPrefix,
}: {
  item: Campaign
  hrefPrefix: string
}) {
  const amount =
    item.type === "bounty"
      ? formatInr(item.totalBudget ?? 0)
      : formatInr(item.fixedReward ?? 0)

  return (
    <Link
      href={`${hrefPrefix}/${item.id}`}
      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-3 last:border-b-0"
    >
      <div
        className="flex size-10 items-center justify-center rounded-lg text-xs font-semibold text-white"
        style={{ backgroundColor: item.accent }}
      >
        {item.initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium group-hover:text-brand">{item.title}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{item.type}</p>
      </div>
      <div className="text-right text-sm font-semibold tabular-nums">₹{amount}</div>
    </Link>
  )
}

export function CampaignDetailSidebar({
  listing,
  related,
  mode = "creator",
}: CampaignDetailSidebarProps) {
  const isBounty = listing.type === "bounty"
  const relatedHrefPrefix =
    mode === "creator"
      ? "/dashboard/campaigns"
      : mode === "brand-browse"
        ? "/dashboard/brand/listings"
        : "/dashboard/brand/campaigns"

  const brandPrimaryLabel =
    listing.status === "draft"
      ? "Publish"
      : listing.status === "active"
        ? isBounty
          ? "View leaderboard"
          : "Review submissions"
        : "View results"

  return (
    <aside className="lg:sticky lg:top-16 lg:self-start">
      <section className="border-b border-border bg-card/20 px-4 py-6 sm:px-6 lg:px-8">
        <DetailSectionLabel>{isBounty ? "Prize pool" : "Reward"}</DetailSectionLabel>
        {isBounty ? (
          <PrizePoolTimeline
            className="mt-4"
            totalBudget={listing.totalBudget}
            tiers={listing.prizeTiers}
          />
        ) : (
          <>
            <p className="mt-4 text-3xl font-bold text-foreground">
              ₹{formatInr(listing.fixedReward)}
              <span className="mt-1 block text-base font-medium text-foreground/70">
                per creator
              </span>
            </p>
            <p className="mt-3 text-base text-foreground/75">
              Min {listing.minViewsThreshold.toLocaleString("en-IN")} views to qualify
            </p>
            <p className="text-base text-foreground/75">
              {listing.spotsLeft} of {listing.maxCreators} spots left
            </p>
          </>
        )}
      </section>

      <section className="grid grid-cols-2 border-b border-border">
        <div className="border-r border-border px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-foreground/65">
            <Briefcase className="size-4" />
            <DetailSectionLabel className="text-[10px]">
              {isBounty ? "Competing" : "Submitted"}
            </DetailSectionLabel>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {isBounty ? listing.competingCount : listing.maxCreators - listing.spotsLeft}
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-foreground/65">
            <Clock className="size-4" />
            <DetailSectionLabel className="text-[10px]">Remaining</DetailSectionLabel>
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">
            <CampaignCountdown dueInDays={listing.dueInDays} />
          </p>
        </div>
      </section>

      <section className="space-y-3 border-b border-border px-4 py-6 sm:px-6 lg:px-8">
        {mode === "creator" ? (
          <SubmitListingButton listing={listing} />
        ) : mode === "brand-browse" ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3.5 text-base leading-7 text-foreground/80">
            Reference listing from {listing.brandName}. Brands can browse how others
            structure bounties and campaigns — applying is for creators only.
          </p>
        ) : (
          <button
            type="button"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full rounded-lg bg-brand text-white hover:bg-brand/90"
            )}
          >
            {brandPrimaryLabel}
            <ArrowUpRight className="size-4" />
          </button>
        )}
        {mode === "brand" ? (
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 w-full rounded-lg")}
          >
            Edit listing
          </button>
        ) : null}
      </section>

      <section className="space-y-3 border-b border-border bg-card/10 px-4 py-6 sm:px-6 lg:px-8">
        <DetailSectionLabel>Requirements</DetailSectionLabel>
        <ul className="space-y-2.5 text-base leading-7 text-foreground/90">
          <li>{listing.requiredHashtag}</li>
          <li>{listing.requiredMention}</li>
          <li className="capitalize">{listing.contentType} on Instagram</li>
        </ul>
      </section>

      {related.length > 0 ? (
        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <DetailSectionLabel>Related live listings</DetailSectionLabel>
          <div className="mt-3">
            {related.map((item) => (
              <RelatedListing key={item.id} item={item} hrefPrefix={relatedHrefPrefix} />
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  )
}
