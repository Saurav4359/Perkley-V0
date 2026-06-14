import { CampaignFeed } from "@/components/dashboard/campaign-feed"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import {
  CREATOR_CAMPAIGNS,
  CREATOR_NAV,
  ONBOARDING_STEPS,
  RECENT_ACTIVITY,
  RECENT_WINNERS,
} from "@/lib/dashboard/mock-data"

export default function CreatorDashboardPage() {
  return (
    <DashboardShell nav={CREATOR_NAV} userName="Saurav">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="space-y-6">
          <WelcomeBanner
            userName="Saurav"
            message="Find campaigns that reward performance, not just reach."
          />
          <CampaignFeed campaigns={CREATOR_CAMPAIGNS} />
        </div>

        <DashboardSidebar
          stats={[
            { label: "Total paid out", value: "1.2Cr" },
            { label: "Live campaigns", value: "48" },
          ]}
          steps={ONBOARDING_STEPS}
          winners={RECENT_WINNERS}
          activity={RECENT_ACTIVITY}
        />
      </div>
    </DashboardShell>
  )
}
