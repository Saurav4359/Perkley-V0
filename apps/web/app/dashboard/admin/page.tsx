import { AdminSubmissionsTable } from "@/components/dashboard/admin-submissions-table"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getPendingAdminSubmissions } from "@/lib/dashboard/listings-data"

export default function AdminPage() {
  const submissions = getPendingAdminSubmissions()

  return (
    <DashboardShell
      nav={[{ label: "Admin", href: "/dashboard/admin", active: true }]}
      userName="Admin"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review submissions, approve winners and qualifiers, release Razorpay payouts.
          </p>
        </div>
        <AdminSubmissionsTable submissions={submissions} />
      </div>
    </DashboardShell>
  )
}
