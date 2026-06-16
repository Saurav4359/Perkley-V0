import {
  ONBOARDING_PENDING_KEY,
  ONBOARDING_STEP_COUNT,
  ONBOARDING_STORAGE_KEY,
  USER_ROLE_STORAGE_KEY,
} from "@/lib/onboarding/constants"
import {
  BRAND_ONBOARDING_STORAGE_KEY,
} from "@/lib/brand-onboarding/constants"
import {
  clearBrandOnboardingState,
  initBrandOnboardingSession,
  markBrandOnboardingPending,
} from "@/lib/brand-onboarding/storage"
import {
  clearBrandProfileState,
  mergeBrandProfileSeed,
  saveBrandProfileFromSignup,
  type BrandProfileSeed,
} from "@/lib/dashboard/brand-profile-storage"
import { canParticipateInListings } from "@/lib/onboarding/progress"
import { createInitialOnboardingState } from "@/lib/onboarding/state"
import type { OnboardingState, UserRole } from "@/lib/onboarding/types"

function isUserRole(value: string | null): value is UserRole {
  return value === "creator" || value === "brand"
}

export function normalizeOnboardingState(value: Partial<OnboardingState> | null): OnboardingState {
  const defaults = createInitialOnboardingState()
  if (!value) return defaults

  return {
    ...defaults,
    ...value,
    displayName: value.displayName?.trim() || defaults.displayName,
    niches: value.niches ?? defaults.niches,
    contentTypes: value.contentTypes ?? defaults.contentTypes,
    currentStep: Math.min(
      Math.max(value.currentStep ?? defaults.currentStep, 1),
      ONBOARDING_STEP_COUNT
    ) as OnboardingState["currentStep"],
  }
}

export function getUserRole(): UserRole | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(USER_ROLE_STORAGE_KEY)
    return isUserRole(stored) ? stored : null
  } catch {
    return null
  }
}

export function setUserRole(role: UserRole) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(USER_ROLE_STORAGE_KEY, role)
  } catch {
    // ignore storage failures
  }
}

export function loadOnboardingState(): OnboardingState | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!raw) return null
    return normalizeOnboardingState(JSON.parse(raw) as Partial<OnboardingState>)
  } catch {
    return null
  }
}

export function getOnboardingState(): OnboardingState {
  return normalizeOnboardingState(loadOnboardingState())
}

export function notifyOnboardingUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("perkley-onboarding-updated"))
}

export function patchOnboardingState(
  patch: Partial<
    Pick<OnboardingState, "displayName" | "niches" | "contentTypes" | "payment">
  >
): OnboardingState {
  const next = normalizeOnboardingState({
    ...getOnboardingState(),
    ...patch,
  })
  saveOnboardingState(next)
  notifyOnboardingUpdated()
  return next
}

export function saveOnboardingState(state: OnboardingState) {
  if (typeof window === "undefined") return

  const next = canParticipateInListings(state)
    ? state
    : { ...state, isOnboardingComplete: false }

  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage failures
  }
}

export function resetOnboardingState(): OnboardingState {
  const state = createInitialOnboardingState()
  saveOnboardingState(state)
  return state
}

export function isOnboardingComplete(): boolean {
  const state = loadOnboardingState()
  return state?.isOnboardingComplete === true
}

export function markOnboardingPending() {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(ONBOARDING_PENDING_KEY, "true")
  } catch {
    // ignore storage failures
  }
}

export function clearOnboardingPending() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(ONBOARDING_PENDING_KEY)
  } catch {
    // ignore storage failures
  }
}

export function isOnboardingPending(): boolean {
  if (typeof window === "undefined") return false

  try {
    return localStorage.getItem(ONBOARDING_PENDING_KEY) === "true"
  } catch {
    return false
  }
}

export function initCreatorSession() {
  setUserRole("creator")
  markOnboardingPending()
  return resetOnboardingState()
}

export function initBrandSession(
  seed?: BrandProfileSeed,
  options?: { fromSignup?: boolean }
) {
  setUserRole("brand")
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const profileSeed = seed?.name?.trim()
    ? {
        name: seed.name.trim(),
        website: seed.website,
        workEmail: seed.workEmail,
      }
    : seed

  if (options?.fromSignup && seed?.name?.trim()) {
    saveBrandProfileFromSignup({
      name: seed.name.trim(),
      website: seed.website,
      workEmail: seed.workEmail,
    })
    initBrandOnboardingSession(profileSeed)
    return
  }

  mergeBrandProfileSeed(profileSeed)

  const existingOnboarding = typeof window !== "undefined"
    ? localStorage.getItem(BRAND_ONBOARDING_STORAGE_KEY)
    : null

  if (!existingOnboarding) {
    initBrandOnboardingSession(profileSeed)
    return
  }

  markBrandOnboardingPending()
}

export function getCreatorDashboardPath(): string {
  if (isOnboardingPending() && !isOnboardingComplete()) {
    return "/onboarding"
  }
  return "/dashboard"
}

export function clearUserSession() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(USER_ROLE_STORAGE_KEY)
    localStorage.removeItem(ONBOARDING_PENDING_KEY)
  } catch {
    // ignore storage failures
  }
  clearBrandProfileState()
  clearBrandOnboardingState()
}
