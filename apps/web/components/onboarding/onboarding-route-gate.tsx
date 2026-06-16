"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { canParticipateInListings } from "@/lib/onboarding/progress"
import { getOnboardingState, getUserRole, isOnboardingComplete } from "@/lib/onboarding/storage"

export function OnboardingRouteGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const role = getUserRole()

    if (role === "brand") {
      router.replace("/dashboard/brand")
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
