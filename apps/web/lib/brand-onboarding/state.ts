import { BRAND_ONBOARDING_STEP_COUNT } from "@/lib/brand-onboarding/constants"
import {
  canLaunchBrandCampaigns,
  getBrandOnboardingStepProgressPercent,
  getBrandProfileCompletionPercent,
} from "@/lib/brand-onboarding/progress"
import type {
  BrandOnboardingAction,
  BrandOnboardingState,
  BrandOnboardingStep,
} from "@/lib/brand-onboarding/types"
import type { PaymentDetails } from "@/lib/onboarding/types"
import type { BrandProfileSeed } from "@/lib/dashboard/brand-profile-storage"

export function createInitialBrandOnboardingState(seed?: BrandProfileSeed): BrandOnboardingState {
  return {
    currentStep: 1,
    name: seed?.name?.trim() || "",
    bio: "",
    industry: "lifestyle",
    location: "",
    website: seed?.website?.trim() || "",
    workEmail: seed?.workEmail?.trim() || "",
    workEmailVerified: false,
    social: {},
    logoUrl: undefined,
    payment: null,
    profileCompletion: 0,
    isOnboardingComplete: false,
  }
}

function stepProgress(step: number): number {
  return getBrandOnboardingStepProgressPercent(
    Math.min(Math.max(step, 1), BRAND_ONBOARDING_STEP_COUNT) as BrandOnboardingStep
  )
}

export function getPreviousBrandOnboardingStep(
  step: BrandOnboardingStep
): BrandOnboardingStep | null {
  if (step <= 1) return null
  return (step - 1) as BrandOnboardingStep
}

export function getNextBrandOnboardingStep(step: BrandOnboardingStep): BrandOnboardingStep | null {
  if (step >= BRAND_ONBOARDING_STEP_COUNT) return null
  return (step + 1) as BrandOnboardingStep
}

export function saveBrandPaymentToState(
  state: BrandOnboardingState,
  payment: PaymentDetails
): BrandOnboardingState {
  return {
    ...state,
    payment,
    profileCompletion: Math.max(state.profileCompletion, stepProgress(BRAND_ONBOARDING_STEP_COUNT)),
  }
}

export function finishBrandOnboardingState(state: BrandOnboardingState): BrandOnboardingState {
  const canLaunch = canLaunchBrandCampaigns(state)

  return {
    ...state,
    currentStep: BRAND_ONBOARDING_STEP_COUNT,
    profileCompletion: canLaunch ? 100 : getBrandProfileCompletionPercent(state),
    isOnboardingComplete: canLaunch,
  }
}

export function brandOnboardingReducer(
  state: BrandOnboardingState,
  action: BrandOnboardingAction
): BrandOnboardingState {
  switch (action.type) {
    case "HYDRATE":
      return action.state
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.step,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(action.step - 1)),
      }
    case "UPDATE_IDENTITY":
      return {
        ...state,
        name: action.name,
        bio: action.bio,
        industry: action.industry,
        location: action.location,
      }
    case "SAVE_IDENTITY":
      return {
        ...state,
        name: action.name,
        bio: action.bio,
        industry: action.industry,
        location: action.location,
        currentStep: 2,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(1)),
      }
    case "UPDATE_VERIFICATION":
      return {
        ...state,
        workEmail: action.workEmail,
        website: action.website,
        workEmailVerified:
          action.workEmail.trim() === state.workEmail.trim()
            ? state.workEmailVerified
            : false,
      }
    case "VERIFY_WORK_EMAIL":
      return {
        ...state,
        workEmailVerified: true,
      }
    case "SAVE_VERIFICATION":
      return {
        ...state,
        workEmail: action.workEmail,
        website: action.website,
        workEmailVerified: action.workEmailVerified,
        currentStep: 3,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(2)),
      }
    case "UPDATE_PRESENCE":
      return {
        ...state,
        social: action.social,
        logoUrl: action.logoUrl,
      }
    case "SAVE_PRESENCE":
      return {
        ...state,
        social: action.social,
        logoUrl: action.logoUrl,
        currentStep: 4,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(3)),
      }
    case "SAVE_PAYMENT":
      return saveBrandPaymentToState(state, action.payment)
    case "SKIP_STEP": {
      if (state.currentStep >= BRAND_ONBOARDING_STEP_COUNT) {
        return finishBrandOnboardingState(state)
      }
      const nextStep = getNextBrandOnboardingStep(state.currentStep)
      if (!nextStep) return finishBrandOnboardingState(state)
      return {
        ...state,
        currentStep: nextStep,
        profileCompletion: Math.max(state.profileCompletion, stepProgress(state.currentStep)),
      }
    }
    case "COMPLETE":
      return finishBrandOnboardingState(state)
    default:
      return state
  }
}
