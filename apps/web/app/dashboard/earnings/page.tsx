import { CreatorEarningsView } from "@/components/dashboard/creator-earnings-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/navigation"

export default function CreatorEarningsPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/earnings")}>
      <CreatorEarningsView />
    </DashboardShell>
  )
}
