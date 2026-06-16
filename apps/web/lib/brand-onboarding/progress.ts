import { BRAND_ONBOARDING_STEP_COUNT } from "@/lib/brand-onboarding/constants"
import type { BrandOnboardingState, BrandOnboardingStep } from "@/lib/brand-onboarding/types"
import {
  validateBrandBio,
  validateBrandIdentity,
  validateBrandLocation,
  validateBrandName,
  validateBrandSocial,
  validateBrandWebsite,
  validateWorkEmail,
} from "@/lib/brand-onboarding/validation"
import { validatePayment } from "@/lib/onboarding/validation"

export type BrandOnboardingRequirement = {
  id: "identity" | "verification" | "presence" | "billing"
  label: string
  step: BrandOnboardingStep
  done: boolean
}

export function getBrandOnboardingStepProgressPercent(step: BrandOnboardingStep): number {
  return Math.round((step / BRAND_ONBOARDING_STEP_COUNT) * 100)
}

export function getBrandOnboardingRequirements(
  state: BrandOnboardingState
): BrandOnboardingRequirement[] {
  const identityDone =
    validateBrandName(state.name) === null &&
    validateBrandBio(state.bio) === null &&
    validateBrandLocation(state.location) === null &&
    Boolean(state.industry)

  const verificationDone =
    validateWorkEmail(state.workEmail) === null &&
    validateBrandWebsite(state.website) === null &&
    state.workEmailVerified

  const presenceDone = validateBrandSocial(state.social) === null

  const billingDone =
    state.payment !== null && validatePayment(state.payment) === null

  return [
    {
      id: "identity",
      label: "Brand identity",
      step: 1,
      done: identityDone,
    },
    {
      id: "verification",
      label: "Verify business email",
      step: 2,
      done: verificationDone,
    },
    {
      id: "presence",
      label: "Add social presence",
      step: 3,
      done: presenceDone,
    },
    {
      id: "billing",
      label: "Add billing details",
      step: 4,
      done: billingDone,
    },
  ]
}

export function getIncompleteBrandRequirements(state: BrandOnboardingState) {
  return getBrandOnboardingRequirements(state).filter((item) => !item.done)
}

export function canLaunchBrandCampaigns(state: BrandOnboardingState): boolean {
  return getIncompleteBrandRequirements(state).length === 0
}

export function getResumeBrandOnboardingStep(state: BrandOnboardingState): BrandOnboardingStep {
  const incomplete = getIncompleteBrandRequirements(state)
  if (incomplete.length === 0) {
    return BRAND_ONBOARDING_STEP_COUNT
  }
  return incomplete[0]!.step
}

export function getBrandProfileCompletionPercent(state: BrandOnboardingState): number {
  const requirements = getBrandOnboardingRequirements(state)
  const doneCount = requirements.filter((item) => item.done).length
  return Math.round((doneCount / requirements.length) * 100)
}

export function getBrandOnboardingStepLabel(step: BrandOnboardingStep): string {
  switch (step) {
    case 1:
      return "Brand identity"
    case 2:
      return "Business verification"
    case 3:
      return "Social presence"
    case 4:
      return "Billing details"
    default:
      return `Step ${step}`
  }
}

export function validateBrandIdentityFields(state: BrandOnboardingState): string | null {
  return validateBrandIdentity(state.name, state.bio, state.industry, state.location)
}
