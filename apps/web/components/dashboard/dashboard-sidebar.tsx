import Link from "next/link"
import { ArrowRight, BadgeCheck, CheckCircle2, ChevronDown, Circle, Sparkles, TrendingUp } from "lucide-react"

import { RewardAmount } from "@/components/dashboard/reward-amount"

type Stat = {
  label: string
  value: string
  trend?: string
}

type Step = {
  label: string
  done: boolean
}

type Winner = {
  name: string
  task: string
  amount: string
}

type Activity = {
  user: string
  action: string
  campaign: string
  time: string
  kind?: "submit" | "qualified" | "new"
}

type DashboardSidebarProps = {
  stats: Stat[]
  steps: Step[]
  stepsTitle?: string
  connectedSteps?: boolean
  winners: Winner[]
  activity: Activity[]
}

function PaidOutSparkline() {
  return (
    <svg viewBox="0 0 140 40" className="mt-4 h-10 w-full" aria-hidden>
      <polyline
        fill="none"
        stroke="url(#paidGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,32 16,28 28,30 42,22 58,24 72,16 88,18 104,10 120,12 140,4"
      />
      <defs>
        <linearGradient id="paidGradient" x1="0" y1="0" x2="140" y2="0">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#fe6c37" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ActivityIcon({ kind }: { kind?: Activity["kind"] }) {
  if (kind === "qualified") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <BadgeCheck className="size-4" />
      </span>
    )
  }
  if (kind === "new") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
        <Sparkles className="size-4" />
      </span>
    )
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
      <ArrowRight className="size-4" />
    </span>
  )
}

function StepsList({
  steps,
  connected,
}: {
  steps: Step[]
  connected?: boolean
}) {
  if (connected) {
    return (
      <ul className="mt-2.5">
        {steps.map((step, index) => (
          <li key={step.label}>
            <div className="flex items-center gap-2.5">
              {step.done ? (
                <CheckCircle2 className="size-4 shrink-0 text-brand" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/45" />
              )}
              <span
                className={
                  step.done
                    ? "text-[13px] leading-tight text-foreground"
                    : "text-[13px] leading-tight text-muted-foreground"
                }
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div className="flex h-3.5 w-4 items-center justify-center">
                <ChevronDown className="size-3.5 text-muted-foreground/35" aria-hidden />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="mt-4 space-y-3">
      {steps.map((step) => (
        <li key={step.label} className="flex items-start gap-3 text-sm">
          {step.done ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/45" />
          )}
          <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
            {step.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function DashboardSidebar({
  stats,
  steps,
  stepsTitle = "How Perkley works",
  connectedSteps = false,
  winners,
  activity,
}: DashboardSidebarProps) {
  const liveCampaigns = stats.find((s) => s.label.toLowerCase().includes("live"))
  const totalEarnings = stats.find((s) => s.label.toLowerCase().includes("earnings"))

  return (
    <aside className="space-y-4">
      <div className="rounded-[1.15rem] bg-[#0f172a] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">
          Total paid out
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">₹1.2 Cr</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
          <TrendingUp className="size-3.5" />
          18% vs last month
        </p>
        <PaidOutSparkline />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1rem] border border-border bg-card px-3.5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Live campaigns
          </p>
          <p className="mt-2 text-xl font-semibold tabular-nums">{liveCampaigns?.value ?? "48"}</p>
          {liveCampaigns?.trend ? (
            <p className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="size-3" />
              {liveCampaigns.trend}
            </p>
          ) : null}
        </div>
        <div className="rounded-[1rem] border border-border bg-card px-3.5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Total earnings
          </p>
          <p className="mt-2 text-lg font-semibold tabular-nums">{totalEarnings?.value ?? "₹1,24,500"}</p>
          {totalEarnings?.trend ? (
            <p className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="size-3" />
              {totalEarnings.trend}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={
          connectedSteps
            ? "rounded-[1.15rem] border border-border bg-card px-4 py-3.5"
            : "rounded-[1.15rem] border border-border bg-card p-5"
        }
      >
        <h3 className="text-sm font-semibold text-foreground">{stepsTitle}</h3>
        <StepsList steps={steps} connected={connectedSteps} />
      </div>

      <div className="rounded-[1.15rem] border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Top performers</h3>
          <Link href="/dashboard/work" className="text-xs font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-3.5">
          {winners.map((winner, index) => (
            <li key={winner.name} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                {winner.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{winner.name}</p>
                <p className="truncate text-xs text-muted-foreground">{winner.task}</p>
              </div>
              <RewardAmount amount={winner.amount} size="sm" className="shrink-0" />
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[1.15rem] border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
          <Link href="#" className="text-xs font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        <ul className="mt-4 space-y-4">
          {activity.map((item) => (
            <li key={`${item.user}-${item.time}`} className="flex gap-3">
              <ActivityIcon kind={item.kind} />
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{item.user}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.campaign} · {item.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
