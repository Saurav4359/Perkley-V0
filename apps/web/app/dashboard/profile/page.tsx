import { CreatorProfilePageClient } from "@/components/dashboard/creator-profile-page-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCreatorNav } from "@/lib/dashboard/navigation"

export default function CreatorProfilePage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard/profile")}>
      <CreatorProfilePageClient />
    </DashboardShell>
  )
}
