"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  archiveCampaign,
  createCampaign,
  deleteCampaign,
  fetchCampaign,
  fetchMyCampaigns,
  fetchPublicCampaigns,
  publishCampaign,
  type ApiCampaign,
  type ApiCampaignStatus,
  type CampaignListFilters,
  type CreateCampaignInput,
} from "@/lib/api/campaigns"

export const campaignKeys = {
  all: ["campaigns"] as const,
  public: (filters: CampaignListFilters) =>
    ["campaigns", "public", filters] as const,
  mine: (status?: ApiCampaignStatus) =>
    ["campaigns", "mine", status ?? "all"] as const,
  detail: (id: string) => ["campaigns", "detail", id] as const,
}

export function usePublicCampaigns(filters: CampaignListFilters = {}) {
  return useQuery<ApiCampaign[]>({
    queryKey: campaignKeys.public(filters),
    queryFn: () => fetchPublicCampaigns(filters),
  })
}

export function useMyCampaigns(status?: ApiCampaignStatus) {
  return useQuery<ApiCampaign[]>({
    queryKey: campaignKeys.mine(status),
    queryFn: () => fetchMyCampaigns(status),
  })
}

export function useCampaign(id: string | undefined) {
  return useQuery<ApiCampaign>({
    queryKey: campaignKeys.detail(id ?? ""),
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(id),
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCampaignInput) => createCampaign(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}

export function usePublishCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => publishCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}

export function useArchiveCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}
