"use client"

import { useCallback, useEffect, useState } from "react"

import {
  canParticipateInListings,
  getIncompleteRequirements,
  getOnboardingRequirements,
  getProfileCompletionPercent,
  getResumeOnboardingStep,
} from "@/lib/onboarding/progress"
import {
  getOnboardingState,
  loadOnboardingState,
  notifyOnboardingUpdated,
} from "@/lib/onboarding/storage"
import type { OnboardingState } from "@/lib/onboarding/types"

function readProgress(state: OnboardingState) {
  return {
    state,
    requirements: getOnboardingRequirements(state),
    incomplete: getIncompleteRequirements(state),
    canParticipate: canParticipateInListings(state),
    completionPercent: getProfileCompletionPercent(state),
    resumeStep: getResumeOnboardingStep(state),
  }
}

export function useOnboardingProgress() {
  const [snapshot, setSnapshot] = useState(() =>
    readProgress(getOnboardingState())
  )

  const refresh = useCallback(() => {
    setSnapshot(readProgress(getOnboardingState()))
  }, [])

  useEffect(() => {
    refresh()

    function handleStorage(event: StorageEvent) {
      if (
        event.key === "perkley-onboarding" ||
        event.key === null
      ) {
        refresh()
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("perkley-onboarding-updated", refresh)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("perkley-onboarding-updated", refresh)
    }
  }, [refresh])

  return {
    hydrated: loadOnboardingState() !== null || typeof window !== "undefined",
    ...snapshot,
    refresh,
  }
}

export { notifyOnboardingUpdated } from "@/lib/onboarding/storage"
