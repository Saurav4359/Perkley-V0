import { BRAND_PROFILE_STORAGE_KEY } from "@/lib/onboarding/constants"
import type { Niche } from "@/lib/dashboard/types"

export type BrandVerificationStatus = "verified" | "pending" | "not_started"

export type BrandVisibility = "public" | "unlisted"

export type StoredBrandProfile = {
  name: string
  bio: string
  industry: Niche
  location: string
  website?: string
  workEmail?: string
  social: {
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  logoUrl?: string
  accent: string
  visibility: BrandVisibility
  verificationStatus: BrandVerificationStatus
  memberSince: string
  createdAt: string
}

const BRAND_ACCENT_PALETTE = [
  "#FE6C37",
  "#059669",
  "#6366F1",
  "#DC2626",
  "#0A0A0A",
  "#7C3AED",
] as const

function formatMemberSince(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
}

export function brandInitialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "B"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function brandAccentFromName(name: string) {
  const hash = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return BRAND_ACCENT_PALETTE[hash % BRAND_ACCENT_PALETTE.length]
}

export function normalizeBrandWebsite(url?: string): string | undefined {
  const trimmed = url?.trim()
  if (!trimmed) return undefined
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export type BrandProfileSeed = {
  name?: string
  website?: string
  workEmail?: string
}

export function createInitialBrandProfile(seed?: BrandProfileSeed): StoredBrandProfile {
  const createdAt = new Date()
  const name = seed?.name?.trim() || "Your brand"

  return {
    name,
    bio: "",
    industry: "lifestyle",
    location: "",
    website: normalizeBrandWebsite(seed?.website),
    workEmail: seed?.workEmail?.trim() || undefined,
    social: {},
    accent: brandAccentFromName(name),
    visibility: "public",
    verificationStatus: "not_started",
    memberSince: formatMemberSince(createdAt),
    createdAt: createdAt.toISOString(),
  }
}

function normalizeStoredBrandProfile(
  value: Partial<StoredBrandProfile> | null,
  seed?: BrandProfileSeed
): StoredBrandProfile {
  const defaults = createInitialBrandProfile(seed)
  if (!value) return defaults

  const name = value.name?.trim() || defaults.name

  return {
    ...defaults,
    ...value,
    name,
    bio: value.bio ?? defaults.bio,
    industry: value.industry ?? defaults.industry,
    location: value.location ?? defaults.location,
    website: normalizeBrandWebsite(value.website) ?? defaults.website,
    workEmail: value.workEmail?.trim() || defaults.workEmail,
    social: {
      ...defaults.social,
      ...value.social,
    },
    logoUrl: value.logoUrl || undefined,
    accent: value.accent ?? brandAccentFromName(name),
    visibility: value.visibility ?? defaults.visibility,
    verificationStatus: value.verificationStatus ?? defaults.verificationStatus,
    memberSince: value.memberSince ?? defaults.memberSince,
    createdAt: value.createdAt ?? defaults.createdAt,
  }
}

export function loadBrandProfileState(): StoredBrandProfile | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(BRAND_PROFILE_STORAGE_KEY)
    if (!raw) return null
    return normalizeStoredBrandProfile(JSON.parse(raw) as Partial<StoredBrandProfile>)
  } catch {
    return null
  }
}

export function getBrandProfileState(seed?: BrandProfileSeed): StoredBrandProfile {
  return normalizeStoredBrandProfile(loadBrandProfileState(), seed)
}

export function saveBrandProfileState(state: StoredBrandProfile) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(BRAND_PROFILE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage failures
  }
}

export function notifyBrandProfileUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("perkley-brand-profile-updated"))
}

export function patchBrandProfileState(
  patch: Partial<
    Pick<
      StoredBrandProfile,
      | "name"
      | "bio"
      | "industry"
      | "location"
      | "website"
      | "workEmail"
      | "social"
      | "logoUrl"
      | "visibility"
      | "verificationStatus"
    >
  >
): StoredBrandProfile {
  const current = getBrandProfileState()
  const name = patch.name?.trim() || current.name
  const next = normalizeStoredBrandProfile({
    ...current,
    ...patch,
    name,
    website: patch.website !== undefined ? normalizeBrandWebsite(patch.website) : current.website,
    workEmail: patch.workEmail?.trim() || current.workEmail,
    accent: brandAccentFromName(name),
    social: patch.social !== undefined ? { ...patch.social } : current.social,
  })
  saveBrandProfileState(next)
  notifyBrandProfileUpdated()
  return next
}

export function initBrandProfileState(seed?: BrandProfileSeed): StoredBrandProfile {
  const existing = loadBrandProfileState()
  if (existing) return existing

  const state = createInitialBrandProfile(seed)
  saveBrandProfileState(state)
  notifyBrandProfileUpdated()
  return state
}

/** Writes signup fields to storage — always replaces prior profile for a new registration. */
export function saveBrandProfileFromSignup(seed: BrandProfileSeed): StoredBrandProfile {
  const state = createInitialBrandProfile(seed)
  saveBrandProfileState(state)
  notifyBrandProfileUpdated()
  return state
}

export function mergeBrandProfileSeed(seed?: BrandProfileSeed): StoredBrandProfile {
  const existing = loadBrandProfileState()
  if (!existing) {
    return initBrandProfileState(seed)
  }

  const patch: Partial<StoredBrandProfile> = {}
  if (seed?.workEmail?.trim()) patch.workEmail = seed.workEmail.trim()
  if (seed?.website?.trim() && !existing.website) {
    patch.website = normalizeBrandWebsite(seed.website)
  }
  if (seed?.name?.trim() && existing.name === "Your brand") {
    patch.name = seed.name.trim()
  }

  if (
    patch.workEmail === undefined &&
    patch.website === undefined &&
    patch.name === undefined
  ) {
    return existing
  }

  return patchBrandProfileState(patch)
}

export function clearBrandProfileState() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(BRAND_PROFILE_STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}

export function getBrandHeaderName(): string {
  const profile = loadBrandProfileState()
  if (!profile) return "Brand"
  return profile.name.split(/\s+/)[0] || profile.name
}
