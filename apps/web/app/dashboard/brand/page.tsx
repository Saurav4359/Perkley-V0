import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { RewardAmount } from "@/components/dashboard/reward-amount"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { buttonVariants } from "@/components/ui/button"
import {
  BRAND_NAV,
  BRAND_ONBOARDING_STEPS,
  CREATOR_CAMPAIGNS,
  RECENT_ACTIVITY,
  RECENT_WINNERS,
} from "@/lib/dashboard/mock-data"
import { cn } from "@/lib/utils"

const BRAND_CAMPAIGNS = CREATOR_CAMPAIGNS.slice(0, 3).map((campaign, index) => ({
  ...campaign,
  status: index === 0 ? "Live" : index === 1 ? "Reviewing" : "Draft",
  submissions: [14, 6, 0][index],
}))

export default function BrandDashboardPage() {
  return (
    <DashboardShell nav={BRAND_NAV} userName="Saurav">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="space-y-6">
          <WelcomeBanner
            userName="Saurav"
            message="Launch bounties, review creator work, and pay winners from one place."
          />

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your campaigns</h2>
              <Link
                href="#"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-9 gap-1.5 rounded-full bg-brand px-4 text-white hover:bg-brand/90"
                )}
              >
                <Plus className="size-4" />
                New campaign
              </Link>
            </div>

            <div className="space-y-3">
              {BRAND_CAMPAIGNS.map((campaign) => (
                <article
                  key={campaign.id}
                  className="rounded-2xl border border-border bg-card px-4 py-4 sm:px-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: campaign.accent }}
                      >
                        {campaign.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.submissions} submissions · Due in {campaign.dueInDays}d
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:justify-end">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {campaign.status}
                      </span>
                      <RewardAmount amount={campaign.reward} className="shrink-0" />
                      <Link
                        href="#"
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-brand"
                      >
                        Manage
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <DashboardSidebar
          stats={[
            { label: "Active spend", value: "12.4L" },
            { label: "Pending reviews", value: "9" },
          ]}
          steps={BRAND_ONBOARDING_STEPS}
          winners={RECENT_WINNERS}
          activity={RECENT_ACTIVITY}
        />
      </div>
    </DashboardShell>
  )
}
