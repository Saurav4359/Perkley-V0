"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  approveSubmission,
  createSubmission,
  getMyCampaignSubmission,
  listCampaignSubmissions,
  listCreatorSubmissions,
  rejectSubmission,
  updateMyCampaignSubmission,
  type BrandSubmission,
  type CreateSubmissionInput,
  type CreatorSubmission,
  type SubmissionStatus,
  type UpdateSubmissionInput,
} from "@/lib/api/submissions"
import { campaignKeys } from "@/hooks/use-campaigns"
import type { ApiCampaign } from "@/lib/api/campaigns"

export const submissionKeys = {
  campaign: (campaignId: string, status?: SubmissionStatus) =>
    ["submissions", "campaign", campaignId, status ?? "all"] as const,
  mineForCampaign: (campaignId: string) =>
    ["submissions", "mine", "campaign", campaignId] as const,
  mine: (status?: SubmissionStatus) =>
    ["submissions", "mine", status ?? "all"] as const,
}

export function useMyCampaignSubmission(campaignId: string | undefined) {
  return useQuery<CreatorSubmission | null>({
    queryKey: submissionKeys.mineForCampaign(campaignId ?? ""),
    queryFn: () => getMyCampaignSubmission(campaignId!),
    enabled: Boolean(campaignId),
  })
}

export function useCampaignSubmissions(
  campaignId: string | undefined,
  status?: SubmissionStatus
) {
  return useQuery<BrandSubmission[]>({
    queryKey: submissionKeys.campaign(campaignId ?? "", status),
    queryFn: () => listCampaignSubmissions(campaignId!, status),
    enabled: Boolean(campaignId),
  })
}

export function useCreatorSubmissions(status?: SubmissionStatus) {
  return useQuery<CreatorSubmission[]>({
    queryKey: submissionKeys.mine(status),
    queryFn: () => listCreatorSubmissions(status),
  })
}

export function useCreateSubmission(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSubmissionInput) =>
      createSubmission(campaignId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] })
      queryClient.setQueryData<ApiCampaign>(campaignKeys.detail(campaignId), (current) =>
        current
          ? { ...current, competingCount: (current.competingCount ?? 0) + 1 }
          : current
      )
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
    },
  })
}

export function useUpdateMySubmission(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSubmissionInput) =>
      updateMyCampaignSubmission(campaignId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] })
    },
  })
}

export function useApproveSubmission(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submissionId: string) =>
      approveSubmission(campaignId, submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] })
    },
  })
}

export function useRejectSubmission(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      submissionId,
      reason,
    }: {
      submissionId: string
      reason: string
    }) => rejectSubmission(campaignId, submissionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] })
    },
  })
}
