import { BrandSettingsView } from "@/components/dashboard/brand-settings-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/mock-data"

export default function BrandSettingsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/settings")} userName="Brand">
      <BrandSettingsView />
    </DashboardShell>
  )
}
