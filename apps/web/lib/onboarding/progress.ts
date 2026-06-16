import { ONBOARDING_STEP_COUNT } from "@/lib/onboarding/constants"
import type { OnboardingState, OnboardingStep } from "@/lib/onboarding/types"
import { validatePayment } from "@/lib/onboarding/validation"

export type OnboardingRequirement = {
  id: "instagram" | "verification" | "niches" | "content-types" | "payment"
  label: string
  step: OnboardingStep
  done: boolean
}

export function getOnboardingStepProgressPercent(step: OnboardingStep): number {
  if (ONBOARDING_STEP_COUNT <= 1) return 100

  const startPercent = 20
  const stepIndex = step - 1
  const intervals = ONBOARDING_STEP_COUNT - 1

  return Math.round(startPercent + (stepIndex / intervals) * (100 - startPercent))
}

export function getOnboardingRequirements(state: OnboardingState): OnboardingRequirement[] {
  const instagramConnected = state.instagram !== null
  const verified =
    instagramConnected &&
    state.instagram!.isProfessionalAccount &&
    (state.creatorVerified || state.currentStep >= 3)
  const nichesDone = state.niches.length > 0
  const contentTypesDone = state.contentTypes.length > 0
  const paymentDone =
    state.payment !== null && validatePayment(state.payment) === null

  return [
    {
      id: "instagram",
      label: "Connect Instagram",
      step: 1,
      done: instagramConnected,
    },
    {
      id: "verification",
      label: "Verify your profile",
      step: 2,
      done: verified,
    },
    {
      id: "niches",
      label: "Select your niches",
      step: 3,
      done: nichesDone,
    },
    {
      id: "content-types",
      label: "Choose content types",
      step: 3,
      done: contentTypesDone,
    },
    {
      id: "payment",
      label: "Add payout details",
      step: 4,
      done: paymentDone,
    },
  ]
}

export function getIncompleteRequirements(state: OnboardingState) {
  return getOnboardingRequirements(state).filter((item) => !item.done)
}

export function canParticipateInListings(state: OnboardingState): boolean {
  return getIncompleteRequirements(state).length === 0
}

export function getResumeOnboardingStep(state: OnboardingState): OnboardingStep {
  const incomplete = getIncompleteRequirements(state)
  if (incomplete.length === 0) {
    return ONBOARDING_STEP_COUNT
  }
  return incomplete[0]!.step
}

export function getProfileCompletionPercent(state: OnboardingState): number {
  const requirements = getOnboardingRequirements(state)
  const doneCount = requirements.filter((item) => item.done).length
  return Math.round((doneCount / requirements.length) * 100)
}

export function getOnboardingStepLabel(step: OnboardingStep): string {
  switch (step) {
    case 1:
      return "Connect Instagram"
    case 2:
      return "Verify profile"
    case 3:
      return "Niches & content"
    case 4:
      return "Payout details"
    default:
      return `Step ${step}`
  }
}

export function formatOnboardingStepCount(step: OnboardingStep): string {
  return `Step ${step} of ${ONBOARDING_STEP_COUNT}`
}
