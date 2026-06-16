export const ONBOARDING_STORAGE_KEY = "perkley-onboarding"
export const USER_ROLE_STORAGE_KEY = "perkley-user-role"
export const ONBOARDING_PENDING_KEY = "perkley-onboarding-pending"
export const BRAND_PROFILE_STORAGE_KEY = "perkley-brand-profile"

export const ONBOARDING_STEP_COUNT = 4

export const ONBOARDING_NICHES = [
  "Technology",
  "Finance",
  "Education",
  "Fitness",
  "Travel",
  "Fashion",
  "Gaming",
  "Food",
  "Lifestyle",
  "Comedy",
  "Music",
  "Business",
] as const

export type OnboardingNiche = (typeof ONBOARDING_NICHES)[number]

export const ONBOARDING_CONTENT_TYPES = [
  "Reels",
  "Stories",
  "Posts",
  "Carousel",
  "UGC",
] as const

export type OnboardingContentType = (typeof ONBOARDING_CONTENT_TYPES)[number]

export const MOCK_INSTAGRAM_PROFILE = {
  username: "@saurav",
  followers: 8540,
  profileImageUrl: "",
  category: "Education",
  location: "Mumbai, India",
  isProfessionalAccount: true,
  averageViews: 12_400,
  averageLikes: 892,
} as const
