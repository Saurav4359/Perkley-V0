import type {
  ApiCampaign,
  ApiCampaignStatus,
} from "@/lib/api/campaigns"
import type { ListingDetail } from "@/lib/dashboard/campaign-details"
import type { BrandCampaign, Campaign } from "@/lib/dashboard/feed-types"
import type { BrandCampaignStatus } from "@/lib/dashboard/feed-types"
import type { Listing, ListingStatus } from "@/lib/dashboard/types"
import { daysUntil, formatInr } from "@/lib/dashboard/utils"

const ACCENT_PALETTE = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
]

function brandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "BR"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function accentFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length]
}

function toListingStatus(status: ApiCampaignStatus): ListingStatus {
  switch (status) {
    case "active":
      return "active"
    case "completed":
      return "completed"
    case "draft":
      return "draft"
    default:
      return "closed"
  }
}

function toBrandStatus(status: ApiCampaignStatus): BrandCampaignStatus {
  switch (status) {
    case "active":
      return "live"
    case "completed":
    case "archived":
    case "cancelled":
      return "ended"
    default:
      return "draft"
  }
}

function isNew(publishedAt: string | null): boolean {
  if (!publishedAt) return false
  const ageMs = Date.now() - new Date(publishedAt).getTime()
  return ageMs >= 0 && ageMs <= 7 * 24 * 60 * 60 * 1000
}

export function apiCampaignToFeedItem(campaign: ApiCampaign): Campaign {
  const isBounty = campaign.type === "bounty"
  const fixedReward = campaign.fixedReward ?? 0
  const rewardSortValue = isBounty ? campaign.totalBudget : fixedReward
  const maxCreators = campaign.maxCreators ?? 0
  const competingCount = campaign.competingCount ?? 0

  return {
    id: campaign.id,
    title: campaign.title,
    brand: campaign.brandName,
    type: campaign.type,
    niche: campaign.niche,
    reward: isBounty
      ? formatInr(campaign.totalBudget)
      : formatInr(fixedReward),
    dueInDays: daysUntil(campaign.deadline),
    slotsLeft: isBounty ? competingCount : Math.max(0, maxCreators - competingCount),
    initials: brandInitials(campaign.brandName),
    accent: accentFor(campaign.brandId || campaign.brandName),
    tagline: isBounty
      ? "Compete for the prize pool"
      : `${maxCreators} spots`,
    rewardLabel: isBounty
      ? formatInr(campaign.totalBudget)
      : `₹${formatInr(fixedReward)} per creator`,
    status: toListingStatus(campaign.status),
    fixedReward: isBounty ? undefined : fixedReward,
    totalBudget: campaign.totalBudget,
    competingCount: isBounty ? competingCount : undefined,
    verified: false,
    trending: false,
    isNew: isNew(campaign.publishedAt),
    rewardSortValue,
  }
}

export function apiCampaignToBrandItem(campaign: ApiCampaign): BrandCampaign {
  const base = apiCampaignToFeedItem(campaign)
  const isBounty = campaign.type === "bounty"
  const spots = isBounty ? 0 : campaign.maxCreators ?? 0
  const competingCount = campaign.competingCount ?? 0

  return {
    ...base,
    status: toBrandStatus(campaign.status),
    submissions: competingCount,
    spots,
  }
}

function apiCampaignToListing(campaign: ApiCampaign): Listing {
  const competingCount = campaign.competingCount ?? 0
  const base = {
    id: campaign.id,
    brandName: campaign.brandName,
    brandInitials: brandInitials(campaign.brandName),
    brandAccent: accentFor(campaign.brandId || campaign.brandName),
    title: campaign.title,
    description: campaign.description,
    niche: campaign.niche,
    platform: "instagram" as const,
    contentType: campaign.contentType,
    minFollowers: campaign.minFollowers,
    requiredHashtag: campaign.requiredHashtag,
    requiredMention: campaign.requiredMention,
    deadline: campaign.deadline,
    status: toListingStatus(campaign.status),
    dueInDays: daysUntil(campaign.deadline),
  }

  if (campaign.type === "bounty") {
    return {
      ...base,
      type: "bounty",
      prizeStructure: {
        first: campaign.prizeFirst ?? 0,
        second: campaign.prizeSecond ?? 0,
        third: campaign.prizeThird ?? 0,
        top20Each: campaign.prizeTop20Each ?? 0,
      },
      totalBudget: campaign.totalBudget,
      competingCount,
    }
  }

  const maxCreators = campaign.maxCreators ?? 0
  return {
    ...base,
    type: "campaign",
    minViewsThreshold: campaign.minViewsThreshold ?? 0,
    fixedReward: campaign.fixedReward ?? 0,
    maxCreators,
    spotsLeft: Math.max(0, maxCreators - competingCount),
    totalBudget: campaign.totalBudget,
  }
}

export function apiCampaignToListingDetail(campaign: ApiCampaign): ListingDetail {
  const listing = apiCampaignToListing(campaign)

  const requirements = [
    `Platform: Instagram ${listing.contentType}`,
    `Minimum ${listing.minFollowers.toLocaleString("en-IN")} followers`,
    `Include hashtag ${listing.requiredHashtag}`,
    `Mention ${listing.requiredMention}`,
  ]

  if (listing.type === "campaign") {
    requirements.push(
      `Minimum ${listing.minViewsThreshold.toLocaleString("en-IN")} views to qualify`
    )
    requirements.push(
      `Fixed payout: ₹${formatInr(listing.fixedReward)} per qualified creator`
    )
  } else {
    requirements.push("Compete for prize pool — ranked by engagement score")
    requirements.push("Tiebreaker: views, then earliest submission")
  }

  const prizeTiers =
    listing.type === "bounty"
      ? [
          { label: "1st place", amount: formatInr(listing.prizeStructure.first) },
          { label: "2nd place", amount: formatInr(listing.prizeStructure.second) },
          { label: "3rd place", amount: formatInr(listing.prizeStructure.third) },
          { label: "Top 20 each", amount: formatInr(listing.prizeStructure.top20Each) },
        ]
      : []

  return {
    ...listing,
    commentCount: 0,
    participantInitials: [],
    prizeTiers,
    leaderboard: [],
    sections: [
      {
        title: "Description",
        paragraphs: [listing.description],
      },
      {
        title: listing.type === "bounty" ? "How to win" : "How to qualify",
        bullets:
          listing.type === "bounty"
            ? [
                "Submit a public Instagram post before the deadline.",
                "Leaderboard updates every 6 hours based on engagement score.",
                "On deadline, status moves to completed and top submissions are reviewed.",
                "Winners receive payout via Razorpay after admin approval.",
              ]
            : [
                "Submit your post URL and pass the checklist.",
                "Views sync every 6 hours via cron.",
                "Once views meet the threshold, you are marked qualified.",
                "Admin confirms and releases your fixed reward.",
              ],
      },
      {
        title: "Requirements",
        bullets: requirements,
      },
    ],
  }
}
