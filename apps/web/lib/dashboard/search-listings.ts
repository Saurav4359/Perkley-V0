import {
  BRAND_CAMPAIGNS,
  CREATOR_CAMPAIGNS,
  CURRENT_BRAND_NAME,
  MARKETPLACE_LISTINGS,
  type BrandCampaign,
  type Campaign,
} from "@/lib/dashboard/mock-data"

export type DashboardSearchResult = {
  id: string
  title: string
  brand: string
  type: Campaign["type"]
  niche: Campaign["niche"]
  href: string
  isOwnListing?: boolean
}

type SearchableListing = Pick<
  Campaign,
  "id" | "title" | "brand" | "type" | "niche" | "tagline"
>

function listingHref(id: string, brand: string, mode: "brand" | "creator") {
  if (mode === "creator") return `/dashboard/campaigns/${id}`
  if (brand === CURRENT_BRAND_NAME) return `/dashboard/brand/campaigns/${id}`
  return `/dashboard/brand/listings/${id}`
}

function dedupeListings(listings: SearchableListing[]) {
  const seen = new Map<string, SearchableListing>()
  for (const listing of listings) {
    if (!seen.has(listing.id)) seen.set(listing.id, listing)
  }
  return [...seen.values()]
}

function listingsForMode(mode: "brand" | "creator"): SearchableListing[] {
  if (mode === "creator") return CREATOR_CAMPAIGNS
  const brandListings: SearchableListing[] = BRAND_CAMPAIGNS.map(
    (listing: BrandCampaign) => ({
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      type: listing.type,
      niche: listing.niche,
      tagline: listing.tagline,
    })
  )
  return dedupeListings([...MARKETPLACE_LISTINGS, ...brandListings])
}

function matchesQuery(haystack: string, query: string) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  return tokens.every((token) => haystack.includes(token))
}

export function searchDashboardListings(
  query: string,
  mode: "brand" | "creator",
  limit = 8
): DashboardSearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return listingsForMode(mode)
    .filter((listing) => {
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
    .slice(0, limit)
    .map((listing) => ({
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      type: listing.type,
      niche: listing.niche,
      href: listingHref(listing.id, listing.brand, mode),
      isOwnListing: mode === "brand" && listing.brand === CURRENT_BRAND_NAME,
    }))
}
