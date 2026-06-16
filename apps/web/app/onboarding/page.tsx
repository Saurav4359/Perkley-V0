"use client"

import { Suspense } from "react"

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout"
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider"
import { OnboardingRouteGate } from "@/components/onboarding/onboarding-route-gate"

function OnboardingPageContent() {
  return (
    <OnboardingRouteGate>
      <OnboardingProvider>
        <OnboardingLayout>
          <OnboardingFlow />
        </OnboardingLayout>
      </OnboardingProvider>
    </OnboardingRouteGate>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  )
}
