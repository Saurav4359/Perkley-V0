import type { ListingStatus, ListingType, Niche } from "@/lib/dashboard/types"
import { NICHES } from "@/lib/dashboard/types"

export type CampaignType = ListingType
export type CampaignCategory = Niche

export const CAMPAIGN_CATEGORIES = NICHES

export type Campaign = {
  id: string
  title: string
  brand: string
  type: CampaignType
  niche: Niche
  reward: string
  dueInDays: number
  slotsLeft: number
  initials: string
  accent: string
  tagline: string
  rewardLabel: string
  status: ListingStatus
  fixedReward?: number
  totalBudget?: number
  competingCount?: number
  verified?: boolean
  trending?: boolean
  isNew?: boolean
  fillPercent?: number
  filledCount?: number
  maxCompetitors?: number
  joinedAvatars?: string[]
  joinedTotal?: number
  rewardSortValue?: number
}

export type BrandCampaignStatus = "live" | "reviewing" | "draft" | "ended"

export type BrandCampaign = Omit<Campaign, "status"> & {
  status: BrandCampaignStatus
  submissions: number
  spots: number
}
