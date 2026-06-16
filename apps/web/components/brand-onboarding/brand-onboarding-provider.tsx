"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { useRouter } from "next/navigation"

import { BRAND_ONBOARDING_STEP_COUNT } from "@/lib/brand-onboarding/constants"
import { canLaunchBrandCampaigns } from "@/lib/brand-onboarding/progress"
import {
  brandOnboardingReducer,
  createInitialBrandOnboardingState,
  saveBrandPaymentToState,
} from "@/lib/brand-onboarding/state"
import {
  finishBrandOnboardingSession,
  loadBrandOnboardingState,
  notifyBrandOnboardingUpdated,
  saveBrandOnboardingState,
} from "@/lib/brand-onboarding/storage"
import type {
  BrandOnboardingState,
  BrandOnboardingStep,
  BrandSocialLinks,
} from "@/lib/brand-onboarding/types"
import type { PaymentDetails } from "@/lib/onboarding/types"
import type { Niche } from "@/lib/dashboard/types"

type BrandOnboardingContextValue = {
  state: BrandOnboardingState
  hydrated: boolean
  updateIdentity: (fields: {
    name: string
    bio: string
    industry: Niche
    location: string
  }) => void
  saveIdentity: (fields: {
    name: string
    bio: string
    industry: Niche
    location: string
  }) => void
  updateVerification: (workEmail: string, website: string) => void
  verifyWorkEmail: () => void
  saveVerification: (workEmail: string, website: string, workEmailVerified: boolean) => void
  updatePresence: (social: BrandSocialLinks, logoUrl?: string) => void
  savePresence: (social: BrandSocialLinks, logoUrl?: string) => void
  goToStep: (step: BrandOnboardingStep) => void
  skipCurrentStep: () => void
  finishAndExit: (payment?: PaymentDetails) => void
}

const BrandOnboardingContext = createContext<BrandOnboardingContextValue | null>(null)

export function BrandOnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const [state, dispatch] = useReducer(brandOnboardingReducer, undefined, () =>
    createInitialBrandOnboardingState()
  )

  useEffect(() => {
    const stored = loadBrandOnboardingState()
    dispatch({
      type: "HYDRATE",
      state: stored ?? createInitialBrandOnboardingState(),
    })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveBrandOnboardingState(state)
    notifyBrandOnboardingUpdated()
  }, [state, hydrated])

  const updateIdentity = useCallback(
    (fields: { name: string; bio: string; industry: Niche; location: string }) => {
      dispatch({ type: "UPDATE_IDENTITY", ...fields })
    },
    []
  )

  const saveIdentity = useCallback(
    (fields: { name: string; bio: string; industry: Niche; location: string }) => {
      dispatch({ type: "SAVE_IDENTITY", ...fields })
    },
    []
  )

  const updateVerification = useCallback((workEmail: string, website: string) => {
    dispatch({ type: "UPDATE_VERIFICATION", workEmail, website })
  }, [])

  const verifyWorkEmail = useCallback(() => {
    dispatch({ type: "VERIFY_WORK_EMAIL" })
  }, [])

  const saveVerification = useCallback(
    (workEmail: string, website: string, workEmailVerified: boolean) => {
      dispatch({
        type: "SAVE_VERIFICATION",
        workEmail,
        website,
        workEmailVerified,
      })
    },
    []
  )

  const updatePresence = useCallback((social: BrandSocialLinks, logoUrl?: string) => {
    dispatch({ type: "UPDATE_PRESENCE", social, logoUrl })
  }, [])

  const savePresence = useCallback((social: BrandSocialLinks, logoUrl?: string) => {
    dispatch({ type: "SAVE_PRESENCE", social, logoUrl })
  }, [])

  const goToStep = useCallback((step: BrandOnboardingStep) => {
    dispatch({ type: "SET_STEP", step })
  }, [])

  const finishAndExit = useCallback(
    (payment?: PaymentDetails) => {
      let next = state
      if (payment) {
        next = saveBrandPaymentToState(next, payment)
      }
      next = finishBrandOnboardingSession(next)

      dispatch({ type: "HYDRATE", state: next })

      router.push(
        canLaunchBrandCampaigns(next)
          ? "/dashboard/brand?profileComplete=1"
          : "/dashboard/brand"
      )
    },
    [router, state]
  )

  const skipCurrentStep = useCallback(() => {
    if (state.currentStep >= BRAND_ONBOARDING_STEP_COUNT) {
      finishAndExit()
      return
    }
    dispatch({ type: "SKIP_STEP" })
  }, [finishAndExit, state.currentStep])

  const value = useMemo(
    () => ({
      state,
      hydrated,
      updateIdentity,
      saveIdentity,
      updateVerification,
      verifyWorkEmail,
      saveVerification,
      updatePresence,
      savePresence,
      goToStep,
      skipCurrentStep,
      finishAndExit,
    }),
    [
      state,
      hydrated,
      updateIdentity,
      saveIdentity,
      updateVerification,
      verifyWorkEmail,
      saveVerification,
      updatePresence,
      savePresence,
      goToStep,
      skipCurrentStep,
      finishAndExit,
    ]
  )

  return (
    <BrandOnboardingContext.Provider value={value}>
      {children}
    </BrandOnboardingContext.Provider>
  )
}

export function useBrandOnboarding() {
  const context = useContext(BrandOnboardingContext)
  if (!context) {
    throw new Error("useBrandOnboarding must be used within BrandOnboardingProvider")
  }
  return context
}
