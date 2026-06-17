"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { canLaunchBrandCampaigns } from "@/lib/brand-onboarding/progress"
import {
  getBrandOnboardingState,
  isBrandOnboardingComplete,
} from "@/lib/brand-onboarding/storage"

export function BrandOnboardingRouteGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      router.replace("/login")
      return
    }

    if (user.role === "creator") {
      router.replace("/onboarding")
      return
    }

    if (user.role !== "brand") {
      router.replace("/login")
      return
    }

    const state = getBrandOnboardingState()
    if (canLaunchBrandCampaigns(state) && isBrandOnboardingComplete()) {
      router.replace("/dashboard/brand")
      return
    }

    setReady(true)
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  return children
}
