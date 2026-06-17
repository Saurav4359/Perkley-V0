"use client"

import { useQuery } from "@tanstack/react-query"

import {
  fetchBrandAnalytics,
  fetchCampaignAnalytics,
  fetchCreatorAnalytics,
} from "@/lib/api/analytics"

export const analyticsKeys = {
  creator: ["analytics", "creator"] as const,
  brand: ["analytics", "brand"] as const,
  campaign: (campaignId: string) => ["analytics", "campaign", campaignId] as const,
}

export function useCreatorAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.creator,
    queryFn: fetchCreatorAnalytics,
  })
}

export function useBrandAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.brand,
    queryFn: fetchBrandAnalytics,
  })
}

export function useCampaignAnalytics(campaignId: string | undefined) {
  return useQuery({
    queryKey: analyticsKeys.campaign(campaignId ?? ""),
    queryFn: () => fetchCampaignAnalytics(campaignId!),
    enabled: Boolean(campaignId),
  })
}
