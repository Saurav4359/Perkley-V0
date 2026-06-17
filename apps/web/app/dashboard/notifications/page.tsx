import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { NotificationsView } from "@/components/dashboard/notifications-view"
import { getCreatorNav } from "@/lib/dashboard/navigation"

export default function CreatorNotificationsPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/notifications")}>
      <NotificationsView role="creator" />
    </DashboardShell>
  )
}
