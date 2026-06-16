"use client"

import { Suspense } from "react"

import { BrandOnboardingFlow } from "@/components/brand-onboarding/brand-onboarding-flow"
import { BrandOnboardingProvider } from "@/components/brand-onboarding/brand-onboarding-provider"
import { BrandOnboardingRouteGate } from "@/components/brand-onboarding/brand-onboarding-route-gate"
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout"

function BrandOnboardingPageContent() {
  return (
    <BrandOnboardingRouteGate>
      <BrandOnboardingProvider>
        <OnboardingLayout>
          <BrandOnboardingFlow />
        </OnboardingLayout>
      </BrandOnboardingProvider>
    </BrandOnboardingRouteGate>
  )
}

export default function BrandOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      }
    >
      <BrandOnboardingPageContent />
    </Suspense>
  )
}
