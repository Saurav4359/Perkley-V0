import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function LeaderboardPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/leaderboard")} userName="Saurav">
      <div className="rounded-[1.15rem] border border-border bg-card px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Leaderboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Coming soon — top creators across active bounties.</p>
      </div>
    </DashboardShell>
  )
}
