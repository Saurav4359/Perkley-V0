import { apiFetch } from "@/lib/api/client"

export type CreatorStats = {
  applications: number
  pendingApplications: number
  acceptedApplications: number
  submissions: number
  competing: number
  underReview: number
  qualified: number
  won: number
  estimatedEarningsInr: number
  openCampaigns: number
}

export type BrandStats = {
  totalCampaigns: number
  activeCampaigns: number
  draftCampaigns: number
  completedCampaigns: number
  totalApplications: number
  pendingApplications: number
  totalSubmissions: number
  pendingReviews: number
}

export type DashboardActivityKind =
  | "application"
  | "submission"
  | "campaign"
  | "review"

export type DashboardActivityItem = {
  id: string
  kind: DashboardActivityKind
  campaignId: string
  campaignTitle: string
  actorName: string
  action: string
  occurredAt: string
}

export async function fetchCreatorStats(): Promise<CreatorStats> {
  const { stats } = await apiFetch<{ stats: CreatorStats }>(
    "/api/dashboard/creator/stats"
  )
  return stats
}

export async function fetchCreatorActivity(
  limit = 10
): Promise<DashboardActivityItem[]> {
  const { activity } = await apiFetch<{ activity: DashboardActivityItem[] }>(
    `/api/dashboard/creator/activity?limit=${limit}`
  )
  return activity
}

export async function fetchBrandStats(): Promise<BrandStats> {
  const { stats } = await apiFetch<{ stats: BrandStats }>(
    "/api/dashboard/brand/stats"
  )
  return stats
}

export async function fetchBrandActivity(
  limit = 10
): Promise<DashboardActivityItem[]> {
  const { activity } = await apiFetch<{ activity: DashboardActivityItem[] }>(
    `/api/dashboard/brand/activity?limit=${limit}`
  )
  return activity
}
