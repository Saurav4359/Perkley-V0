import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { NotificationsView } from "@/components/dashboard/notifications-view"
import { getBrandNav } from "@/lib/dashboard/mock-data"

export default function BrandNotificationsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/notifications")} userName="Brand">
      <NotificationsView role="brand" />
    </DashboardShell>
  )
}
