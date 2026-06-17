"use client"

import { useCreatorAnalytics } from "@/hooks/use-analytics"
import { useCreatorPayments } from "@/hooks/use-payments"
import { formatInr, formatRelativeTime } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

const payoutTone: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600",
  processing: "bg-amber-500/10 text-amber-600",
  pending: "bg-amber-500/10 text-amber-600",
  on_hold: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
}

export function CreatorEarningsView() {
  const analyticsQuery = useCreatorAnalytics()
  const paymentsQuery = useCreatorPayments({ limit: 50 })

  const payouts = paymentsQuery.data ?? []
  const paidOut = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountInr, 0)

  const estimatedEarnings = analyticsQuery.data?.estimatedEarningsInr ?? 0
  const pendingEarnings = Math.max(0, estimatedEarnings - paidOut)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Payouts release after admin approval via Razorpay.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Paid out
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">₹{formatInr(paidOut)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pending release
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            ₹{formatInr(pendingEarnings)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Wins
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {analyticsQuery.data?.wins ?? 0}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Payout history</h2>
        </div>
        {paymentsQuery.isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Loading payouts…
          </p>
        ) : payouts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No payouts yet. Qualify on a campaign or win a bounty to start earning.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {payout.campaignTitle ?? "Campaign"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payout.paidAt
                      ? `Paid ${formatRelativeTime(payout.paidAt)}`
                      : `Created ${formatRelativeTime(payout.createdAt)}`}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    payoutTone[payout.status] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {payout.status.replace(/_/g, " ")}
                </span>
                <span className="w-24 text-right text-sm font-semibold tabular-nums">
                  ₹{formatInr(payout.amountInr)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
