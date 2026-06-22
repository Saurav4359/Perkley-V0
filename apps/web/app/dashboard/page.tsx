import { CreatorDashboardHome } from "@/components/dashboard/creator-dashboard-home"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { QueryHydration } from "@/components/query-hydration"
import { getCreatorNav } from "@/lib/dashboard/navigation"
import { prefetchCreatorDashboard } from "@/lib/query/server"

export default async function CreatorDashboardPage() {
  const dehydratedState = await prefetchCreatorDashboard()

  return (
    <DashboardShell nav={getCreatorNav("/dashboard")}>
      <QueryHydration state={dehydratedState}>
        <CreatorDashboardHome />
      </QueryHydration>
    </DashboardShell>
  )
}
