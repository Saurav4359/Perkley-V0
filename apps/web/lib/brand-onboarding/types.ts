import type { PaymentDetails } from "@/lib/onboarding/types"
import type { Niche } from "@/lib/dashboard/types"

export type BrandOnboardingStep = 1 | 2 | 3 | 4

export type BrandSocialLinks = {
  instagram?: string
  linkedin?: string
  twitter?: string
}

export type BrandOnboardingState = {
  currentStep: BrandOnboardingStep
  name: string
  bio: string
  industry: Niche
  location: string
  website: string
  workEmail: string
  workEmailVerified: boolean
  social: BrandSocialLinks
  logoUrl?: string
  payment: PaymentDetails | null
  profileCompletion: number
  isOnboardingComplete: boolean
}

export type BrandOnboardingAction =
  | { type: "HYDRATE"; state: BrandOnboardingState }
  | { type: "SET_STEP"; step: BrandOnboardingStep }
  | { type: "UPDATE_IDENTITY"; name: string; bio: string; industry: Niche; location: string }
  | { type: "SAVE_IDENTITY"; name: string; bio: string; industry: Niche; location: string }
  | { type: "UPDATE_VERIFICATION"; workEmail: string; website: string }
  | { type: "VERIFY_WORK_EMAIL" }
  | { type: "SAVE_VERIFICATION"; workEmail: string; website: string; workEmailVerified: boolean }
  | { type: "UPDATE_PRESENCE"; social: BrandSocialLinks; logoUrl?: string }
  | { type: "SAVE_PRESENCE"; social: BrandSocialLinks; logoUrl?: string }
  | { type: "SAVE_PAYMENT"; payment: PaymentDetails }
  | { type: "SKIP_STEP" }
  | { type: "COMPLETE" }
