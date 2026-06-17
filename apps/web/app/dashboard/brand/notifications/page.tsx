import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { NotificationsView } from "@/components/dashboard/notifications-view"
import { getBrandNav } from "@/lib/dashboard/navigation"

export default function BrandNotificationsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/notifications")}>
      <NotificationsView role="brand" />
    </DashboardShell>
  )
}
