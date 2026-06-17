"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchAdminBrands,
  fetchAdminCampaigns,
  fetchAdminCreators,
  fetchAdminPayments,
  fetchAdminUsers,
  fetchPlatformReport,
  moderateCampaign,
  setBrandVerification,
  setCreatorVerification,
  updateUserStatus,
  type AdminCampaignStatus,
  type AdminEscrowStatus,
  type UserRole,
  type UserStatus,
  type VerificationStatus,
} from "@/lib/api/admin"

export const adminKeys = {
  report: ["admin", "report"] as const,
  users: (params: unknown) => ["admin", "users", params] as const,
  creators: (params: unknown) => ["admin", "creators", params] as const,
  brands: (params: unknown) => ["admin", "brands", params] as const,
  campaigns: (params: unknown) => ["admin", "campaigns", params] as const,
  payments: (params: unknown) => ["admin", "payments", params] as const,
}

export function usePlatformReport() {
  return useQuery({
    queryKey: adminKeys.report,
    queryFn: fetchPlatformReport,
  })
}

export function useAdminUsers(params: {
  page?: number
  role?: UserRole
  status?: UserStatus
  q?: string
}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => fetchAdminUsers(params),
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      queryClient.invalidateQueries({ queryKey: adminKeys.report })
    },
  })
}

export function useAdminCreators(params: {
  page?: number
  verificationStatus?: VerificationStatus
}) {
  return useQuery({
    queryKey: adminKeys.creators(params),
    queryFn: () => fetchAdminCreators(params),
  })
}

export function useSetCreatorVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      verificationStatus,
    }: {
      id: string
      verificationStatus: VerificationStatus
    }) => setCreatorVerification(id, verificationStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "creators"] })
    },
  })
}

export function useAdminBrands(params: {
  page?: number
  verificationStatus?: VerificationStatus
}) {
  return useQuery({
    queryKey: adminKeys.brands(params),
    queryFn: () => fetchAdminBrands(params),
  })
}

export function useSetBrandVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      verificationStatus,
    }: {
      id: string
      verificationStatus: VerificationStatus
    }) => setBrandVerification(id, verificationStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] })
    },
  })
}

export function useAdminCampaigns(params: {
  page?: number
  status?: AdminCampaignStatus
  type?: "bounty" | "campaign"
}) {
  return useQuery({
    queryKey: adminKeys.campaigns(params),
    queryFn: () => fetchAdminCampaigns(params),
  })
}

export function useModerateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      moderateCampaign(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] })
      queryClient.invalidateQueries({ queryKey: adminKeys.report })
    },
  })
}

export function useAdminPayments(params: {
  page?: number
  status?: AdminEscrowStatus
}) {
  return useQuery({
    queryKey: adminKeys.payments(params),
    queryFn: () => fetchAdminPayments(params),
  })
}
