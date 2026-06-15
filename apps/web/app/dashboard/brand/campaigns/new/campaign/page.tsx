import { CreateCampaignForm } from "@/components/dashboard/forms/create-campaign-form"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/mock-data"

export default function CreateCampaignPage() {
  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/campaigns/new/campaign")} userName="Saurav">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create campaign</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Non-competitive — creators who hit the view threshold earn a fixed reward.
          </p>
        </div>
        <CreateCampaignForm />
      </div>
    </DashboardShell>
  )
}
