"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { canParticipateInListings } from "@/lib/onboarding/progress"
import { canLaunchBrandCampaigns } from "@/lib/brand-onboarding/progress"
import {
  getBrandOnboardingState,
  isBrandOnboardingComplete,
} from "@/lib/brand-onboarding/storage"
import { getOnboardingState, getUserRole, isOnboardingComplete } from "@/lib/onboarding/storage"

export function OnboardingRouteGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const role = getUserRole()

    if (role === "brand") {
      const brandState = getBrandOnboardingState()
      if (canLaunchBrandCampaigns(brandState) && isBrandOnboardingComplete()) {
        router.replace("/dashboard/brand")
        return
      }
      router.replace("/brand-onboarding")
      return
    }

    const state = getOnboardingState()
    if (canParticipateInListings(state) && isOnboardingComplete()) {
      router.replace("/dashboard")
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
