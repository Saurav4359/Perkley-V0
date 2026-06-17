import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { BrandCampaignsStats } from "@/components/dashboard/brand-campaigns-stats"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { buttonVariants } from "@/components/ui/button"
import { getBrandNav } from "@/lib/dashboard/navigation"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "My Brand — Perkley",
  robots: { index: false, follow: false },
}

export default function BrandCampaignsPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/campaigns")}>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-white/50 bg-white/[0.24] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.025] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.18] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_18px_60px_rgba(0,0,0,0.22)] dark:ring-white/[0.03] sm:px-6">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                My Brand
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Your listings, submission analytics, and drafts — everything for the
                brand you manage on Perkley.
              </p>
            </div>
            <Link
              href="/dashboard/brand/campaigns/new"
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-9 gap-1.5 rounded-full bg-brand px-4 text-white shadow-[0_10px_24px_rgba(254,108,55,0.28)] hover:bg-brand/90"
              )}
            >
              <Plus className="size-4" />
              New listing
            </Link>
          </div>
        </div>

        <BrandCampaignsStats />
      </div>
    </DashboardShell>
  )
}
