import Link from "next/link"
import { ArrowRight, CheckCircle2, Circle } from "lucide-react"

import { RewardAmount } from "@/components/dashboard/reward-amount"

type Stat = {
  label: string
  value: string
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
}

type DashboardSidebarProps = {
  stats: Stat[]
  steps: Step[]
  winners: Winner[]
  activity: Activity[]
}

export function DashboardSidebar({
  stats,
  steps,
  winners,
  activity,
}: DashboardSidebarProps) {
  return (
    <aside className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card px-4 py-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">How Perkley works</h3>
        <ul className="mt-4 space-y-3">
          {steps.map((step) => (
            <li key={step.label} className="flex items-start gap-3 text-sm">
              {step.done ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={
                  step.done ? "text-foreground" : "text-muted-foreground"
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent winners
          </h3>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            Leaderboard
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <ul className="mt-4 space-y-4">
          {winners.map((winner) => (
            <li key={winner.name} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {winner.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {winner.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{winner.task}</p>
              </div>
              <RewardAmount amount={winner.amount} size="sm" className="shrink-0" />
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent activity
          </h3>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <ul className="mt-4 space-y-4">
          {activity.map((item) => (
            <li key={`${item.user}-${item.time}`} className="space-y-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.user}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {item.campaign} · {item.time}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
