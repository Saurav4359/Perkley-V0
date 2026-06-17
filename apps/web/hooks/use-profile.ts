"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  fetchBrandProfile,
  fetchCreatorProfile,
  saveCreatorPaymentDetails,
  updateBrandProfile,
  updateCreatorProfile,
  type BrandProfile,
  type CreatorProfile,
  type UpdateBrandProfileInput,
  type UpdateCreatorProfileInput,
  type UpsertPaymentDetailsInput,
} from "@/lib/api/profile"

export const creatorProfileKey = ["profile", "creator"] as const
export const brandProfileKey = ["profile", "brand"] as const

export function useCreatorProfile(enabled = true) {
  return useQuery<CreatorProfile>({
    queryKey: creatorProfileKey,
    queryFn: fetchCreatorProfile,
    enabled,
  })
}

export function useUpdateCreatorProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCreatorProfileInput) => updateCreatorProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(creatorProfileKey, profile)
    },
  })
}

export function useSaveCreatorPaymentDetails() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpsertPaymentDetailsInput) =>
      saveCreatorPaymentDetails(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorProfileKey })
    },
  })
}

export function useBrandProfile(enabled = true) {
  return useQuery<BrandProfile>({
    queryKey: brandProfileKey,
    queryFn: fetchBrandProfile,
    enabled,
  })
}

export function useUpdateBrandProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBrandProfileInput) => updateBrandProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(brandProfileKey, profile)
    },
  })
}
