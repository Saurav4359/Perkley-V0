import { apiFetch } from "@/lib/api/client"

export type EngagementSummary = {
  submissions: number
  totalViews: number
  totalLikes: number
  totalComments: number
  engagementRate: number
  averageEngagementScore: number
}

export type CreatorAnalytics = {
  engagement: EngagementSummary
  statusBreakdown: Record<string, number>
  winRate: number
  wins: number
  estimatedEarningsInr: number
}

export type BrandAnalytics = {
  campaigns: number
  activeCampaigns: number
  completedCampaigns: number
  totalApplications: number
  engagement: EngagementSummary
  statusBreakdown: Record<string, number>
  spend: {
    totalBudgetInr: number
    releasedInr: number
    remainingInr: number
  }
}

export type CampaignAnalyticsPerformer = {
  submissionId: string
  creatorId: string
  creatorName: string
  views: number
  likes: number
  comments: number
  engagementScore: number
  status: string
}

export type CampaignAnalytics = {
  campaign: { id: string; title: string; type: string; status: string }
  applicationCount: number
  engagement: EngagementSummary
  statusBreakdown: Record<string, number>
  topPerformers: CampaignAnalyticsPerformer[]
}

export async function fetchCreatorAnalytics(): Promise<CreatorAnalytics> {
  const { analytics } = await apiFetch<{ analytics: CreatorAnalytics }>(
    "/api/analytics/creator"
  )
  return analytics
}

export async function fetchBrandAnalytics(): Promise<BrandAnalytics> {
  const { analytics } = await apiFetch<{ analytics: BrandAnalytics }>(
    "/api/analytics/brand"
  )
  return analytics
}

export async function fetchCampaignAnalytics(
  campaignId: string
): Promise<CampaignAnalytics> {
  const { analytics } = await apiFetch<{ analytics: CampaignAnalytics }>(
    `/api/campaigns/${campaignId}/analytics`
  )
  return analytics
}
