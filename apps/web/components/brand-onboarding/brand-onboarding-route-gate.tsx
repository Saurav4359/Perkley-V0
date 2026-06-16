"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { canLaunchBrandCampaigns } from "@/lib/brand-onboarding/progress"
import {
  getBrandOnboardingState,
  isBrandOnboardingComplete,
} from "@/lib/brand-onboarding/storage"
import { getUserRole } from "@/lib/onboarding/storage"

export function BrandOnboardingRouteGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const role = getUserRole()

    if (role === "creator") {
      router.replace("/onboarding")
      return
    }

    if (role !== "brand") {
      router.replace("/login")
      return
    }

    const state = getBrandOnboardingState()
    if (canLaunchBrandCampaigns(state) && isBrandOnboardingComplete()) {
      router.replace("/dashboard/brand")
      return
    }

    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  return children
}
