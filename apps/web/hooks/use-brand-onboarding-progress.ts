"use client"

import { useCallback, useEffect, useState } from "react"

import {
  canLaunchBrandCampaigns,
  getBrandOnboardingRequirements,
  getBrandProfileCompletionPercent,
  getResumeBrandOnboardingStep,
} from "@/lib/brand-onboarding/progress"
import {
  getBrandOnboardingState,
  loadBrandOnboardingState,
  notifyBrandOnboardingUpdated,
} from "@/lib/brand-onboarding/storage"
import type { BrandOnboardingState } from "@/lib/brand-onboarding/types"

function readProgress(state: BrandOnboardingState) {
  return {
    state,
    requirements: getBrandOnboardingRequirements(state),
    incomplete: getBrandOnboardingRequirements(state).filter((item) => !item.done),
    canLaunch: canLaunchBrandCampaigns(state),
    completionPercent: getBrandProfileCompletionPercent(state),
    resumeStep: getResumeBrandOnboardingStep(state),
  }
}

export function useBrandOnboardingProgress() {
  const [snapshot, setSnapshot] = useState(() => readProgress(getBrandOnboardingState()))

  const refresh = useCallback(() => {
    setSnapshot(readProgress(getBrandOnboardingState()))
  }, [])

  useEffect(() => {
    refresh()

    function handleStorage(event: StorageEvent) {
      if (event.key === "perkley-brand-onboarding" || event.key === null) {
        refresh()
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("perkley-brand-onboarding-updated", refresh)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("perkley-brand-onboarding-updated", refresh)
    }
  }, [refresh])

  return {
    hydrated: loadBrandOnboardingState() !== null || typeof window !== "undefined",
    ...snapshot,
    refresh,
  }
}

export { notifyBrandOnboardingUpdated } from "@/lib/brand-onboarding/storage"
