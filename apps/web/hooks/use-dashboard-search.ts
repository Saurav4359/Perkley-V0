"use client"

import { useMemo } from "react"

import { useMyCampaigns, usePublicCampaigns } from "@/hooks/use-campaigns"
import { useBrandProfile } from "@/hooks/use-profile"
import { apiCampaignToBrandItem, apiCampaignToFeedItem } from "@/lib/dashboard/campaign-adapter"
import type { BrandCampaign, Campaign } from "@/lib/dashboard/feed-types"

export type DashboardSearchResult = {
  id: string
  title: string
  brand: string
  type: Campaign["type"]
  niche: Campaign["niche"]
  href: string
  isOwnListing?: boolean
}

function listingHref(id: string, brand: string, mode: "brand" | "creator", ownBrandName?: string) {
  if (mode === "creator") return `/dashboard/campaigns/${id}`
  if (ownBrandName && brand === ownBrandName) return `/dashboard/brand/campaigns/${id}`
  return `/dashboard/brand/listings/${id}`
}

function matchesQuery(haystack: string, query: string) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  return tokens.every((token) => haystack.includes(token))
}

function filterCampaigns(campaigns: Array<Campaign | BrandCampaign>, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return campaigns.filter((listing) => {
    const haystack = [
      listing.id,
      listing.title,
      listing.brand,
      listing.type,
      listing.niche,
      listing.tagline,
    ]
      .join(" ")
      .toLowerCase()

    return matchesQuery(haystack, normalized)
  })
}

export function useDashboardSearch(
  query: string,
  mode: "brand" | "creator",
  limit = 8
) {
  const trimmed = query.trim()
  const publicQuery = usePublicCampaigns(trimmed ? { q: trimmed } : {})
  const mineQuery = useMyCampaigns()
  const brandProfile = useBrandProfile(mode === "brand")

  const results = useMemo((): DashboardSearchResult[] => {
    if (!trimmed) return []

    const ownBrandName = brandProfile.data?.brandName

    if (mode === "creator") {
      const items = publicQuery.data?.map(apiCampaignToFeedItem) ?? []
      return filterCampaigns(items, trimmed)
        .slice(0, limit)
        .map((listing) => ({
          id: listing.id,
          title: listing.title,
          brand: listing.brand,
          type: listing.type,
          niche: listing.niche,
          href: listingHref(listing.id, listing.brand, mode),
        }))
    }

    const marketplace = publicQuery.data?.map(apiCampaignToFeedItem) ?? []
    const mine = mineQuery.data?.map(apiCampaignToBrandItem) ?? []
    const seen = new Set<string>()
    const merged: Array<Campaign | BrandCampaign> = []

    for (const listing of mine) {
      if (seen.has(listing.id)) continue
      seen.add(listing.id)
      merged.push(listing)
    }
    for (const listing of marketplace) {
      if (seen.has(listing.id)) continue
      seen.add(listing.id)
      merged.push(listing)
    }

    return filterCampaigns(merged, trimmed)
      .slice(0, limit)
      .map((listing) => ({
        id: listing.id,
        title: listing.title,
        brand: listing.brand,
        type: listing.type,
        niche: listing.niche,
        href: listingHref(listing.id, listing.brand, mode, ownBrandName),
        isOwnListing: Boolean(ownBrandName && listing.brand === ownBrandName),
      }))
  }, [
    trimmed,
    mode,
    limit,
    publicQuery.data,
    mineQuery.data,
    brandProfile.data?.brandName,
  ])

  return {
    results,
    isLoading: publicQuery.isLoading || (mode === "brand" && mineQuery.isLoading),
  }
}
