"use client"

import { useMemo } from "react"

import { BrandCampaignList } from "@/components/dashboard/brand-campaign-list"
import { useMyCampaigns } from "@/hooks/use-campaigns"
import { useBrandStats } from "@/hooks/use-dashboard"
import { apiCampaignToBrandItem } from "@/lib/dashboard/campaign-adapter"
import { formatInr } from "@/lib/dashboard/utils"

export function BrandCampaignsStats() {
  const statsQuery = useBrandStats()
  const campaignsQuery = useMyCampaigns()

  const campaigns = useMemo(
    () => campaignsQuery.data?.map(apiCampaignToBrandItem) ?? [],
    [campaignsQuery.data]
  )

  const stats = statsQuery.data
  const liveCount = campaigns.filter((c) => c.status === "live").length
  const reviewingSubmissions = campaigns
    .filter((c) => c.status === "reviewing")
    .reduce((sum, c) => sum + c.submissions, 0)
  const draftCount = campaigns.filter((c) => c.status === "draft").length
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.totalBudget ?? 0), 0)

  const items = [
    {
      label: "Live listings",
      value: stats ? String(stats.activeCampaigns) : campaignsQuery.isLoading ? "…" : String(liveCount),
    },
    {
      label: "Pending reviews",
      value: stats
        ? String(stats.pendingReviews)
        : campaignsQuery.isLoading
          ? "…"
          : String(reviewingSubmissions),
    },
    {
      label: "Total budget",
      value: statsQuery.isLoading || campaignsQuery.isLoading
        ? "…"
        : `₹${formatInr(totalBudget)}`,
    },
    {
      label: "Drafts",
      value: stats ? String(stats.draftCampaigns) : campaignsQuery.isLoading ? "…" : String(draftCount),
    },
  ] as const

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/45 bg-white/[0.22] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_12px_40px_rgba(15,23,42,0.065)] ring-1 ring-black/[0.02] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.16] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.18)] dark:ring-white/[0.025]"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <BrandCampaignList />
    </>
  )
}
