"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchCampaignLeaderboard,
  selectCampaignWinners,
  type CampaignLeaderboard,
} from "@/lib/api/leaderboard"
import { leaderboardKeys } from "@/lib/query/keys"

export { leaderboardKeys }

export function useCampaignLeaderboard(
  campaignId: string | undefined,
  enabled = true
) {
  return useQuery<CampaignLeaderboard>({
    queryKey: leaderboardKeys.campaign(campaignId ?? ""),
    queryFn: () => fetchCampaignLeaderboard(campaignId!),
    enabled: Boolean(campaignId) && enabled,
    refetchInterval: 60_000,
  })
}

export function useSelectWinners(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => selectCampaignWinners(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.campaign(campaignId) })
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}
