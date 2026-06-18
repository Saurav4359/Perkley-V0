import { apiFetch } from "@/lib/api/client"
import type { ContentType, Niche } from "@/lib/dashboard/types"

export type ApiCampaignType = "bounty" | "campaign"
export type ApiCampaignStatus =
  | "draft"
  | "active"
  | "archived"
  | "completed"
  | "cancelled"

export type ApiCampaign = {
  id: string
  brandId: string
  brandName: string
  brandLogoUrl: string | null
  type: ApiCampaignType
  title: string
  description: string
  niche: Niche
  platform: "instagram"
  contentType: ContentType
  minFollowers: number
  requiredHashtag: string
  requiredMention: string
  deadline: string
  status: ApiCampaignStatus
  totalBudget: number
  maxCreators: number | null
  minViewsThreshold: number | null
  fixedReward: number | null
  prizeFirst: number | null
  prizeSecond: number | null
  prizeThird: number | null
  prizeTop20Each: number | null
  publishedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  competingCount: number
}

export type CampaignListFilters = {
  type?: ApiCampaignType
  niche?: Niche
  contentType?: ContentType
  q?: string
  minReward?: number
  maxReward?: number
  sort?:
    | "published_at_desc"
    | "published_at_asc"
    | "reward_desc"
    | "reward_asc"
    | "deadline_asc"
    | "deadline_desc"
}

export type CreateCampaignInput = {
  type: ApiCampaignType
  title: string
  description: string
  niche: Niche
  contentType: ContentType
  minFollowers: number
  requiredHashtag: string
  requiredMention: string
  deadline: string
  totalBudget: number
  maxCreators?: number
  minViewsThreshold?: number
  fixedReward?: number
  prizeFirst?: number
  prizeSecond?: number
  prizeThird?: number
  prizeTop20Each?: number
}

function toQueryString(filters: CampaignListFilters): string {
  const params = new URLSearchParams()
  if (filters.type) params.set("type", filters.type)
  if (filters.niche) params.set("niche", filters.niche)
  if (filters.contentType) params.set("contentType", filters.contentType)
  if (filters.q) params.set("q", filters.q)
  if (filters.minReward !== undefined) params.set("minReward", String(filters.minReward))
  if (filters.maxReward !== undefined) params.set("maxReward", String(filters.maxReward))
  if (filters.sort) params.set("sort", filters.sort)
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function fetchPublicCampaigns(
  filters: CampaignListFilters = {}
): Promise<ApiCampaign[]> {
  const { campaigns } = await apiFetch<{ campaigns: ApiCampaign[] }>(
    `/api/campaigns${toQueryString(filters)}`
  )
  return campaigns
}

export async function fetchMyCampaigns(
  status?: ApiCampaignStatus
): Promise<ApiCampaign[]> {
  const query = status ? `?status=${status}` : ""
  const { campaigns } = await apiFetch<{ campaigns: ApiCampaign[] }>(
    `/api/campaigns/mine${query}`
  )
  return campaigns
}

export async function fetchCampaign(id: string): Promise<ApiCampaign> {
  const { campaign } = await apiFetch<{ campaign: ApiCampaign }>(
    `/api/campaigns/${id}`
  )
  return campaign
}

export async function createCampaign(
  input: CreateCampaignInput
): Promise<ApiCampaign> {
  const { campaign } = await apiFetch<{ campaign: ApiCampaign }>(
    "/api/campaigns",
    { method: "POST", body: input }
  )
  return campaign
}

export async function publishCampaign(id: string): Promise<ApiCampaign> {
  const { campaign } = await apiFetch<{ campaign: ApiCampaign }>(
    `/api/campaigns/${id}/publish`,
    { method: "POST" }
  )
  return campaign
}

export async function archiveCampaign(id: string): Promise<ApiCampaign> {
  const { campaign } = await apiFetch<{ campaign: ApiCampaign }>(
    `/api/campaigns/${id}/archive`,
    { method: "POST" }
  )
  return campaign
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiFetch<void>(`/api/campaigns/${id}`, { method: "DELETE" })
}
