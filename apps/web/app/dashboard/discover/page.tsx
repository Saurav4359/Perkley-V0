import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function DiscoverPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/discover")} userName="Saurav">
      <div className="rounded-[1.15rem] border border-border bg-card px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Discover</h1>
        <p className="mt-2 text-sm text-muted-foreground">Coming soon — explore brands and niches tailored to you.</p>
      </div>
    </DashboardShell>
  )
}
