"use client"

import { useMemo, useState, type ReactNode } from "react"
import { CalendarDays, Circle, Gem, ListFilter, Zap } from "lucide-react"

import { InrIcon } from "@/components/dashboard/inr-icon"
import { ListingCard } from "@/components/dashboard/listing-card"
import { usePublicCampaigns } from "@/hooks/use-campaigns"
import { apiCampaignToFeedItem } from "@/lib/dashboard/campaign-adapter"
import { cn } from "@/lib/utils"

type FeedFilter =
  | "all"
  | "trending"
  | "highest-reward"
  | "new"
  | "bounty"
  | "campaign"

const FILTERS: { id: FeedFilter; label: string; icon?: ReactNode }[] = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending", icon: <Zap className="size-3.5" /> },
  {
    id: "highest-reward",
    label: "Highest Reward",
    icon: <InrIcon className="size-3.5" />,
  },
  { id: "new", label: "New This Week", icon: <CalendarDays className="size-3.5" /> },
  { id: "bounty", label: "Bounties", icon: <Gem className="size-3.5" /> },
  { id: "campaign", label: "Campaigns", icon: <Circle className="size-3.5" /> },
]

export function BrandMarketplaceFeed() {
  const [filter, setFilter] = useState<FeedFilter>("all")
  const { data, isLoading } = usePublicCampaigns()

  const source = useMemo(
    () => (data ? data.map(apiCampaignToFeedItem) : []),
    [data]
  )

  const filtered = useMemo(() => {
    let items = [...source]

    switch (filter) {
      case "trending":
        items = items.filter((item) => item.trending)
        break
      case "highest-reward":
        items.sort((a, b) => (b.rewardSortValue ?? 0) - (a.rewardSortValue ?? 0))
        break
      case "new":
        items = items.filter((item) => item.isNew)
        break
      case "bounty":
        items = items.filter((item) => item.type === "bounty")
        break
      case "campaign":
        items = items.filter((item) => item.type === "campaign")
        break
      default:
        break
    }

    return items
  }, [source, filter])

  return (
    <section id="browse-listings" className="scroll-mt-24 space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Browse listings</h2>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                filter === item.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Filter settings"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <ListFilter className="size-4" />
        </button>
      </div>

      <div className="overflow-hidden rounded-[1.15rem] border border-border/80 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {filtered.map((listing, index) => (
          <div
            key={listing.id}
            className={cn(index > 0 && "border-t border-border/70")}
          >
            <ListingCard
              listing={listing}
              href={`/dashboard/brand/listings/${listing.id}`}
              cta="view"
              divided
            />
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            {isLoading
              ? "Loading listings…"
              : "Nothing here yet — try another filter."}
          </p>
        ) : null}
      </div>
    </section>
  )
}
