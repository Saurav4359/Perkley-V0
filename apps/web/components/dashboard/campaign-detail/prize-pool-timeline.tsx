import { InrIcon } from "@/components/dashboard/inr-icon"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

type PrizeTier = {
  label: string
  amount: string
}

type PrizePoolTimelineProps = {
  totalBudget: number
  tiers: PrizeTier[]
  className?: string
}

function shortenTierLabel(label: string) {
  return label
    .replace(/\s*place$/i, "")
    .replace(/^top\s+(\d+)\s+each$/i, "Top $1")
}

export function PrizePoolTimeline({
  totalBudget,
  tiers,
  className,
}: PrizePoolTimelineProps) {
  return (
    <div className={cn("grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3", className)}>
      <div className="flex justify-center pt-0.5">
        <InrIcon className="size-8" />
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pb-1">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]">
          ₹{formatInr(totalBudget)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">Total prizes</span>
      </div>

      {tiers.map((tier, index) => (
        <div key={tier.label} className="contents">
          <div className="flex flex-col items-center">
            <div aria-hidden className="h-3 w-px bg-border" />
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full border border-border bg-muted"
            />
            {index < tiers.length - 1 ? (
              <div aria-hidden className="min-h-4 w-px flex-1 bg-border" />
            ) : null}
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-3 py-1 text-sm sm:text-base",
              index < tiers.length - 1 ? "pb-4" : "pb-0"
            )}
          >
            <span className="font-semibold tabular-nums text-foreground">
              ₹{tier.amount}
            </span>
            <span className="shrink-0 text-foreground/60">
              {shortenTierLabel(tier.label)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
