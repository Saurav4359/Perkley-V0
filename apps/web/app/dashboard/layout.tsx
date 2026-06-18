import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { DashboardOnboardingGate } from "@/components/onboarding/dashboard-onboarding-gate"
import { getServerSession } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Dashboard — Perkley",
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerSession()
  if (!user) {
    redirect("/login")
  }

  return <DashboardOnboardingGate>{children}</DashboardOnboardingGate>
}
