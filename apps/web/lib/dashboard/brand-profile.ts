import { BRAND_CAMPAIGNS, type BrandCampaign } from "@/lib/dashboard/mock-data"
import {
  brandInitialsFromName,
  getBrandProfileState,
  type StoredBrandProfile,
} from "@/lib/dashboard/brand-profile-storage"
import type { Niche } from "@/lib/dashboard/types"

export type BrandVerificationStatus = StoredBrandProfile["verificationStatus"]

export type BrandVisibility = StoredBrandProfile["visibility"]

export type BrandReview = {
  id: string
  creatorName: string
  creatorInitials: string
  rating: number
  text: string
  campaignTitle: string
  date: string
  reply?: string
}

export type BrandPastCampaign = {
  id: string
  title: string
  type: "bounty" | "campaign"
  startDate: string
  endDate: string
  status: "completed" | "cancelled"
}

export type BrandTrustSignals = {
  memberSince: string
  totalCampaigns: number
  completionRate: number
  averageRating: number
  reviewCount: number
  payoutTurnaround: string
}

export type BrandProfileData = {
  name: string
  initials: string
  accent: string
  logoUrl?: string
  bio: string
  website?: string
  workEmail?: string
  social: StoredBrandProfile["social"]
  industry: Niche
  location: string
  verified: boolean
  verificationStatus: BrandVerificationStatus
  visibility: BrandVisibility
  trustSignals: BrandTrustSignals
  reviews: BrandReview[]
  activeCampaigns: BrandCampaign[]
  pastCampaigns: BrandPastCampaign[]
  isOwnProfile: boolean
}

function campaignsForBrand(brandName: string) {
  return BRAND_CAMPAIGNS.filter((campaign) => campaign.brand === brandName)
}

function computeTrustSignals(
  activeCampaigns: BrandCampaign[],
  pastCampaigns: BrandPastCampaign[],
  reviews: BrandReview[],
  memberSince: string
): BrandTrustSignals {
  const completedCount = pastCampaigns.filter((c) => c.status === "completed").length
  const cancelledCount = pastCampaigns.filter((c) => c.status === "cancelled").length
  const totalFinished = completedCount + cancelledCount
  const totalCampaigns = activeCampaigns.length + pastCampaigns.length
  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0

  return {
    memberSince,
    totalCampaigns,
    completionRate:
      totalFinished > 0 ? Math.round((completedCount / totalFinished) * 100) : 100,
    averageRating: reviewCount > 0 ? Math.round(averageRating * 10) / 10 : 0,
    reviewCount,
    payoutTurnaround:
      reviewCount > 0 ? "Pays within 3 days of campaign end" : "Payout timeline not yet rated",
  }
}

export function buildBrandProfileFromStored(
  stored: StoredBrandProfile,
  options?: { isOwnProfile?: boolean }
): BrandProfileData {
  const brandCampaigns = campaignsForBrand(stored.name)
  const activeCampaigns = brandCampaigns.filter((campaign) =>
    ["live", "reviewing", "draft"].includes(campaign.status)
  )
  const pastCampaigns: BrandPastCampaign[] = brandCampaigns
    .filter((campaign) => campaign.status === "ended")
    .map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      type: campaign.type,
      startDate: new Date(Date.now() - campaign.dueInDays * 86400000 - 14 * 86400000)
        .toISOString()
        .slice(0, 10),
      endDate: new Date(Date.now() - campaign.dueInDays * 86400000).toISOString().slice(0, 10),
      status: "completed" as const,
    }))

  const reviews: BrandReview[] = []

  const trustSignals = computeTrustSignals(
    activeCampaigns,
    pastCampaigns,
    reviews,
    stored.memberSince
  )

  return {
    name: stored.name,
    initials: brandInitialsFromName(stored.name),
    accent: stored.accent,
    logoUrl: stored.logoUrl,
    industry: stored.industry,
    bio: stored.bio,
    website: stored.website,
    workEmail: stored.workEmail,
    social: stored.social,
    location: stored.location,
    verified: stored.verificationStatus === "verified",
    verificationStatus: stored.verificationStatus,
    visibility: stored.visibility,
    trustSignals,
    reviews,
    activeCampaigns,
    pastCampaigns,
    isOwnProfile: options?.isOwnProfile ?? true,
  }
}

export function buildBrandProfile(options?: { isOwnProfile?: boolean }): BrandProfileData {
  const stored = getBrandProfileState()
  return buildBrandProfileFromStored(stored, options)
}

export function formatBrandDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function brandProfilePatchFromData(
  updates: Partial<BrandProfileData>
): Partial<StoredBrandProfile> {
  const patch: Partial<StoredBrandProfile> = {}

  if (updates.name !== undefined) patch.name = updates.name
  if (updates.bio !== undefined) patch.bio = updates.bio
  if (updates.industry !== undefined) patch.industry = updates.industry
  if (updates.location !== undefined) patch.location = updates.location
  if (updates.website !== undefined) patch.website = updates.website
  if (updates.workEmail !== undefined) patch.workEmail = updates.workEmail
  if (updates.social !== undefined) patch.social = updates.social
  if (updates.logoUrl !== undefined) patch.logoUrl = updates.logoUrl
  if (updates.visibility !== undefined) patch.visibility = updates.visibility
  if (updates.verificationStatus !== undefined) {
    patch.verificationStatus = updates.verificationStatus
  }

  return patch
}
