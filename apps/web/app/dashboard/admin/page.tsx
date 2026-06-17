import { AdminConsole } from "@/components/dashboard/admin-console"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function AdminPage() {
  return (
    <DashboardShell
      nav={[{ label: "Admin", href: "/dashboard/admin", active: true }]}
      userName="Admin"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage users, verify creators and brands, moderate campaigns, and monitor payouts.
          </p>
        </div>
        <AdminConsole />
      </div>
    </DashboardShell>
  )
}
