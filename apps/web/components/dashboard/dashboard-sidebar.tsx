import Link from "next/link"
import { ArrowRight, BadgeCheck, CheckCircle2, ChevronDown, Circle, Sparkles } from "lucide-react"

type Stat = {
  label: string
  value: string
  trend?: string
}

type Step = {
  label: string
  done: boolean
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
  activity: Activity[]
  activityHref?: string
  isLoading?: boolean
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
  activity,
  activityHref = "/dashboard/notifications",
  isLoading = false,
}: DashboardSidebarProps) {
  const liveCampaigns = stats.find((s) => s.label.toLowerCase().includes("live") || s.label.toLowerCase().includes("active"))
  const totalEarnings = stats.find((s) => s.label.toLowerCase().includes("earnings") || s.label.toLowerCase().includes("reviews"))

  return (
    <aside className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1rem] border border-border bg-card px-3.5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {liveCampaigns?.label ?? "Live campaigns"}
          </p>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {isLoading ? "…" : liveCampaigns?.value ?? "0"}
          </p>
        </div>
        <div className="rounded-[1rem] border border-border bg-card px-3.5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {totalEarnings?.label ?? "Total earnings"}
          </p>
          <p className="mt-2 text-lg font-semibold tabular-nums">
            {isLoading ? "…" : totalEarnings?.value ?? "0"}
          </p>
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
          <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
          <Link href={activityHref} className="text-xs font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {isLoading ? "Loading activity…" : "No recent activity yet."}
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {activity.map((item) => (
              <li key={`${item.user}-${item.time}-${item.campaign}`} className="flex gap-3">
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
        )}
      </div>
    </aside>
  )
}
