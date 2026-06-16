import { CreatorProfileView } from "@/components/dashboard/creator-profile-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { buildCreatorProfile } from "@/lib/dashboard/creator-profile"
import { getCreatorNav } from "@/lib/dashboard/mock-data"

export default function CreatorProfilePage() {
  const profile = buildCreatorProfile("Saurav Sharma")

  return (
    <DashboardShell nav={getCreatorNav("/dashboard/profile")} userName="Saurav">
      <CreatorProfileView profile={profile} />
    </DashboardShell>
  )
}
