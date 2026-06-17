import { CreatorEarningsView } from "@/components/dashboard/creator-earnings-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function CreatorEarningsPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/earnings")} userName="Saurav">
      <CreatorEarningsView />
    </DashboardShell>
  )
}
