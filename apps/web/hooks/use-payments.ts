"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchBrandPayments,
  fetchCampaignEscrow,
  fetchCreatorPayments,
  fundAndConfirmEscrow,
  releaseCampaignPayments,
  type PayoutStatus,
} from "@/lib/api/payments"

export const paymentKeys = {
  escrow: (campaignId: string) => ["escrow", campaignId] as const,
  creatorPayments: ["payments", "creator"] as const,
  brandPayments: ["payments", "brand"] as const,
}

export function useCampaignEscrow(campaignId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.escrow(campaignId ?? ""),
    queryFn: () => fetchCampaignEscrow(campaignId!),
    enabled: Boolean(campaignId) && enabled,
  })
}

export function useFundEscrow(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => fundAndConfirmEscrow(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.escrow(campaignId) })
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
  })
}

export function useReleasePayments(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submissionIds?: string[]) =>
      releaseCampaignPayments(campaignId, submissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.escrow(campaignId) })
      queryClient.invalidateQueries({ queryKey: ["submissions"] })
      queryClient.invalidateQueries({ queryKey: ["payments"] })
    },
  })
}

export function useCreatorPayments(options?: { limit?: number; status?: PayoutStatus }) {
  return useQuery({
    queryKey: [...paymentKeys.creatorPayments, options?.limit ?? 20, options?.status ?? "all"],
    queryFn: () => fetchCreatorPayments(options),
  })
}

export function useBrandPayments(limit = 20) {
  return useQuery({
    queryKey: [...paymentKeys.brandPayments, limit],
    queryFn: () => fetchBrandPayments({ limit }),
  })
}
