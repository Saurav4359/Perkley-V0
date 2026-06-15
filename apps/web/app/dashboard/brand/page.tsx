import Link from "next/link"
import { Plus } from "lucide-react"

import { BrandHero } from "@/components/dashboard/brand-hero"
import { ListingCard } from "@/components/dashboard/listing-card"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { buttonVariants } from "@/components/ui/button"
import {
  BRAND_CAMPAIGNS,
  BRAND_ONBOARDING_STEPS,
  getBrandNav,
  RECENT_ACTIVITY,
  RECENT_WINNERS,
} from "@/lib/dashboard/mock-data"
import { cn } from "@/lib/utils"

const OVERVIEW_CAMPAIGNS = BRAND_CAMPAIGNS.filter((campaign) =>
  ["live", "reviewing", "draft"].includes(campaign.status)
).slice(0, 3)

export default function BrandDashboardPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand")} userName="Saurav">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="space-y-6">
          <BrandHero userName="Saurav" />

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your campaigns</h2>
                <p className="text-sm text-muted-foreground">
                  Recent campaigns needing attention
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/brand/campaigns"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
                >
                  View all
                </Link>
                <Link
                  href="/dashboard/brand/campaigns/new"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-9 gap-1.5 rounded-full bg-brand px-4 text-white hover:bg-brand/90"
                  )}
                >
                  <Plus className="size-4" />
                  New campaign
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {OVERVIEW_CAMPAIGNS.map((campaign) => (
                <ListingCard
                  key={campaign.id}
                  listing={campaign}
                  href={`/dashboard/brand/campaigns/${campaign.id}`}
                />
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
