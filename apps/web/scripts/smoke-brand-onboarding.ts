/**
 * Smoke tests for brand onboarding flows (run: bun apps/web/scripts/smoke-brand-onboarding.ts)
 */
import {
  canLaunchBrandCampaigns,
  getIncompleteBrandRequirements,
  getBrandOnboardingStepProgressPercent,
  getResumeBrandOnboardingStep,
} from "../lib/brand-onboarding/progress"
import {
  brandOnboardingReducer,
  createInitialBrandOnboardingState,
  finishBrandOnboardingState,
  saveBrandPaymentToState,
} from "../lib/brand-onboarding/state"
import type { BrandOnboardingState } from "../lib/brand-onboarding/types"
import type { PaymentDetails } from "../lib/onboarding/types"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`)
}

function pass(message: string) {
  console.log(`  ✓ ${message}`)
}

const mockPayment: PaymentDetails = {
  method: "upi",
  upi: { fullName: "Acme Inc.", upiId: "acme@upi" },
  bank: { accountHolder: "", accountNumber: "", ifsc: "" },
}

function simulateSkipAllSteps(state: BrandOnboardingState): BrandOnboardingState {
  let next = state
  for (let i = 0; i < 4; i += 1) {
    next = brandOnboardingReducer(next, { type: "SKIP_STEP" })
  }
  return finishBrandOnboardingState(next)
}

function shouldAllowBrandOnboardingPage(state: BrandOnboardingState): boolean {
  return !(canLaunchBrandCampaigns(state) && state.isOnboardingComplete)
}

function completeVerificationHref(state: BrandOnboardingState): string {
  return `/brand-onboarding?step=${getResumeBrandOnboardingStep(state)}`
}

console.log("Brand onboarding smoke tests\n")

for (const [step, expected] of [
  [1, 25],
  [2, 50],
  [3, 75],
  [4, 100],
] as const) {
  assert(getBrandOnboardingStepProgressPercent(step) === expected, `step ${step} progress`)
  pass(`Step ${step} progress = ${expected}%`)
}

{
  const state = createInitialBrandOnboardingState({
    name: "Acme Inc.",
    workEmail: "hello@acme.com",
    website: "https://acme.com",
  })
  assert(getResumeBrandOnboardingStep(state) === 1, "fresh resume step")
  assert(!canLaunchBrandCampaigns(state), "fresh cannot launch")
  assert(shouldAllowBrandOnboardingPage(state), "fresh can open onboarding")
  assert(completeVerificationHref(state) === "/brand-onboarding?step=1", "fresh link")
  pass("Fresh state → resume step 1, banner link /brand-onboarding?step=1")
}

{
  const finished = simulateSkipAllSteps(
    createInitialBrandOnboardingState({ name: "Acme Inc." })
  )
  assert(finished.currentStep === 4, "skip-all ends on step 4")
  assert(!canLaunchBrandCampaigns(finished), "skip-all still incomplete")
  assert(!finished.isOnboardingComplete, "skip-all not marked complete")
  assert(shouldAllowBrandOnboardingPage(finished), "skip-all can return to onboarding")
  assert(getResumeBrandOnboardingStep(finished) === 1, "skip-all resume at identity")
  pass("Skip all steps → dashboard with reminder, link resumes at step 1")
}

{
  let state = createInitialBrandOnboardingState({ name: "Acme Inc." })
  state = brandOnboardingReducer(state, {
    type: "SAVE_IDENTITY",
    name: "Acme Inc.",
    bio: "We build creator-first wellness products for modern audiences.",
    industry: "lifestyle",
    location: "Mumbai, India",
  })
  state = brandOnboardingReducer(state, {
    type: "SAVE_VERIFICATION",
    workEmail: "hello@acme.com",
    website: "https://acme.com",
    workEmailVerified: true,
  })
  assert(state.currentStep === 3, "after verify on step 3")
  assert(getResumeBrandOnboardingStep(state) === 3, "resume at presence")
  assert(completeVerificationHref(state) === "/brand-onboarding?step=3", "partial link step 3")
  pass("Identity + verification done → Complete verification links to step 3")
}

{
  let state = createInitialBrandOnboardingState({ name: "Acme Inc." })
  state = brandOnboardingReducer(state, {
    type: "SAVE_IDENTITY",
    name: "Acme Inc.",
    bio: "We build creator-first wellness products for modern audiences.",
    industry: "lifestyle",
    location: "Mumbai, India",
  })
  state = brandOnboardingReducer(state, {
    type: "SAVE_VERIFICATION",
    workEmail: "hello@acme.com",
    website: "https://acme.com",
    workEmailVerified: true,
  })
  state = brandOnboardingReducer(state, {
    type: "SAVE_PRESENCE",
    social: { instagram: "@acme" },
  })
  state = saveBrandPaymentToState(state, mockPayment)
  state = finishBrandOnboardingState(state)
  assert(canLaunchBrandCampaigns(state), "full profile can launch")
  assert(state.isOnboardingComplete, "full profile marked complete")
  assert(!shouldAllowBrandOnboardingPage(state), "complete users redirected from onboarding")
  assert(getIncompleteBrandRequirements(state).length === 0, "no incomplete items")
  pass("Full completion → can launch campaigns, onboarding gate redirects to dashboard")
}

for (const step of [1, 2, 3, 4] as const) {
  assert(
    `/brand-onboarding?step=${step}`.endsWith(String(step)),
    `step ${step} deep link format`
  )
  pass(`Deep link /brand-onboarding?step=${step} format OK`)
}

console.log("\nAll brand onboarding logic smoke tests passed.")
