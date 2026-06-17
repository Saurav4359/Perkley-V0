import { BrandSettingsView } from "@/components/dashboard/brand-settings-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/navigation"

export default function BrandSettingsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/settings")}>
      <BrandSettingsView />
    </DashboardShell>
  )
}
