"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { useRouter } from "next/navigation"

import { canParticipateInListings } from "@/lib/onboarding/progress"
import { ONBOARDING_STEP_COUNT } from "@/lib/onboarding/constants"
import {
  createInitialOnboardingState,
  finishOnboardingState,
  onboardingReducer,
  savePaymentToState,
} from "@/lib/onboarding/state"
import {
  clearOnboardingPending,
  loadOnboardingState,
  notifyOnboardingUpdated,
  saveOnboardingState,
} from "@/lib/onboarding/storage"
import type {
  InstagramProfile,
  OnboardingState,
  OnboardingStep,
  PaymentDetails,
} from "@/lib/onboarding/types"

type OnboardingContextValue = {
  state: OnboardingState
  hydrated: boolean
  connectInstagram: (profile: InstagramProfile) => void
  advanceFromVerification: () => void
  saveContentProfile: (niches: string[], contentTypes: string[]) => void
  updateNiches: (niches: string[]) => void
  updateContentTypes: (contentTypes: string[]) => void
  goToStep: (step: OnboardingStep) => void
  skipCurrentStep: () => void
  finishAndExit: (payment?: PaymentDetails) => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const [state, dispatch] = useReducer(onboardingReducer, null, createInitialOnboardingState)

  useEffect(() => {
    const stored = loadOnboardingState()
    dispatch({ type: "HYDRATE", state: stored ?? createInitialOnboardingState() })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveOnboardingState(state)
    notifyOnboardingUpdated()
  }, [state, hydrated])

  const connectInstagram = useCallback((profile: InstagramProfile) => {
    dispatch({ type: "CONNECT_INSTAGRAM", profile })
  }, [])

  const advanceFromVerification = useCallback(() => {
    dispatch({ type: "ADVANCE_FROM_VERIFICATION" })
  }, [])

  const saveContentProfile = useCallback((niches: string[], contentTypes: string[]) => {
    dispatch({ type: "SAVE_CONTENT_PROFILE", niches, contentTypes })
  }, [])

  const updateNiches = useCallback((niches: string[]) => {
    dispatch({ type: "SET_NICHES", niches })
  }, [])

  const updateContentTypes = useCallback((contentTypes: string[]) => {
    dispatch({ type: "SET_CONTENT_TYPES", contentTypes })
  }, [])

  const goToStep = useCallback((step: OnboardingStep) => {
    dispatch({ type: "SET_STEP", step })
  }, [])

  const finishAndExit = useCallback(
    (payment?: PaymentDetails) => {
      let next = state
      if (payment) {
        next = savePaymentToState(next, payment)
      }
      next = finishOnboardingState(next)

      dispatch({ type: "HYDRATE", state: next })
      saveOnboardingState(next)
      notifyOnboardingUpdated()
      clearOnboardingPending()

      router.push(
        canParticipateInListings(next)
          ? "/dashboard?profileComplete=1"
          : "/dashboard"
      )
    },
    [router, state]
  )

  const skipCurrentStep = useCallback(() => {
    if (state.currentStep >= ONBOARDING_STEP_COUNT) {
      finishAndExit()
      return
    }
    dispatch({ type: "SKIP_STEP" })
  }, [finishAndExit, state.currentStep])

  const value = useMemo(
    () => ({
      state,
      hydrated,
      connectInstagram,
      advanceFromVerification,
      saveContentProfile,
      updateNiches,
      updateContentTypes,
      goToStep,
      skipCurrentStep,
      finishAndExit,
    }),
    [
      state,
      hydrated,
      connectInstagram,
      advanceFromVerification,
      saveContentProfile,
      updateNiches,
      updateContentTypes,
      goToStep,
      skipCurrentStep,
      finishAndExit,
    ]
  )

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider")
  }
  return context
}
