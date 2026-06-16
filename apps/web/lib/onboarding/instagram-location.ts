import type { InstagramProfile } from "@/lib/onboarding/types"

export function getCreatorLocation(instagram: InstagramProfile | null | undefined) {
  const value = instagram?.location?.trim()
  if (!value) return "Synced from Instagram"
  if (/^based in/i.test(value)) return value
  return `Based in ${value}`
}
