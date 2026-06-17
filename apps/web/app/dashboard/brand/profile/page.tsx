import { redirect } from "next/navigation"

import { BrandProfileView } from "@/components/dashboard/brand-profile-view"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandNav } from "@/lib/dashboard/navigation"

type BrandProfilePageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function BrandProfilePage({ searchParams }: BrandProfilePageProps) {
  const params = await searchParams

  if (params.tab === "settings") {
    redirect("/dashboard/brand/settings")
  }

  const initialTab =
    params.tab === "reviews" || params.tab === "campaigns" ? params.tab : "campaigns"

  return (
    <DashboardShell nav={getBrandNav("/dashboard/brand/profile")}>
      <BrandProfileView initialTab={initialTab} />
    </DashboardShell>
  )
}
