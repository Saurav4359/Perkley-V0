import type { Metadata } from "next"

import Link from "next/link"
import { Plus } from "lucide-react"

import { BrandCampaignList } from "@/components/dashboard/brand-campaign-list"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { buttonVariants } from "@/components/ui/button"
import { BRAND_CAMPAIGNS, getBrandNav } from "@/lib/dashboard/mock-data"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Live listings",
    value: String(BRAND_CAMPAIGNS.filter((c) => c.status === "live").length),
  },
  {
    label: "Pending reviews",
    value: String(
      BRAND_CAMPAIGNS.filter((c) => c.status === "reviewing").reduce(
        (sum, c) => sum + c.submissions,
        0
      )
    ),
  },
  {
    label: "Total budget",
    value: "₹4.35L",
  },
  {
    label: "Drafts",
    value: String(BRAND_CAMPAIGNS.filter((c) => c.status === "draft").length),
  },
] as const

export const metadata: Metadata = {
  title: "Campaigns — Perkley",
  robots: { index: false, follow: false },
}

export default function BrandCampaignsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/campaigns")} userName="Saurav">
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-white/50 bg-white/[0.24] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.025] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.18] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_18px_60px_rgba(0,0,0,0.22)] dark:ring-white/[0.03] sm:px-6">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Campaigns
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Create bounties, track submissions, and pay creators for performance.
              </p>
            </div>
            <Link
              href="/dashboard/brand/campaigns/new"
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-9 gap-1.5 rounded-full bg-brand px-4 text-white shadow-[0_10px_24px_rgba(254,108,55,0.28)] hover:bg-brand/90"
              )}
            >
              <Plus className="size-4" />
              New campaign
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
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

        <BrandCampaignList campaigns={BRAND_CAMPAIGNS} />
      </div>
    </DashboardShell>
  )
}
