export type CampaignType = "bounty" | "campaign"
export type CampaignCategory = "content" | "design" | "development" | "other"

export type Campaign = {
  id: string
  title: string
  brand: string
  type: CampaignType
  category: CampaignCategory
  reward: string
  dueInDays: number
  slotsLeft: number
  initials: string
  accent: string
}

export const CREATOR_NAV = [
  { label: "Campaigns", href: "/dashboard", active: true },
  { label: "My work", href: "/dashboard/work" },
  { label: "Earnings", href: "/dashboard/earnings" },
] as const

export const BRAND_NAV = [
  { label: "Overview", href: "/dashboard/brand", active: true },
  { label: "Campaigns", href: "/dashboard/brand/campaigns" },
  { label: "Creators", href: "/dashboard/brand/creators" },
] as const

export const CAMPAIGN_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "content", label: "Content" },
  { id: "design", label: "Design" },
  { id: "development", label: "Development" },
  { id: "other", label: "Other" },
] as const

export const CREATOR_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    title: "Launch week UGC sprint",
    brand: "Northline Skincare",
    type: "bounty",
    category: "content",
    reward: "2,500",
    dueInDays: 5,
    slotsLeft: 12,
    initials: "NS",
    accent: "#FE6C37",
  },
  {
    id: "2",
    title: "Product demo reel challenge",
    brand: "VaultPay",
    type: "campaign",
    category: "content",
    reward: "800",
    dueInDays: 9,
    slotsLeft: 6,
    initials: "VP",
    accent: "#0A0A0A",
  },
  {
    id: "3",
    title: "Landing page hero refresh",
    brand: "Orbit Labs",
    type: "bounty",
    category: "design",
    reward: "1,200",
    dueInDays: 14,
    slotsLeft: 3,
    initials: "OL",
    accent: "#6366F1",
  },
  {
    id: "4",
    title: "API integration walkthrough",
    brand: "Stackforge",
    type: "campaign",
    category: "development",
    reward: "650",
    dueInDays: 7,
    slotsLeft: 8,
    initials: "SF",
    accent: "#059669",
  },
]

export const RECENT_WINNERS = [
  {
    name: "Maya Chen",
    task: "TikTok hook test for a fintech launch",
    amount: "420",
  },
  {
    name: "Jordan Okoye",
    task: "Short-form ad variant for a D2C drop",
    amount: "275",
  },
  {
    name: "Priya Shah",
    task: "Creator brief for a product unboxing",
    amount: "190",
  },
]

export const RECENT_ACTIVITY = [
  {
    user: "Alex Rivera",
    action: "submitted a bounty entry",
    campaign: "Summer drop UGC",
    time: "2m ago",
  },
  {
    user: "Sam Lee",
    action: "won a performance bonus",
    campaign: "VaultPay demo reel",
    time: "18m ago",
  },
  {
    user: "Northline Skincare",
    action: "posted a new campaign",
    campaign: "Launch week UGC sprint",
    time: "1h ago",
  },
]

export const ONBOARDING_STEPS = [
  { label: "Complete your creator profile", done: true },
  { label: "Join your first campaign", done: true },
  { label: "Submit work and climb the leaderboard", done: false },
]

export const BRAND_ONBOARDING_STEPS = [
  { label: "Set up your brand profile", done: true },
  { label: "Launch your first bounty", done: false },
  { label: "Review submissions and pay winners", done: false },
]
