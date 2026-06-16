import { MOCK_INSTAGRAM_PROFILE } from "@/lib/onboarding/constants"
import type { InstagramProfile } from "@/lib/onboarding/types"

export function simulateInstagramConnect(): InstagramProfile {
  return {
    ...MOCK_INSTAGRAM_PROFILE,
    connected: true,
  }
}
