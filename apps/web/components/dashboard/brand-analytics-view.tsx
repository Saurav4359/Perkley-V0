"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  IndianRupee,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react"

import { RewardAmount } from "@/components/dashboard/reward-amount"
import { buttonVariants } from "@/components/ui/button"
import { useBrandAnalytics } from "@/hooks/use-analytics"
import {
  type AnalyticsKpi,
  type AnalyticsPeriod,
} from "@/lib/dashboard/brand-analytics"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

const PERIOD_OPTIONS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
]

const glassCardClassName = cn(
  "rounded-2xl border border-white/45 bg-white/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_12px_40px_rgba(15,23,42,0.065)] ring-1 ring-black/[0.02] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.16]",
  "dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.18)] dark:ring-white/[0.025]"
)

function TrendBadge({ value, label }: { value?: number; label?: string }) {
  if (value === undefined) return null
  const positive = value >= 0
  const inverted = label?.toLowerCase().includes("efficiency")
  const good = inverted ? !positive : positive

  return (
    <p
      className={cn(
        "mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium",
        good ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
      )}
    >
      {positive ? (
        <ArrowUpRight className="size-3" />
      ) : (
        <ArrowDownRight className="size-3" />
      )}
      {Math.abs(value)}% {label ?? "vs last period"}
    </p>
  )
}

function KpiCard({ kpi }: { kpi: AnalyticsKpi }) {
  return (
    <div className={cn(glassCardClassName, "px-4 py-4")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {kpi.label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {kpi.value}
      </p>
      <TrendBadge value={kpi.trend} label={kpi.trendLabel} />
      {kpi.hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{kpi.hint}</p>
      ) : null}
    </div>
  )
}

function SpendChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value))
  const width = 320
  const height = 120
  const padding = 8

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - (point.value / max) * (height - padding * 2)
    return `${x},${y}`
  })

  const areaPoints = `${padding},${height - padding} ${points.join(" ")} ${width - padding},${height - padding}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full" aria-hidden>
      <defs>
        <linearGradient id="spendArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FE6C37" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FE6C37" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="spendLine" x1="0" y1="0" x2={width} y2="0">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#fe6c37" />
        </linearGradient>
      </defs>
      <polygon fill="url(#spendArea)" points={areaPoints} />
      <polyline
        fill="none"
        stroke="url(#spendLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  )
}

function MiniSparkline({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const range = max - min || 1
  const width = 140
  const height = 40

  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((point.value - min) / range) * (height - 4)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" aria-hidden>
      <polyline
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function statusLabel(status: string) {
  switch (status) {
    case "live":
      return "Live"
    case "reviewing":
      return "Reviewing"
    case "draft":
      return "Draft"
    case "ended":
      return "Ended"
    default:
      return status
  }
}

function statusClass(status: string) {
  switch (status) {
    case "live":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "reviewing":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    case "draft":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function BrandAnalyticsView() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d")
  const { data: analytics, isLoading } = useBrandAnalytics()

  const kpis: AnalyticsKpi[] = analytics
    ? [
        {
          label: "Released spend",
          value: `₹${formatInr(analytics.spend.releasedInr)}`,
          hint: "Paid out to creators",
        },
        {
          label: "Active campaigns",
          value: String(analytics.activeCampaigns),
          hint: `${analytics.campaigns} total`,
        },
        {
          label: "Applications",
          value: formatInr(analytics.totalApplications),
          hint: "Across all campaigns",
        },
        {
          label: "Total views",
          value: formatInr(analytics.engagement.totalViews),
          hint: `${analytics.engagement.submissions} submissions`,
        },
        {
          label: "Engagement rate",
          value: `${analytics.engagement.engagementRate}%`,
          hint: "Likes + comments / views",
        },
        {
          label: "Completed campaigns",
          value: String(analytics.completedCampaigns),
          hint: "Paid and closed",
        },
      ]
    : []

  const budget = analytics
    ? {
        allocated: analytics.spend.totalBudgetInr,
        spent: analytics.spend.releasedInr,
        remaining: analytics.spend.remainingInr,
      }
    : { allocated: 0, spent: 0, remaining: 0 }

  const funnel = analytics
    ? [
        {
          stage: "Applications",
          count: analytics.totalApplications,
          pct: 100,
        },
        {
          stage: "Submissions",
          count: analytics.engagement.submissions,
          pct:
            analytics.totalApplications > 0
              ? Math.round(
                  (analytics.engagement.submissions / analytics.totalApplications) * 100
                )
              : 0,
        },
        {
          stage: "Qualified",
          count: analytics.statusBreakdown.qualified ?? 0,
          pct:
            analytics.engagement.submissions > 0
              ? Math.round(
                  ((analytics.statusBreakdown.qualified ?? 0) /
                    analytics.engagement.submissions) *
                    100
                )
              : 0,
        },
      ]
    : []

  const utilizationPct =
    budget.allocated > 0
      ? Math.round((budget.spent / budget.allocated) * 100)
      : 0

  return (
    <div className="space-y-8">
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.35rem] border border-white/50 bg-white/[0.24] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.025] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.18]",
          "dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_18px_60px_rgba(0,0,0,0.22)] dark:ring-white/[0.03] sm:px-6"
        )}
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-brand">
              <BarChart3 className="size-4" strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                Performance
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Brand analytics
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Track spend, creator performance, and campaign ROI across all your bounties and
              campaigns.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                className={cn(
                  "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  period === option.id
                    ? "bg-brand text-white shadow-[0_8px_20px_rgba(254,108,55,0.28)]"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
            <Link
              href="/dashboard/brand/campaigns"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
            >
              View campaigns
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className={cn(glassCardClassName, "px-4 py-8 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3")}>
            Loading analytics…
          </div>
        ) : kpis.length === 0 ? (
          <div className={cn(glassCardClassName, "px-4 py-8 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3")}>
            No analytics data yet. Launch a campaign to start tracking performance.
          </div>
        ) : (
          kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Spend summary</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Released payouts across your campaigns
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand">
              <IndianRupee className="size-3.5" />
              ₹{formatInr(budget.spent)}
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {analytics
              ? `₹${formatInr(budget.remaining)} remaining of ₹${formatInr(budget.allocated)} allocated.`
              : "Spend trends will appear once campaigns are funded and payouts are released."}
          </p>
        </section>

        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <h2 className="text-sm font-semibold text-foreground">Creator funnel</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            From application to qualified submission
          </p>
          {funnel.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">No funnel data yet.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {funnel.map((stage, index) => (
                <li key={stage.stage}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-foreground">{stage.stage}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatInr(stage.count)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-subtle to-brand transition-all"
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                  {index < funnel.length - 1 && stage.count > 0 ? (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {Math.round((funnel[index + 1].count / stage.count) * 100)}% convert to
                      next step
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={cn(glassCardClassName, "p-5 sm:p-6 lg:col-span-2")}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Engagement overview</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Views, likes, and comments across submissions
              </p>
            </div>
            <MousePointerClick className="size-4 text-muted-foreground" />
          </div>
          {analytics ? (
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Total views</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {formatInr(analytics.engagement.totalViews)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Total likes</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {formatInr(analytics.engagement.totalLikes)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Total comments</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {formatInr(analytics.engagement.totalComments)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Avg. engagement score</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {analytics.engagement.averageEngagementScore.toFixed(1)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              Engagement metrics will appear once creators submit to your campaigns.
            </p>
          )}
        </section>

        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <h2 className="text-sm font-semibold text-foreground">Budget utilization</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Allocated vs released spend</p>
          <div className="mt-6">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold tabular-nums">{utilizationPct}%</p>
              <p className="text-xs text-muted-foreground">of ₹{formatInr(budget.allocated)}</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${utilizationPct}%` }}
              />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Spent</dt>
                <dd className="font-medium tabular-nums">₹{formatInr(budget.spent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Remaining</dt>
                <dd className="font-medium tabular-nums">
                  ₹{formatInr(budget.remaining)}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  )
}
