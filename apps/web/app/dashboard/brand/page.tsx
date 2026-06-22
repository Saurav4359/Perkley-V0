import { BrandDashboardHome } from "@/components/dashboard/brand-dashboard-home"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { QueryHydration } from "@/components/query-hydration"
import { getBrandNav } from "@/lib/dashboard/navigation"
import { prefetchBrandDashboard } from "@/lib/query/server"

export default async function BrandListingsPage() {
  const dehydratedState = await prefetchBrandDashboard()

  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand")}>
      <QueryHydration state={dehydratedState}>
        <BrandDashboardHome />
      </QueryHydration>
    </DashboardShell>
  )
}
