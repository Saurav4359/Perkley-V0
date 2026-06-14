"use client"

import { useMemo, useState } from "react"
import { Filter, Users } from "lucide-react"

import {
  CAMPAIGN_CATEGORIES,
  type Campaign,
  type CampaignCategory,
} from "@/lib/dashboard/mock-data"
import { RewardAmount } from "@/components/dashboard/reward-amount"
import { cn } from "@/lib/utils"

function CampaignRow({ campaign }: { campaign: Campaign }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4 transition-colors hover:border-brand/30 hover:bg-card/80 sm:px-5">
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: campaign.accent }}
      >
        {campaign.initials}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
          {campaign.title}
        </h3>
        <p className="truncate text-sm text-muted-foreground">{campaign.brand}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium capitalize text-foreground/80">
            {campaign.type}
          </span>
          <span>Due in {campaign.dueInDays}d</span>
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <Users className="size-3" />
            {campaign.slotsLeft} spots
          </span>
        </div>
      </div>

      <RewardAmount amount={campaign.reward} className="shrink-0 self-center" />
    </article>
  )
}

export function CampaignFeed({ campaigns }: { campaigns: Campaign[] }) {
  const [feedType, setFeedType] = useState<"all" | "bounty" | "campaign">("all")
  const [category, setCategory] = useState<CampaignCategory | "all">("all")

  const filtered = useMemo(() => {
    return campaigns.filter((item) => {
      const typeMatch =
        feedType === "all" ||
        (feedType === "bounty" && item.type === "bounty") ||
        (feedType === "campaign" && item.type === "campaign")
      const categoryMatch = category === "all" || item.category === category
      return typeMatch && categoryMatch
    })
  }, [campaigns, feedType, category])

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Browse campaigns</h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            {(["all", "bounty", "campaign"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFeedType(type)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors sm:text-sm",
                  feedType === type
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "All" : type === "bounty" ? "Bounties" : "Campaigns"}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Filter campaigns"
          >
            <Filter className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CAMPAIGN_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              category === item.id
                ? "border-brand/30 bg-brand-muted text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((campaign) => (
          <CampaignRow key={campaign.id} campaign={campaign} />
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No campaigns match these filters yet.
          </p>
        ) : null}
      </div>
    </section>
  )
}
