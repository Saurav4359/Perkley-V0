import type { Metadata } from "next"

import { DashboardOnboardingGate } from "@/components/onboarding/dashboard-onboarding-gate"

export const metadata: Metadata = {
  title: "Dashboard — Perkley",
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardOnboardingGate>{children}</DashboardOnboardingGate>
}
