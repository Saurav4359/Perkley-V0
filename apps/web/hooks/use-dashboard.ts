"use client"

import { useQuery } from "@tanstack/react-query"

import {
  fetchBrandActivity,
  fetchBrandStats,
  fetchCreatorActivity,
  fetchCreatorStats,
} from "@/lib/api/dashboard"

export const dashboardKeys = {
  creatorStats: ["dashboard", "creator", "stats"] as const,
  creatorActivity: ["dashboard", "creator", "activity"] as const,
  brandStats: ["dashboard", "brand", "stats"] as const,
  brandActivity: ["dashboard", "brand", "activity"] as const,
}

export function useCreatorStats() {
  return useQuery({
    queryKey: dashboardKeys.creatorStats,
    queryFn: fetchCreatorStats,
  })
}

export function useCreatorActivity(limit = 10) {
  return useQuery({
    queryKey: [...dashboardKeys.creatorActivity, limit],
    queryFn: () => fetchCreatorActivity(limit),
  })
}

export function useBrandStats() {
  return useQuery({
    queryKey: dashboardKeys.brandStats,
    queryFn: fetchBrandStats,
  })
}

export function useBrandActivity(limit = 10) {
  return useQuery({
    queryKey: [...dashboardKeys.brandActivity, limit],
    queryFn: () => fetchBrandActivity(limit),
  })
}
