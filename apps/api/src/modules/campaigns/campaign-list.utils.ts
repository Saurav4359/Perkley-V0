import type { CampaignType, Platform } from "@prisma/client"

export type CampaignListSort =
  | "published_at_desc"
  | "published_at_asc"
  | "reward_desc"
  | "reward_asc"
  | "deadline_asc"
  | "deadline_desc"

export type CampaignListItem = {
  type: CampaignType
  platform: Platform
  fixedReward: number | null
  totalBudget: number
  prizeFirst: number | null
  publishedAt: Date | null
  createdAt: Date
  deadline: Date
}

export function getCampaignRewardValue(campaign: CampaignListItem) {
  if (campaign.type === "campaign") return campaign.fixedReward ?? 0
  return campaign.prizeFirst ?? campaign.totalBudget
}

export function campaignMatchesRewardRange(
  campaign: CampaignListItem,
  minReward?: number,
  maxReward?: number
) {
  const reward = getCampaignRewardValue(campaign)
  if (minReward !== undefined && reward < minReward) return false
  if (maxReward !== undefined && reward > maxReward) return false
  return true
}

export function sortCampaigns<T extends CampaignListItem>(campaigns: T[], sort: CampaignListSort) {
  const sorted = [...campaigns]

  sorted.sort((a, b) => {
    switch (sort) {
      case "published_at_asc": {
        const aTime = (a.publishedAt ?? a.createdAt).getTime()
        const bTime = (b.publishedAt ?? b.createdAt).getTime()
        return aTime - bTime
      }
      case "reward_desc":
        return getCampaignRewardValue(b) - getCampaignRewardValue(a)
      case "reward_asc":
        return getCampaignRewardValue(a) - getCampaignRewardValue(b)
      case "deadline_asc":
        return a.deadline.getTime() - b.deadline.getTime()
      case "deadline_desc":
        return b.deadline.getTime() - a.deadline.getTime()
      case "published_at_desc":
      default: {
        const aTime = (a.publishedAt ?? a.createdAt).getTime()
        const bTime = (b.publishedAt ?? b.createdAt).getTime()
        return bTime - aTime
      }
    }
  })

  return sorted
}

export function matchesSearchQuery(haystack: string, query: string) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true
  const normalizedHaystack = haystack.toLowerCase()
  return tokens.every((token) => normalizedHaystack.includes(token))
}

export function buildCampaignSearchHaystack(input: {
  id: string
  title: string
  description: string
  niche: string
  type: string
  platform: string
  brandName?: string | null
}) {
  return [
    input.id,
    input.title,
    input.description,
    input.niche,
    input.type,
    input.platform,
    input.brandName ?? "",
  ].join(" ")
}
