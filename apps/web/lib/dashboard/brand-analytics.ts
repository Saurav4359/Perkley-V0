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
