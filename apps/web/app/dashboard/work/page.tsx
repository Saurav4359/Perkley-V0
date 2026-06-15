import { MySubmissionsList } from "@/components/dashboard/my-submissions-list"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorSubmissions } from "@/lib/dashboard/listings-data"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function CreatorWorkPage() {
  const submissions = getCreatorSubmissions()

  return (
    <DashboardShell nav={getCreatorNav("/dashboard/work")} userName="Saurav">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track bounty rankings and campaign qualification status. Metrics sync every 6 hours.
          </p>
        </div>
        <MySubmissionsList submissions={submissions} />
      </div>
    </DashboardShell>
  )
}
