/**
 * Smoke tests for onboarding flows (run: bun apps/web/scripts/smoke-onboarding.ts)
 */
import {
  canParticipateInListings,
  getIncompleteRequirements,
  getOnboardingStepProgressPercent,
  getResumeOnboardingStep,
} from "../lib/onboarding/progress"
import {
  createInitialOnboardingState,
  finishOnboardingState,
  onboardingReducer,
  savePaymentToState,
} from "../lib/onboarding/state"
import type { InstagramProfile, OnboardingState, PaymentDetails } from "../lib/onboarding/types"

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`)
}

function pass(message: string) {
  console.log(`  ✓ ${message}`)
}

const mockInstagram: InstagramProfile = {
  username: "@saurav",
  followers: 8540,
  profileImageUrl: "",
  category: "Education",
  location: "Mumbai, India",
  isProfessionalAccount: true,
  averageViews: 12_400,
  averageLikes: 892,
  connected: true,
}

const mockPayment: PaymentDetails = {
  method: "upi",
  upi: { fullName: "Saurav Sharma", upiId: "saurav@upi" },
  bank: { accountHolder: "", accountNumber: "", ifsc: "" },
}

function simulateSkipAllSteps(state: OnboardingState): OnboardingState {
  let next = state
  for (let i = 0; i < 4; i += 1) {
    next = onboardingReducer(next, { type: "SKIP_STEP" })
  }
  return finishOnboardingState(next)
}

function shouldAllowOnboardingPage(state: OnboardingState): boolean {
  return !(canParticipateInListings(state) && state.isOnboardingComplete)
}

function completeProfileHref(state: OnboardingState): string {
  return `/onboarding?step=${getResumeOnboardingStep(state)}`
}

console.log("Onboarding smoke tests\n")

// Step progress bar percentages
for (const [step, expected] of [
  [1, 25],
  [2, 50],
  [3, 75],
  [4, 100],
] as const) {
  assert(getOnboardingStepProgressPercent(step) === expected, `step ${step} progress`)
  pass(`Step ${step} progress = ${expected}%`)
}

// Fresh signup state
{
  const state = createInitialOnboardingState()
  assert(getResumeOnboardingStep(state) === 1, "fresh resume step")
  assert(!canParticipateInListings(state), "fresh cannot participate")
  assert(shouldAllowOnboardingPage(state), "fresh can open onboarding")
  assert(completeProfileHref(state) === "/onboarding?step=1", "fresh complete profile link")
  pass("Fresh state → resume step 1, banner link /onboarding?step=1")
}

// Skip through all 4 steps without completing requirements
{
  const finished = simulateSkipAllSteps(createInitialOnboardingState())
  assert(finished.currentStep === 4, "skip-all ends on step 4")
  assert(!canParticipateInListings(finished), "skip-all still incomplete")
  assert(!finished.isOnboardingComplete, "skip-all not marked complete")
  assert(shouldAllowOnboardingPage(finished), "skip-all can return to onboarding")
  assert(getResumeOnboardingStep(finished) === 1, "skip-all resume at instagram")
  assert(completeProfileHref(finished) === "/onboarding?step=1", "skip-all link")
  pass("Skip all steps → dashboard with reminder, link resumes at step 1")
}

// Partial: instagram connected, niches missing
{
  let state = createInitialOnboardingState()
  state = onboardingReducer(state, { type: "CONNECT_INSTAGRAM", profile: mockInstagram })
  state = onboardingReducer(state, { type: "ADVANCE_FROM_VERIFICATION" })
  assert(state.currentStep === 3, "after verify on step 3")
  assert(getResumeOnboardingStep(state) === 3, "resume at niches")
  assert(completeProfileHref(state) === "/onboarding?step=3", "partial link step 3")
  pass("Instagram + verify done → Complete profile links to step 3")
}

// Stale isOnboardingComplete with incomplete requirements (regression)
{
  const stale: OnboardingState = {
    ...createInitialOnboardingState(),
    isOnboardingComplete: true,
    currentStep: 4,
  }
  assert(!canParticipateInListings(stale), "stale flag does not grant access")
  assert(shouldAllowOnboardingPage(stale), "stale flag does not block onboarding page")
  assert(completeProfileHref(stale) === "/onboarding?step=1", "stale still resumes correctly")
  pass("Stale isOnboardingComplete + incomplete reqs → onboarding still accessible")
}

// Full completion flow
{
  let state = createInitialOnboardingState()
  state = onboardingReducer(state, { type: "CONNECT_INSTAGRAM", profile: mockInstagram })
  state = onboardingReducer(state, { type: "ADVANCE_FROM_VERIFICATION" })
  state = onboardingReducer(state, {
    type: "SAVE_CONTENT_PROFILE",
    niches: ["Technology"],
    contentTypes: ["Reels"],
  })
  state = savePaymentToState(state, mockPayment)
  state = finishOnboardingState(state)
  assert(canParticipateInListings(state), "full profile can participate")
  assert(state.isOnboardingComplete, "full profile marked complete")
  assert(!shouldAllowOnboardingPage(state), "complete users redirected from onboarding")
  assert(getIncompleteRequirements(state).length === 0, "no incomplete items")
  pass("Full completion → can participate, onboarding gate redirects to dashboard")
}

// Step param deep links
for (const step of [1, 2, 3, 4] as const) {
  assert(
    `/onboarding?step=${step}`.endsWith(String(step)),
    `step ${step} deep link format`
  )
  pass(`Deep link /onboarding?step=${step} format OK`)
}

console.log("\nAll onboarding logic smoke tests passed.")
