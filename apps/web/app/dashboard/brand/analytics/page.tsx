import type { Metadata } from "next"

import { BrandAnalyticsView } from "@/components/dashboard/brand-analytics-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/navigation"

export const metadata: Metadata = {
  title: "Analytics — Perkley",
  robots: { index: false, follow: false },
}

export default function BrandAnalyticsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/analytics")}>
      <BrandAnalyticsView />
    </DashboardShell>
  )
}
