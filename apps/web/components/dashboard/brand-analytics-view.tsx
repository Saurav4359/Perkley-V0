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
import {
  BUDGET_UTILIZATION,
  BRAND_ANALYTICS_KPIS,
  CAMPAIGN_PERFORMANCE,
  CHANNEL_MIX,
  CREATOR_FUNNEL,
  ENGAGEMENT_WEEKLY,
  NICHE_BREAKDOWN,
  SPEND_OVER_TIME,
  TOP_CREATORS,
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

function KpiCard({ kpi }: { kpi: typeof BRAND_ANALYTICS_KPIS[number] }) {
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

function SpendChart({ data }: { data: typeof SPEND_OVER_TIME }) {
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

function MiniSparkline({ data }: { data: typeof ENGAGEMENT_WEEKLY }) {
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
  const utilizationPct = Math.round(
    (BUDGET_UTILIZATION.spent / BUDGET_UTILIZATION.allocated) * 100
  )

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
        {BRAND_ANALYTICS_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Spend over time</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Monthly payout volume across campaigns
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand">
              <IndianRupee className="size-3.5" />
              ₹{formatInr(SPEND_OVER_TIME[SPEND_OVER_TIME.length - 1].value)}
            </div>
          </div>
          <div className="mt-6">
            <SpendChart data={SPEND_OVER_TIME} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            {SPEND_OVER_TIME.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </section>

        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <h2 className="text-sm font-semibold text-foreground">Creator funnel</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            From brief view to paid winner
          </p>
          <ul className="mt-5 space-y-3">
            {CREATOR_FUNNEL.map((stage, index) => (
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
                {index < CREATOR_FUNNEL.length - 1 ? (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {Math.round((CREATOR_FUNNEL[index + 1].count / stage.count) * 100)}% convert
                    to next step
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={cn(glassCardClassName, "p-5 sm:p-6 lg:col-span-2")}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Campaign performance</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Spend, submissions, and efficiency by listing
              </p>
            </div>
            <MousePointerClick className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="pb-3 pr-4">Campaign</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Spend</th>
                  <th className="pb-3 pr-4">Subs</th>
                  <th className="pb-3 pr-4">Qualified</th>
                  <th className="pb-3 pr-4">Engagement</th>
                  <th className="pb-3">CPA</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGN_PERFORMANCE.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/30"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/dashboard/brand/campaigns/${row.id}`}
                        className="font-medium text-foreground hover:text-brand hover:underline"
                      >
                        {row.title}
                      </Link>
                      <p className="text-[11px] capitalize text-muted-foreground">{row.type}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                          statusClass(row.status)
                        )}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">₹{formatInr(row.spend)}</td>
                    <td className="py-3 pr-4 tabular-nums">{row.submissions}</td>
                    <td className="py-3 pr-4 tabular-nums">{row.qualified}</td>
                    <td className="py-3 pr-4 tabular-nums">{row.engagement.toFixed(1)}%</td>
                    <td className="py-3 tabular-nums">₹{formatInr(row.cpa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <h2 className="text-sm font-semibold text-foreground">Budget utilization</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Allocated vs spent this quarter</p>
          <div className="mt-6">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold tabular-nums">{utilizationPct}%</p>
              <p className="text-xs text-muted-foreground">of ₹{formatInr(BUDGET_UTILIZATION.allocated)}</p>
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
                <dd className="font-medium tabular-nums">₹{formatInr(BUDGET_UTILIZATION.spent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Remaining</dt>
                <dd className="font-medium tabular-nums">
                  ₹{formatInr(BUDGET_UTILIZATION.remaining)}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-brand" />
            <h2 className="text-sm font-semibold text-foreground">Content channels</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Where creators publish for you</p>
          <ul className="mt-5 space-y-4">
            {CHANNEL_MIX.map((channel) => (
              <li key={channel.channel}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{channel.channel}</span>
                  <span className="font-medium tabular-nums">{channel.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${channel.pct}%`, backgroundColor: channel.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-foreground">Engagement trend</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Average rate over recent weeks</p>
          <p className="mt-4 text-2xl font-semibold tabular-nums">
            {ENGAGEMENT_WEEKLY[ENGAGEMENT_WEEKLY.length - 1].value}%
          </p>
          <TrendBadge value={0.6} label="vs last week" />
          <div className="mt-4">
            <MiniSparkline data={ENGAGEMENT_WEEKLY} />
          </div>
        </section>

        <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-brand" />
            <h2 className="text-sm font-semibold text-foreground">Niche mix</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Creator categories in your briefs</p>
          <ul className="mt-5 space-y-3">
            {NICHE_BREAKDOWN.map((item) => (
              <li key={item.niche} className="flex items-center gap-3">
                <span className="w-16 text-xs text-muted-foreground">{item.niche}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-subtle to-brand"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium tabular-nums">{item.pct}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={cn(glassCardClassName, "p-5 sm:p-6")}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Top performing creators</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Highest engagement and earnings on your campaigns
            </p>
          </div>
        </div>
        <ul className="mt-5 divide-y divide-border/60">
          {TOP_CREATORS.map((creator, index) => (
            <li key={creator.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="w-5 text-xs font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-semibold text-brand">
                {creator.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{creator.name}</p>
                <p className="text-xs text-muted-foreground">
                  {creator.campaigns} campaigns · {creator.engagement} engagement
                </p>
              </div>
              <RewardAmount amount={creator.earned} size="sm" className="shrink-0" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
