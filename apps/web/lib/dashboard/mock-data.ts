import { BRAND_LISTINGS, CREATOR_LISTINGS } from "@/lib/dashboard/listings-adapter"
import type { ListingStatus, ListingType, Niche } from "@/lib/dashboard/types"
import { NICHES } from "@/lib/dashboard/types"

export type CampaignType = ListingType
export type CampaignCategory = Niche

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

export const CREATOR_NAV = [
  { label: "Campaigns", href: "/dashboard" },
  { label: "My Work", href: "/dashboard/work" },
  { label: "Earnings", href: "/dashboard/earnings" },
  { label: "Leaderboard", href: "/dashboard/leaderboard" },
  { label: "Discover", href: "/dashboard/discover" },
] as const

export const BRAND_NAV = [
  { label: "Overview", href: "/dashboard/brand" },
  { label: "Campaigns", href: "/dashboard/brand/campaigns" },
  { label: "Creators", href: "/dashboard/brand/creators" },
] as const

export type BrandCampaignStatus = "live" | "reviewing" | "draft" | "ended"

export type BrandCampaign = Omit<Campaign, "status"> & {
  status: BrandCampaignStatus
  submissions: number
  spots: number
}

export function getBrandNav(pathname: string) {
  return BRAND_NAV.map((item) => ({
    ...item,
    active:
      item.href === "/dashboard/brand"
        ? pathname === item.href
        : pathname.startsWith(item.href),
  }))
}

export function getCreatorNav(pathname: string) {
  return CREATOR_NAV.map((item) => ({
    ...item,
    active:
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href),
  }))
}

export const BRAND_CAMPAIGNS = BRAND_LISTINGS

export const CAMPAIGN_CATEGORIES = NICHES

export const CREATOR_CAMPAIGNS = CREATOR_LISTINGS

export const RECENT_WINNERS = [
  {
    name: "Maya Chen",
    task: "Vitamin C launch reel sprint",
    amount: "25,000",
  },
  {
    name: "Jordan Okoye",
    task: "Summer shred challenge",
    amount: "18,000",
  },
  {
    name: "Priya Shah",
    task: "Monsoon drop lookbook",
    amount: "12,000",
  },
]

export const RECENT_ACTIVITY = [
  {
    user: "Alex Rivera",
    action: "submitted to bounty",
    campaign: "Vitamin C launch reel sprint",
    time: "2m ago",
    kind: "submit" as const,
  },
  {
    user: "Sam Lee",
    action: "qualified for campaign payout",
    campaign: "UPI demo reel",
    time: "18m ago",
    kind: "qualified" as const,
  },
  {
    user: "Northline Skincare",
    action: "posted a new bounty",
    campaign: "Vitamin C launch reel sprint",
    time: "1h ago",
    kind: "new" as const,
  },
]

export const ONBOARDING_STEPS = [
  { label: "Complete your creator profile", done: true },
  { label: "Join your first bounty or campaign", done: true },
  { label: "Submit work and track earnings", done: false },
]

export const BRAND_ONBOARDING_STEPS = [
  { label: "Set up your brand profile", done: true },
  { label: "Launch your first bounty", done: false },
  { label: "Review submissions and pay winners", done: false },
]

export const ADMIN_NAV = [{ label: "Submissions", href: "/dashboard/admin" }] as const
