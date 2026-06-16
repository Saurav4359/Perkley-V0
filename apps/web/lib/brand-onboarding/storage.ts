import {
  BRAND_ONBOARDING_PENDING_KEY,
  BRAND_ONBOARDING_STEP_COUNT,
  BRAND_ONBOARDING_STORAGE_KEY,
} from "@/lib/brand-onboarding/constants"
import { canLaunchBrandCampaigns } from "@/lib/brand-onboarding/progress"
import {
  createInitialBrandOnboardingState,
  finishBrandOnboardingState,
} from "@/lib/brand-onboarding/state"
import type { BrandOnboardingState } from "@/lib/brand-onboarding/types"
import {
  patchBrandProfileState,
  type BrandProfileSeed,
} from "@/lib/dashboard/brand-profile-storage"

export function normalizeBrandOnboardingState(
  value: Partial<BrandOnboardingState> | null,
  seed?: BrandProfileSeed
): BrandOnboardingState {
  const defaults = createInitialBrandOnboardingState(seed)
  if (!value) return defaults

  return {
    ...defaults,
    ...value,
    name: value.name?.trim() || defaults.name,
    bio: value.bio ?? defaults.bio,
    industry: value.industry ?? defaults.industry,
    location: value.location ?? defaults.location,
    website: value.website ?? defaults.website,
    workEmail: value.workEmail ?? defaults.workEmail,
    social: {
      ...defaults.social,
      ...value.social,
    },
    currentStep: Math.min(
      Math.max(value.currentStep ?? defaults.currentStep, 1),
      BRAND_ONBOARDING_STEP_COUNT
    ) as BrandOnboardingState["currentStep"],
  }
}

export function loadBrandOnboardingState(): BrandOnboardingState | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(BRAND_ONBOARDING_STORAGE_KEY)
    if (!raw) return null
    return normalizeBrandOnboardingState(JSON.parse(raw) as Partial<BrandOnboardingState>)
  } catch {
    return null
  }
}

export function getBrandOnboardingState(seed?: BrandProfileSeed): BrandOnboardingState {
  return normalizeBrandOnboardingState(loadBrandOnboardingState(), seed)
}

export function notifyBrandOnboardingUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("perkley-brand-onboarding-updated"))
}

export function syncBrandOnboardingToProfile(state: BrandOnboardingState) {
  patchBrandProfileState({
    name: state.name.trim() || undefined,
    bio: state.bio.trim(),
    industry: state.industry,
    location: state.location.trim(),
    website: state.website.trim() || undefined,
    workEmail: state.workEmail.trim() || undefined,
    social: state.social,
    logoUrl: state.logoUrl,
    verificationStatus: state.workEmailVerified ? "pending" : "not_started",
  })
}

export function saveBrandOnboardingState(state: BrandOnboardingState) {
  if (typeof window === "undefined") return

  const next = canLaunchBrandCampaigns(state)
    ? state
    : { ...state, isOnboardingComplete: false }

  try {
    localStorage.setItem(BRAND_ONBOARDING_STORAGE_KEY, JSON.stringify(next))
    syncBrandOnboardingToProfile(next)
  } catch {
    // ignore storage failures
  }
}

export function resetBrandOnboardingState(seed?: BrandProfileSeed): BrandOnboardingState {
  const state = createInitialBrandOnboardingState(seed)
  saveBrandOnboardingState(state)
  return state
}

export function isBrandOnboardingComplete(): boolean {
  const state = loadBrandOnboardingState()
  return state?.isOnboardingComplete === true
}

export function markBrandOnboardingPending() {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(BRAND_ONBOARDING_PENDING_KEY, "true")
  } catch {
    // ignore storage failures
  }
}

export function clearBrandOnboardingPending() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(BRAND_ONBOARDING_PENDING_KEY)
  } catch {
    // ignore storage failures
  }
}

export function isBrandOnboardingPending(): boolean {
  if (typeof window === "undefined") return false

  try {
    return localStorage.getItem(BRAND_ONBOARDING_PENDING_KEY) === "true"
  } catch {
    return false
  }
}

export function initBrandOnboardingSession(seed?: BrandProfileSeed): BrandOnboardingState {
  markBrandOnboardingPending()
  return resetBrandOnboardingState(seed)
}

export function finishBrandOnboardingSession(state: BrandOnboardingState): BrandOnboardingState {
  const next = finishBrandOnboardingState(state)
  saveBrandOnboardingState(next)
  notifyBrandOnboardingUpdated()
  clearBrandOnboardingPending()
  return next
}

export function getBrandDashboardPath(): string {
  if (isBrandOnboardingPending() && !isBrandOnboardingComplete()) {
    return "/brand-onboarding"
  }
  return "/dashboard/brand"
}

export function clearBrandOnboardingState() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(BRAND_ONBOARDING_STORAGE_KEY)
    localStorage.removeItem(BRAND_ONBOARDING_PENDING_KEY)
  } catch {
    // ignore storage failures
  }
}
