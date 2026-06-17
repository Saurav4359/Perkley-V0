import { Suspense } from "react"

import { CreatorDashboardHome } from "@/components/dashboard/creator-dashboard-home"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/navigation"

export default function CreatorDashboardPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard")}>
      <Suspense fallback={null}>
        <CreatorDashboardHome />
      </Suspense>
    </DashboardShell>
  )
}
