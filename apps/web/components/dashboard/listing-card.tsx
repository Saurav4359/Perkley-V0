import Link from "next/link"
import { ArrowRight, BadgeCheck, Flame } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import type { BrandCampaign, Campaign } from "@/lib/dashboard/feed-types"
import { LISTING_TYPE_COPY } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type ListingCardProps = {
  listing: Campaign | BrandCampaign
  href: string
  className?: string
  divided?: boolean
  /** Creators can apply; brands browsing the marketplace only view details. */
  cta?: "apply" | "view" | "manage"
}

export function ListingCard({
  listing,
  href,
  className,
  divided,
  cta = "apply",
}: ListingCardProps) {
  const isBounty = listing.type === "bounty"
  const showApply = cta === "apply" && !isBounty
  const actionLabel = cta === "manage" ? "Manage" : "View details"
  const visibleAvatars = listing.joinedAvatars?.slice(0, 4) ?? []
  const joinedExtra =
    listing.joinedTotal != null
      ? Math.max(0, listing.joinedTotal - visibleAvatars.length)
      : 0

  return (
    <article
      className={cn(
        divided
          ? "bg-card px-5 py-2.5 transition-colors hover:bg-muted/15"
          : "rounded-2xl border border-border/80 bg-card px-5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: listing.accent }}
        >
          {listing.initials}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1">
            <p className="truncate text-xs text-muted-foreground">{listing.brand}</p>
            {listing.verified ? (
              <BadgeCheck className="size-3.5 shrink-0 text-sky-500" aria-label="Verified brand" />
            ) : null}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold leading-tight text-foreground sm:text-[15px]">
              {listing.title}
            </h3>
            {listing.trending ? (
              <span className="hidden shrink-0 items-center gap-0.5 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 sm:inline-flex">
                <Flame className="size-3" />
                Trending
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-medium capitalize",
                isBounty ? "bg-brand-muted text-brand" : "bg-muted text-foreground/75"
              )}
            >
              {listing.type}
            </span>
            <span>{listing.dueInDays > 0 ? `Due in ${listing.dueInDays}d` : "Closed"}</span>
            <span>{listing.tagline}</span>
          </div>

          <p className="hidden truncate text-[11px] text-foreground/55 sm:block">
            {LISTING_TYPE_COPY[listing.type]}
          </p>
        </div>

        <div className="hidden w-[6.75rem] shrink-0 text-right sm:block">
          <p className="text-base font-bold tabular-nums leading-none text-foreground lg:text-lg">
            ₹{listing.reward}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {isBounty ? "Total reward" : "Per creator"}
          </p>
        </div>

        <div className="hidden w-[8.75rem] shrink-0 flex-col items-end gap-2 md:flex">
          {isBounty && listing.fillPercent != null ? (
            <div className="w-full space-y-1">
              <p className="text-right text-[10px] font-medium text-foreground/75">
                {listing.fillPercent}% filled
              </p>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${listing.fillPercent}%` }}
                />
              </div>
              {listing.filledCount != null && listing.maxCompetitors ? (
                <p className="text-right text-[10px] text-muted-foreground">
                  {listing.filledCount} / {listing.maxCompetitors} creators
                </p>
              ) : null}
            </div>
          ) : visibleAvatars.length ? (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {visibleAvatars.map((initials) => (
                  <span
                    key={initials}
                    className="flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[8px] font-semibold text-foreground/70"
                  >
                    {initials}
                  </span>
                ))}
              </div>
              {joinedExtra > 0 ? (
                <span className="text-[10px] font-medium text-muted-foreground">+{joinedExtra}</span>
              ) : null}
            </div>
          ) : null}

          {showApply ? (
            <Link
              href={href}
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-8 rounded-full bg-foreground px-3.5 text-xs text-background hover:bg-foreground/90"
              )}
            >
              Apply now
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <Link
              href={href}
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium hover:underline",
                cta === "manage" ? "text-foreground" : "text-brand"
              )}
            >
              {actionLabel}
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        <div className="ml-auto shrink-0 md:hidden">
          {showApply ? (
            <Link
              href={href}
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-8 rounded-full bg-foreground px-3 text-xs text-background"
              )}
            >
              Apply
            </Link>
          ) : (
            <Link
              href={href}
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                cta === "manage" ? "text-foreground" : "text-brand"
              )}
            >
              {cta === "manage" ? "Manage" : "View"}
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
