import { Suspense } from "react"

import { BrandDashboardHome } from "@/components/dashboard/brand-dashboard-home"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/navigation"

export default function BrandListingsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand")}>
      <Suspense fallback={null}>
        <BrandDashboardHome />
      </Suspense>
    </DashboardShell>
  )
}
