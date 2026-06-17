"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  acceptApplication,
  applyToCampaign,
  listCampaignApplications,
  listCreatorApplications,
  rejectApplication,
  withdrawApplication,
  type ApplicationStatus,
  type BrandApplication,
  type CreatorApplication,
} from "@/lib/api/applications"

export const applicationKeys = {
  campaign: (campaignId: string, status?: ApplicationStatus) =>
    ["applications", "campaign", campaignId, status ?? "all"] as const,
  mine: (status?: ApplicationStatus) =>
    ["applications", "mine", status ?? "all"] as const,
}

export function useCampaignApplications(
  campaignId: string | undefined,
  status?: ApplicationStatus
) {
  return useQuery<BrandApplication[]>({
    queryKey: applicationKeys.campaign(campaignId ?? "", status),
    queryFn: () => listCampaignApplications(campaignId!, status),
    enabled: Boolean(campaignId),
  })
}

export function useCreatorApplications(status?: ApplicationStatus) {
  return useQuery<CreatorApplication[]>({
    queryKey: applicationKeys.mine(status),
    queryFn: () => listCreatorApplications(status),
  })
}

export function useApplyToCampaign(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message?: string) => applyToCampaign(campaignId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

export function useWithdrawApplication(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => withdrawApplication(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

export function useAcceptApplication(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (applicationId: string) =>
      acceptApplication(campaignId, applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

export function useRejectApplication(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (applicationId: string) =>
      rejectApplication(campaignId, applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}
