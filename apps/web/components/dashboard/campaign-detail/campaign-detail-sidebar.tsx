import Link from "next/link"
import { ArrowUpRight, Briefcase, Clock } from "lucide-react"

import { CampaignCountdown } from "@/components/dashboard/campaign-detail/campaign-countdown"
import { DetailSectionLabel } from "@/components/dashboard/campaign-detail/detail-primitives"
import { InrIcon } from "@/components/dashboard/inr-icon"
import { buttonVariants } from "@/components/ui/button"
import type { ListingDetail } from "@/lib/dashboard/campaign-details"
import type { Listing } from "@/lib/dashboard/types"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

type CampaignDetailSidebarProps = {
  listing: ListingDetail
  related: Listing[]
  mode?: "brand" | "creator"
}

function RelatedListing({
  item,
  hrefPrefix,
}: {
  item: Listing
  hrefPrefix: string
}) {
  const amount =
    item.type === "bounty" ? formatInr(item.totalBudget) : formatInr(item.fixedReward)

  return (
    <Link
      href={`${hrefPrefix}/${item.id}`}
      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-3 last:border-b-0"
    >
      <div
        className="flex size-10 items-center justify-center rounded-lg text-xs font-semibold text-white"
        style={{ backgroundColor: item.brandAccent }}
      >
        {item.brandInitials}
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
    mode === "creator" ? "/dashboard/campaigns" : "/dashboard/brand/campaigns"

  const primaryLabel =
    mode === "creator"
      ? "Submit now"
      : listing.status === "draft"
        ? "Publish"
        : listing.status === "active"
          ? isBounty
            ? "View leaderboard"
            : "Review submissions"
          : "View results"

  return (
    <aside className="lg:sticky lg:top-16 lg:self-start">
      <section className="border-b border-border px-4 py-6 sm:px-6 lg:px-8">
        <DetailSectionLabel>{isBounty ? "Prize pool" : "Reward"}</DetailSectionLabel>
        {isBounty ? (
          <>
            <div className="mt-4 flex items-center gap-1.5">
              <InrIcon className="size-5" />
              <span className="text-2xl font-bold tabular-nums text-foreground">
                {formatInr(listing.totalBudget)}
              </span>
            </div>
            <ol className="mt-6 space-y-4">
              {listing.prizeTiers.map((tier, index) => (
                <li key={tier.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{tier.label}</span>
                  <span className="font-semibold tabular-nums">₹{tier.amount}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <p className="mt-4 text-2xl font-bold text-foreground">
              ₹{formatInr(listing.fixedReward)}
              <span className="block text-sm font-medium text-muted-foreground">per creator</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Min {listing.minViewsThreshold.toLocaleString("en-IN")} views to qualify
            </p>
            <p className="text-sm text-muted-foreground">
              {listing.spotsLeft} of {listing.maxCreators} spots left
            </p>
          </>
        )}
      </section>

      <section className="grid grid-cols-2 border-b border-border">
        <div className="border-r border-border px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="size-3.5" />
            <DetailSectionLabel className="text-[9px]">
              {isBounty ? "Competing" : "Submitted"}
            </DetailSectionLabel>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {isBounty ? listing.competingCount : listing.maxCreators - listing.spotsLeft}
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5" />
            <DetailSectionLabel className="text-[9px]">Remaining</DetailSectionLabel>
          </div>
          <p className="mt-2 text-lg font-semibold tabular-nums">
            <CampaignCountdown dueInDays={listing.dueInDays} />
          </p>
        </div>
      </section>

      <section className="space-y-3 border-b border-border px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full rounded-lg bg-brand text-white hover:bg-brand/90"
          )}
        >
          {primaryLabel}
          <ArrowUpRight className="size-4" />
        </button>
        {mode === "brand" ? (
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 w-full rounded-lg")}
          >
            Edit listing
          </button>
        ) : null}
      </section>

      <section className="space-y-2 border-b border-border px-4 py-6 sm:px-6 lg:px-8 text-sm">
        <DetailSectionLabel>Requirements</DetailSectionLabel>
        <p>{listing.requiredHashtag}</p>
        <p>{listing.requiredMention}</p>
        <p className="capitalize">{listing.contentType} on Instagram</p>
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
