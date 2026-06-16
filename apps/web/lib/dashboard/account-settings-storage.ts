const CREATOR_NOTIFICATIONS_KEY = "perkley-creator-notification-settings"
const BRAND_NOTIFICATIONS_KEY = "perkley-brand-notification-settings"

export type CreatorNotificationSettings = {
  campaignUpdates: boolean
  submissionStatus: boolean
  payoutAlerts: boolean
}

export type BrandNotificationSettings = {
  newSubmissions: boolean
  reviewReminders: boolean
  payoutConfirmations: boolean
}

const DEFAULT_CREATOR_NOTIFICATIONS: CreatorNotificationSettings = {
  campaignUpdates: true,
  submissionStatus: true,
  payoutAlerts: true,
}

const DEFAULT_BRAND_NOTIFICATIONS: BrandNotificationSettings = {
  newSubmissions: true,
  reviewReminders: true,
  payoutConfirmations: true,
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) }
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures
  }
}

export function getCreatorNotificationSettings(): CreatorNotificationSettings {
  return readJson(CREATOR_NOTIFICATIONS_KEY, DEFAULT_CREATOR_NOTIFICATIONS)
}

export function saveCreatorNotificationSettings(settings: CreatorNotificationSettings) {
  writeJson(CREATOR_NOTIFICATIONS_KEY, settings)
}

export function getBrandNotificationSettings(): BrandNotificationSettings {
  return readJson(BRAND_NOTIFICATIONS_KEY, DEFAULT_BRAND_NOTIFICATIONS)
}

export function saveBrandNotificationSettings(settings: BrandNotificationSettings) {
  writeJson(BRAND_NOTIFICATIONS_KEY, settings)
}
