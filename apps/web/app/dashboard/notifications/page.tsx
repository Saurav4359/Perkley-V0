import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { NotificationsView } from "@/components/dashboard/notifications-view"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function CreatorNotificationsPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/notifications")} userName="Saurav">
      <NotificationsView role="creator" />
    </DashboardShell>
  )
}
