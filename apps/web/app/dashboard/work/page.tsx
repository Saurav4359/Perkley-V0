import { MySubmissionsPanel } from "@/components/dashboard/my-submissions-panel"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function CreatorWorkPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/work")} userName="Saurav">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track bounty rankings and campaign qualification status. Metrics sync every 6 hours.
          </p>
        </div>
        <MySubmissionsPanel />
      </div>
    </DashboardShell>
  )
}
