import { BRAND_CAMPAIGNS, RECENT_WINNERS } from "@/lib/dashboard/mock-data"
import { formatInr } from "@/lib/dashboard/utils"

export type AnalyticsPeriod = "7d" | "30d" | "90d"

export type AnalyticsKpi = {
  label: string
  value: string
  trend?: number
  trendLabel?: string
  hint?: string
}

export type SpendPoint = {
  label: string
  value: number
}

export type FunnelStage = {
  stage: string
  count: number
  pct: number
}

export type CampaignPerformanceRow = {
  id: string
  title: string
  type: "bounty" | "campaign"
  status: string
  spend: number
  submissions: number
  qualified: number
  engagement: number
  cpa: number
}

export type ChannelShare = {
  channel: string
  pct: number
  color: string
}

export type TopCreatorRow = {
  name: string
  campaigns: number
  engagement: string
  earned: string
  initials: string
}

export type NicheShare = {
  niche: string
  pct: number
}

const liveCampaigns = BRAND_CAMPAIGNS.filter((c) => c.status === "live")
const totalSubmissions = BRAND_CAMPAIGNS.reduce((sum, c) => sum + c.submissions, 0)

export const BRAND_ANALYTICS_KPIS: AnalyticsKpi[] = [
  {
    label: "Total spend",
    value: `₹${formatInr(1245000)}`,
    trend: 18.2,
    trendLabel: "vs last month",
    hint: "All campaigns + bounties",
  },
  {
    label: "Creator reach",
    value: formatInr(24800),
    trend: 12.4,
    trendLabel: "unique creators",
    hint: "Joined or submitted",
  },
  {
    label: "Avg. engagement",
    value: "4.8%",
    trend: 0.6,
    trendLabel: "vs last period",
    hint: "Views, likes & comments",
  },
  {
    label: "Cost per qualified",
    value: `₹${formatInr(420)}`,
    trend: -8.2,
    trendLabel: "efficiency up",
    hint: "Spend ÷ qualified posts",
  },
  {
    label: "Active campaigns",
    value: String(liveCampaigns.length),
    hint: `${BRAND_CAMPAIGNS.filter((c) => c.status === "reviewing").length} in review`,
  },
  {
    label: "Est. ROI",
    value: "3.2×",
    trend: 14,
    trendLabel: "earned media value",
    hint: "Based on reach benchmarks",
  },
]

export const SPEND_OVER_TIME: SpendPoint[] = [
  { label: "Jan", value: 62000 },
  { label: "Feb", value: 78000 },
  { label: "Mar", value: 71000 },
  { label: "Apr", value: 94000 },
  { label: "May", value: 108000 },
  { label: "Jun", value: 124500 },
]

export const CREATOR_FUNNEL: FunnelStage[] = [
  { stage: "Brief impressions", count: 48200, pct: 100 },
  { stage: "Creator joins", count: 2480, pct: Math.round((2480 / 48200) * 100) },
  { stage: "Submissions", count: totalSubmissions, pct: Math.round((totalSubmissions / 48200) * 100) },
  { stage: "Qualified content", count: 186, pct: Math.round((186 / 48200) * 100) },
  { stage: "Paid winners", count: 42, pct: Math.round((42 / 48200) * 100) },
]

export const CAMPAIGN_PERFORMANCE: CampaignPerformanceRow[] = BRAND_CAMPAIGNS.map(
  (campaign) => {
    const spend =
      campaign.totalBudget ??
      (campaign.fixedReward ?? 0) * (campaign.spots ?? campaign.submissions)
  const qualified = Math.max(1, Math.round(campaign.submissions * 0.35))
  const engagement = 3.2 + (campaign.submissions % 5) * 0.4

  return {
    id: campaign.id,
    title: campaign.title,
    type: campaign.type,
    status: campaign.status,
    spend,
    submissions: campaign.submissions,
    qualified,
    engagement,
    cpa: Math.round(spend / qualified),
  }
})

export const CHANNEL_MIX: ChannelShare[] = [
  { channel: "Instagram Reels", pct: 68, color: "#FE6C37" },
  { channel: "Instagram Stories", pct: 22, color: "#FB923C" },
  { channel: "YouTube Shorts", pct: 10, color: "#FDBA74" },
]

export const NICHE_BREAKDOWN: NicheShare[] = [
  { niche: "Lifestyle", pct: 34 },
  { niche: "Fitness", pct: 28 },
  { niche: "Tech", pct: 18 },
  { niche: "Food", pct: 14 },
  { niche: "Other", pct: 10 },
]

export const TOP_CREATORS: TopCreatorRow[] = RECENT_WINNERS.map((winner, index) => ({
  name: winner.name,
  campaigns: 2 + (index % 3),
  engagement: `${(4.2 + index * 0.3).toFixed(1)}%`,
  earned: winner.amount,
  initials: winner.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
}))

export const ENGAGEMENT_WEEKLY: SpendPoint[] = [
  { label: "W1", value: 3.8 },
  { label: "W2", value: 4.1 },
  { label: "W3", value: 4.4 },
  { label: "W4", value: 4.6 },
  { label: "W5", value: 4.5 },
  { label: "W6", value: 4.8 },
]

export const BUDGET_UTILIZATION = {
  allocated: 435000,
  spent: 312400,
  remaining: 122600,
}
