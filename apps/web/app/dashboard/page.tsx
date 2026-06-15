import { CampaignFeed } from "@/components/dashboard/campaign-feed"
import { CreatorHero } from "@/components/dashboard/creator-hero"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import {
  CREATOR_CAMPAIGNS,
  ONBOARDING_STEPS,
  RECENT_ACTIVITY,
  RECENT_WINNERS,
  getCreatorNav,
} from "@/lib/dashboard/mock-data"

export default function CreatorDashboardPage() {
  return (
    <DashboardShell nav={getCreatorNav("/dashboard")} userName="Saurav">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_292px] xl:items-start xl:gap-6">
        <div className="space-y-5">
          <CreatorHero userName="Saurav" />
          <CampaignFeed campaigns={CREATOR_CAMPAIGNS} />
        </div>

        <DashboardSidebar
          stats={[
            { label: "Live campaigns", value: "48", trend: "12%" },
            { label: "Total earnings", value: "₹1,24,500", trend: "23%" },
          ]}
          steps={ONBOARDING_STEPS}
          winners={RECENT_WINNERS}
          activity={RECENT_ACTIVITY}
        />
      </div>
    </DashboardShell>
  )
}
