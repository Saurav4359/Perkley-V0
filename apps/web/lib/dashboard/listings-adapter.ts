import type { BrandCampaign, Campaign } from "@/lib/dashboard/feed-types"
import { LISTINGS } from "@/lib/dashboard/listings-data"
import type { Listing } from "@/lib/dashboard/types"
import { formatInr } from "@/lib/dashboard/utils"

export function listingToFeedItem(listing: Listing): Campaign {
  const reward =
    listing.type === "bounty"
      ? formatInr(listing.totalBudget)
      : formatInr(listing.fixedReward)

  return {
    id: listing.id,
    title: listing.title,
    brand: listing.brandName,
    type: listing.type,
    niche: listing.niche,
    reward,
    dueInDays: listing.dueInDays,
    slotsLeft: listing.type === "bounty" ? listing.competingCount : listing.spotsLeft,
    initials: listing.brandInitials,
    accent: listing.brandAccent,
    tagline:
      listing.type === "bounty"
        ? `${listing.competingCount} competing`
        : `${listing.spotsLeft} spots left`,
    rewardLabel:
      listing.type === "bounty"
        ? formatInr(listing.totalBudget)
        : `₹${formatInr(listing.fixedReward)} per creator`,
    status: listing.status,
    fixedReward: listing.type === "campaign" ? listing.fixedReward : undefined,
    totalBudget: listing.totalBudget,
    competingCount: listing.type === "bounty" ? listing.competingCount : undefined,
    verified: ["Northline Skincare", "VaultPay", "PulseFit"].includes(listing.brandName),
    trending: listing.id === "b1" || listing.id === "b2",
    isNew: listing.dueInDays >= 12,
    maxCompetitors:
      listing.type === "bounty"
        ? listing.competingCount + Math.round(listing.competingCount * 0.4)
        : undefined,
    fillPercent:
      listing.type === "bounty"
        ? (() => {
            const max = listing.competingCount + Math.round(listing.competingCount * 0.4)
            return Math.min(99, Math.round((listing.competingCount / max) * 100))
          })()
        : undefined,
    filledCount: listing.type === "bounty" ? listing.competingCount : undefined,
    joinedAvatars: ["MC", "JO", "PS", "AR", "SL"].slice(0, 4),
    joinedTotal:
      listing.type === "campaign" ? listing.maxCreators - listing.spotsLeft : undefined,
    rewardSortValue: listing.type === "bounty" ? listing.totalBudget : listing.fixedReward,
  }
}

export function listingToBrandItem(listing: Listing): BrandCampaign {
  const base = listingToFeedItem(listing)
  const brandStatus =
    listing.status === "active"
      ? "live"
      : listing.status === "closed"
        ? "reviewing"
        : listing.status === "completed"
          ? "ended"
          : "draft"

  return {
    ...base,
    status: brandStatus,
    submissions: listing.type === "bounty" ? listing.competingCount : listing.maxCreators - listing.spotsLeft,
    spots: listing.type === "bounty" ? listing.competingCount : listing.maxCreators,
  }
}

export const CREATOR_LISTINGS = LISTINGS.filter((l) => l.status === "active").map(listingToFeedItem)

export const BRAND_LISTINGS = LISTINGS.map(listingToBrandItem)
