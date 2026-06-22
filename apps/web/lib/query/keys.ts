import type {
  ApiCampaignStatus,
  CampaignListFilters,
} from "@/lib/api/campaigns"

export const campaignKeys = {
  all: ["campaigns"] as const,
  public: (filters: CampaignListFilters) =>
    ["campaigns", "public", filters] as const,
  mine: (status?: ApiCampaignStatus) =>
    ["campaigns", "mine", status ?? "all"] as const,
  detail: (id: string) => ["campaigns", "detail", id] as const,
}

export const creatorProfileKey = ["profile", "creator"] as const
export const brandProfileKey = ["profile", "brand"] as const

export const leaderboardKeys = {
  campaign: (campaignId: string) => ["leaderboard", campaignId] as const,
}
