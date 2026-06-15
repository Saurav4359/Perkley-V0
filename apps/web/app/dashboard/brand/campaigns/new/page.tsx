import Link from "next/link"
import { ArrowRight, Plus, Trophy, Users } from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { buttonVariants } from "@/components/ui/button"
import { getBrandNav } from "@/lib/dashboard/mock-data"
import { cn } from "@/lib/utils"

export default function NewListingPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/campaigns/new")} userName="Saurav">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create a listing</h1>
          <p className="text-sm text-muted-foreground">
            Choose how creators earn — compete for a prize pool or get a flat payout.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/brand/campaigns/new/bounty"
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
              <Trophy className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Bounty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Compete. Best content wins.</p>
            <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
              Create bounty
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>

          <Link
            href="/dashboard/brand/campaigns/new/campaign"
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
              <Users className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Campaign</h2>
            <p className="mt-2 text-sm text-muted-foreground">Complete. Hit the goal. Get paid.</p>
            <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
              Create campaign
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        </div>

        <Link
          href="/dashboard/brand/campaigns"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
        >
          Cancel
        </Link>
      </div>
    </DashboardShell>
  )
}
