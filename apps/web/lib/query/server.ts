import { QueryClient, dehydrate, type DehydratedState } from "@tanstack/react-query"
import { cache } from "react"

import {
  fetchCampaign,
  fetchMyCampaigns,
  fetchPublicCampaigns,
} from "@/lib/api/campaigns"
import { fetchCampaignLeaderboard } from "@/lib/api/leaderboard"
import { fetchBrandProfile, fetchCreatorProfile } from "@/lib/api/profile"
import {
  brandProfileKey,
  campaignKeys,
  creatorProfileKey,
  leaderboardKeys,
} from "@/lib/query/keys"

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export const getQueryClient = cache(createQueryClient)

export async function prefetchCreatorDashboard(): Promise<DehydratedState> {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: campaignKeys.public({}),
      queryFn: () => fetchPublicCampaigns(),
    }),
    queryClient.prefetchQuery({
      queryKey: creatorProfileKey,
      queryFn: fetchCreatorProfile,
    }),
  ])

  return dehydrate(queryClient)
}

export async function prefetchBrandDashboard(): Promise<DehydratedState> {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: campaignKeys.public({}),
      queryFn: () => fetchPublicCampaigns(),
    }),
    queryClient.prefetchQuery({
      queryKey: campaignKeys.mine(),
      queryFn: () => fetchMyCampaigns(),
    }),
    queryClient.prefetchQuery({
      queryKey: brandProfileKey,
      queryFn: fetchBrandProfile,
    }),
  ])

  return dehydrate(queryClient)
}

export async function prefetchCampaignDetail(
  campaignId: string
): Promise<DehydratedState> {
  const queryClient = getQueryClient()
  const campaign = await fetchCampaign(campaignId)

  queryClient.setQueryData(campaignKeys.detail(campaignId), campaign)

  const relatedFilters = { type: campaign.type, niche: campaign.niche }
  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: campaignKeys.public(relatedFilters),
      queryFn: () => fetchPublicCampaigns(relatedFilters),
    }),
  ]

  if (campaign.type === "bounty") {
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: leaderboardKeys.campaign(campaignId),
        queryFn: () => fetchCampaignLeaderboard(campaignId),
      })
    )
  }

  await Promise.all(prefetches)

  return dehydrate(queryClient)
}
