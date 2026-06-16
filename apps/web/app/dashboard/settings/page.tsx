import { CreatorSettingsView } from "@/components/dashboard/creator-settings-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function CreatorSettingsPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/settings")} userName="Saurav">
      <CreatorSettingsView />
    </DashboardShell>
  )
}
