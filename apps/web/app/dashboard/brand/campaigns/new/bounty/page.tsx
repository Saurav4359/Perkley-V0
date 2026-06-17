import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { CreateBountyForm } from "@/components/dashboard/forms/create-bounty-form"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/navigation"

export default function CreateBountyPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/campaigns/new/bounty")}>
      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
        >
          <div className="absolute -right-16 top-8 size-72 rounded-full bg-brand/[0.06] blur-3xl" />
          <div className="absolute -left-20 bottom-0 size-80 rounded-full bg-brand/[0.04] blur-3xl" />
          <div className="absolute right-1/3 top-1/2 size-56 rounded-full bg-orange-200/20 blur-3xl dark:bg-brand/[0.03]" />
        </div>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <Link
              href="/dashboard/brand/campaigns"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to campaigns
            </Link>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Create bounty
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Competitive listing — top performers win from the prize pool.
              </p>
            </div>
          </div>

          <CreateBountyForm />
        </div>
      </div>
    </DashboardShell>
  )
}
