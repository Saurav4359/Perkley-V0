import { apiFetch } from "@/lib/api/client"

export type PayoutMethod = {
  id: string
  type: "upi" | "bank"
  upiIdMasked: string | null
  accountNumberMasked: string | null
  verificationStatus: string
  isDefault: boolean
  createdAt: string
}

export type CreatorProfile = {
  userId: string
  displayName: string
  instagramHandle: string | null
  avatarUrl: string | null
  followersCount: number
  averageViews: number
  averageLikes: number
  location: string | null
  niches: string[]
  contentTypes: string[]
  verificationStatus: string
  trustScore: number
  completion: number
  payoutMethod: PayoutMethod | null
  portfolioCount: number
  updatedAt: string
}

export type BrandSocialLinks = {
  instagram?: string
  linkedin?: string
  twitter?: string
}

export type BrandProfile = {
  userId: string
  brandName: string
  bio: string | null
  industry: string | null
  website: string | null
  workEmail: string | null
  logoUrl: string | null
  socialLinks: BrandSocialLinks
  verificationStatus: string
  visibility: "public" | "private"
  trustScore: number
  completion: number
  updatedAt: string
}

export type UpdateCreatorProfileInput = {
  displayName?: string
  instagramHandle?: string
  location?: string
  niches?: string[]
  contentTypes?: Array<"reel" | "post" | "story">
}

export type UpdateBrandProfileInput = {
  brandName?: string
  bio?: string
  industry?: string
  website?: string
  workEmail?: string
  logoUrl?: string
  socialLinks?: BrandSocialLinks
  visibility?: "public" | "private"
}

export type UpsertPaymentDetailsInput =
  | { type: "upi"; upiId: string }
  | {
      type: "bank"
      accountHolder: string
      accountNumber: string
      ifsc: string
    }

export async function fetchCreatorProfile(): Promise<CreatorProfile> {
  const { profile } = await apiFetch<{ profile: CreatorProfile }>(
    "/api/creator/profile"
  )
  return profile
}

export async function updateCreatorProfile(
  input: UpdateCreatorProfileInput
): Promise<CreatorProfile> {
  const { profile } = await apiFetch<{ profile: CreatorProfile }>(
    "/api/creator/profile",
    { method: "PATCH", body: input }
  )
  return profile
}

export async function saveCreatorPaymentDetails(
  input: UpsertPaymentDetailsInput
): Promise<PayoutMethod> {
  const { paymentMethod } = await apiFetch<{ paymentMethod: PayoutMethod }>(
    "/api/creator/payment-details",
    { method: "PATCH", body: input }
  )
  return paymentMethod
}

export async function fetchBrandProfile(): Promise<BrandProfile> {
  const { profile } = await apiFetch<{ profile: BrandProfile }>(
    "/api/brand/profile"
  )
  return profile
}

export async function updateBrandProfile(
  input: UpdateBrandProfileInput
): Promise<BrandProfile> {
  const { profile } = await apiFetch<{ profile: BrandProfile }>(
    "/api/brand/profile",
    { method: "PATCH", body: input }
  )
  return profile
}
