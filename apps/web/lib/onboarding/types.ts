export type UserRole = "creator" | "brand"

export type OnboardingStep = 1 | 2 | 3 | 4

export type PaymentMethod = "upi" | "bank"

export type InstagramProfile = {
  username: string
  followers: number
  profileImageUrl: string
  category: string
  location: string
  isProfessionalAccount: boolean
  averageViews: number
  averageLikes: number
  connected: boolean
}

export type UpiPayment = {
  fullName: string
  upiId: string
}

export type BankPayment = {
  accountHolder: string
  accountNumber: string
  ifsc: string
}

export type PaymentDetails = {
  method: PaymentMethod
  upi: UpiPayment
  bank: BankPayment
}

export type OnboardingState = {
  currentStep: OnboardingStep
  displayName: string
  instagram: InstagramProfile | null
  niches: string[]
  contentTypes: string[]
  payment: PaymentDetails | null
  profileCompletion: number
  creatorVerified: boolean
  isOnboardingComplete: boolean
}

export type OnboardingAction =
  | { type: "SET_STEP"; step: OnboardingStep }
  | { type: "CONNECT_INSTAGRAM"; profile: InstagramProfile }
  | { type: "SET_NICHES"; niches: string[] }
  | { type: "SET_CONTENT_TYPES"; contentTypes: string[] }
  | { type: "SAVE_CONTENT_PROFILE"; niches: string[]; contentTypes: string[] }
  | { type: "SAVE_PAYMENT"; payment: PaymentDetails }
  | { type: "UPDATE_PROFILE"; displayName: string }
  | { type: "ADVANCE_FROM_VERIFICATION" }
  | { type: "SKIP_STEP" }
  | { type: "COMPLETE" }
  | { type: "HYDRATE"; state: OnboardingState }
