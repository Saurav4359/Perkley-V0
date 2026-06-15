import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorSubmissions } from "@/lib/dashboard/listings-data"
import { getCreatorNav } from "@/lib/dashboard/mock-data"
import { formatInr } from "@/lib/dashboard/utils"

export default function CreatorEarningsPage() {
  const submissions = getCreatorSubmissions()
  const paid = submissions.filter((s) => s.status === "paid" || s.status === "won")
  const pending = submissions.filter((s) => ["qualified", "won"].includes(s.status))

  return (
    <DashboardShell nav={getCreatorNav("/dashboard/earnings")} userName="Saurav">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Payouts release after admin approval via Razorpay.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card px-4 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Paid out
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">₹{formatInr(3500)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pending release
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{pending.length} payouts</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {paid.length} completed payout{paid.length === 1 ? "" : "s"} on record (mock data).
        </p>
      </div>
    </DashboardShell>
  )
}
