"use client"

import { useMemo, useState } from "react"
import { Filter } from "lucide-react"

import { ListingCard } from "@/components/dashboard/listing-card"
import { useMyCampaigns } from "@/hooks/use-campaigns"
import { apiCampaignToBrandItem } from "@/lib/dashboard/campaign-adapter"
import {
  CAMPAIGN_CATEGORIES,
  type BrandCampaign,
  type CampaignCategory,
} from "@/lib/dashboard/mock-data"
import { cn } from "@/lib/utils"

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "reviewing", label: "Reviewing" },
  { id: "draft", label: "Draft" },
  { id: "ended", label: "Ended" },
] as const

const glassControlClass =
  "border-white/45 bg-white/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_10px_30px_rgba(15,23,42,0.055)] ring-1 ring-black/[0.02] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.16] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.18)] dark:ring-white/[0.025]"

const activeGlassControlClass =
  "border-white/60 bg-white/55 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_28px_rgba(15,23,42,0.10)] ring-1 ring-black/[0.04] backdrop-blur-xl dark:border-white/20 dark:bg-white/15 dark:text-foreground dark:ring-white/[0.04]"

type BrandCampaignListProps = {
  /** Fallback campaigns shown while the brand's live listings load. */
  campaigns?: BrandCampaign[]
}

export function BrandCampaignList({ campaigns = [] }: BrandCampaignListProps) {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["id"]>("all")
  const [feedType, setFeedType] = useState<"all" | "bounty" | "campaign">("all")
  const [niche, setNiche] = useState<CampaignCategory | "all">("all")
  const { data, isLoading } = useMyCampaigns()

  const source = useMemo(
    () => (data ? data.map(apiCampaignToBrandItem) : campaigns),
    [data, campaigns]
  )

  const filtered = useMemo(() => {
    return source.filter((item) => {
      const statusMatch = status === "all" || item.status === status
      const typeMatch =
        feedType === "all" ||
        (feedType === "bounty" && item.type === "bounty") ||
        (feedType === "campaign" && item.type === "campaign")
      const nicheMatch = niche === "all" || item.niche === niche
      return statusMatch && typeMatch && nicheMatch
    })
  }, [source, status, feedType, niche])

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/45 bg-white/[0.16] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_16px_52px_rgba(15,23,42,0.065)] ring-1 ring-black/[0.02] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.12] dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_16px_52px_rgba(0,0,0,0.22)] dark:ring-white/[0.025]">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatus(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,box-shadow,color] sm:text-sm",
                  status === item.id
                    ? activeGlassControlClass
                    : cn(
                        glassControlClass,
                        "text-muted-foreground hover:border-white/60 hover:bg-white/[0.30] hover:text-foreground"
                      )
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

        <div className="flex items-center gap-2">
          <div className={cn("inline-flex rounded-full border p-1", glassControlClass)}>
            {(["all", "bounty", "campaign"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFeedType(type)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-[background-color,box-shadow,color] sm:text-sm",
                  feedType === type
                    ? "bg-white/50 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_6px_18px_rgba(15,23,42,0.07)] dark:bg-white/[0.12]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "All types" : type === "bounty" ? "Bounties" : "Campaigns"}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-[background-color,border-color,box-shadow,color] hover:border-white/60 hover:bg-white/[0.30] hover:text-foreground",
              glassControlClass
            )}
            aria-label="Filter campaigns"
          >
            <Filter className="size-4" />
          </button>
        </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CAMPAIGN_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setNiche(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,box-shadow,color] sm:text-sm",
              niche === item.id
                ? "border-white/60 bg-white/45 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.035] backdrop-blur-xl dark:border-white/20 dark:bg-white/[0.12] dark:ring-white/[0.04]"
                : cn(glassControlClass, "text-muted-foreground hover:border-white/60 hover:bg-white/[0.30] hover:text-foreground")
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((campaign) => (
          <ListingCard
            key={campaign.id}
            listing={campaign}
            href={`/dashboard/brand/campaigns/${campaign.id}`}
            cta="manage"
            className="border-white/45 bg-white/[0.20] shadow-[inset_0_1px_0_rgba(255,255,255,0.64),0_14px_46px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.02] backdrop-blur-xl transition-[background-color,border-color,box-shadow,transform] supports-[backdrop-filter]:bg-white/[0.14] hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/[0.28] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.74),0_18px_54px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_46px_rgba(0,0,0,0.22)] dark:ring-white/[0.025] dark:hover:bg-white/[0.07]"
          />
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/45 bg-white/[0.18] px-4 py-10 text-center text-sm text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.60),0_12px_36px_rgba(15,23,42,0.055)] ring-1 ring-black/[0.02] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.12] dark:border-white/10 dark:bg-white/[0.04] dark:ring-white/[0.025]">
            {isLoading
              ? "Loading your listings…"
              : "No listings match these filters yet."}
          </p>
        ) : null}
      </div>
    </section>
  )
}
