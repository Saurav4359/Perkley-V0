import { ONBOARDING_STEP_COUNT } from "@/lib/onboarding/constants"
import { canParticipateInListings, getOnboardingStepProgressPercent, getProfileCompletionPercent } from "@/lib/onboarding/progress"
import type { OnboardingAction, OnboardingState, OnboardingStep, PaymentDetails } from "@/lib/onboarding/types"

export function createInitialOnboardingState(): OnboardingState {
  return {
    currentStep: 1,
    displayName: "Saurav Sharma",
    instagram: null,
    niches: [],
    contentTypes: [],
    payment: null,
    profileCompletion: 0,
    creatorVerified: false,
    isOnboardingComplete: false,
  }
}

function stepProgress(step: number): number {
  return getOnboardingStepProgressPercent(
    Math.min(Math.max(step, 1), ONBOARDING_STEP_COUNT) as OnboardingStep
  )
}

export function getPreviousOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  if (step <= 1) return null
  return (step - 1) as OnboardingStep
}

export function getNextOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  if (step >= ONBOARDING_STEP_COUNT) return null
  return (step + 1) as OnboardingStep
}

export function savePaymentToState(
  state: OnboardingState,
  payment: PaymentDetails
): OnboardingState {
  return {
    ...state,
    payment,
    profileCompletion: Math.max(state.profileCompletion, stepProgress(ONBOARDING_STEP_COUNT)),
  }
}

export function finishOnboardingState(state: OnboardingState): OnboardingState {
  const canParticipate = canParticipateInListings(state)

  return {
    ...state,
    currentStep: ONBOARDING_STEP_COUNT,
    profileCompletion: canParticipate ? 100 : getProfileCompletionPercent(state),
    creatorVerified: canParticipate ? true : state.creatorVerified,
    isOnboardingComplete: canParticipate,
  }
}

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case "HYDRATE":
      return action.state
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.step,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(action.step - 1)),
      }
    case "CONNECT_INSTAGRAM":
      return {
        ...state,
        instagram: action.profile,
        currentStep: 2,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(1)),
      }
    case "SET_NICHES":
      return { ...state, niches: action.niches }
    case "SET_CONTENT_TYPES":
      return { ...state, contentTypes: action.contentTypes }
    case "SAVE_CONTENT_PROFILE":
      return advanceFromContentProfile({
        ...state,
        niches: action.niches,
        contentTypes: action.contentTypes,
      })
    case "SAVE_PAYMENT":
      return savePaymentToState(state, action.payment)
    case "UPDATE_PROFILE":
      return {
        ...state,
        displayName: action.displayName,
      }
    case "ADVANCE_FROM_VERIFICATION":
      return advanceFromVerification(state)
    case "SKIP_STEP": {
      if (state.currentStep >= ONBOARDING_STEP_COUNT) {
        return finishOnboardingState(state)
      }
      const nextStep = getNextOnboardingStep(state.currentStep)
      if (!nextStep) return finishOnboardingState(state)
      return {
        ...state,
        currentStep: nextStep,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(state.currentStep)),
      }
    }
    case "COMPLETE":
      return finishOnboardingState(state)
    default:
      return state
  }
}

export function advanceFromVerification(state: OnboardingState): OnboardingState {
  return {
    ...state,
    currentStep: 3,
    creatorVerified: state.instagram?.isProfessionalAccount ?? false,
    profileCompletion: Math.max(state.profileCompletion, stepProgress(2)),
  }
}

export function advanceFromContentProfile(state: OnboardingState): OnboardingState {
  return {
    ...state,
    currentStep: 4,
    profileCompletion: Math.max(state.profileCompletion, stepProgress(3)),
  }
}
