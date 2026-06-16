import { MOCK_INSTAGRAM_PROFILE } from "@/lib/onboarding/constants"
import { getCreatorLocation } from "@/lib/onboarding/instagram-location"
import { getCreatorSubmissions } from "@/lib/dashboard/listings-data"
import type { Submission } from "@/lib/dashboard/types"
import { formatInr, formatRelativeTime } from "@/lib/dashboard/utils"

export type CreatorProfileActivity = {
  id: string
  listingTitle: string
  listingId: string
  action: string
  timeAgo: string
  accent: string
}

export type CreatorProfileData = {
  displayName: string
  handle: string
  avatarInitial: string
  profileImageUrl: string
  location: string
  skills: string[]
  stats: {
    earnedInr: number
    submissions: number
    won: number
  }
  activity: CreatorProfileActivity[]
}

const LISTING_ACCENTS: Record<string, string> = {
  b1: "#FE6C37",
  c1: "#0A0A0A",
  b2: "#059669",
  c2: "#7C3AED",
}

function earningsForSubmission(submission: Submission) {
  if (submission.status === "paid") {
    return submission.listingType === "campaign" ? 3500 : 25000
  }
  if (submission.status === "won") {
    return submission.listingType === "campaign" ? 5000 : 25000
  }
  return 0
}

function actionLabel(submission: Submission) {
  if (submission.listingType === "bounty") {
    return submission.status === "competing"
      ? "submitted to a bounty"
      : submission.status === "won"
        ? "won a bounty"
        : "submitted to a bounty"
  }

  if (submission.status === "paid") return "completed a campaign payout"
  if (submission.status === "qualified") return "qualified for a campaign"
  return "submitted to a campaign"
}

function toActivityItem(submission: Submission): CreatorProfileActivity {
  return {
    id: submission.id,
    listingTitle: submission.listingTitle,
    listingId: submission.listingId,
    action: actionLabel(submission),
    timeAgo: formatRelativeTime(submission.submittedAt),
    accent: LISTING_ACCENTS[submission.listingId] ?? "#FE6C37",
  }
}

export function buildCreatorProfile(displayName = "Saurav Sharma"): CreatorProfileData {
  const submissions = getCreatorSubmissions()
  const earnedInr = submissions.reduce(
    (total, submission) => total + earningsForSubmission(submission),
    0
  )

  return {
    displayName,
    handle: MOCK_INSTAGRAM_PROFILE.username,
    avatarInitial: displayName.slice(0, 1).toUpperCase(),
    profileImageUrl: MOCK_INSTAGRAM_PROFILE.profileImageUrl,
    location: getCreatorLocation({
      ...MOCK_INSTAGRAM_PROFILE,
      connected: true,
    }),
    skills: ["Education", "Reels", "Lifestyle"],
    stats: {
      earnedInr,
      submissions: submissions.length,
      won: submissions.filter((submission) => submission.status === "won").length,
    },
    activity: [...submissions]
      .sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      .map(toActivityItem),
  }
}

export function formatProfileEarnings(amount: number) {
  return `₹${formatInr(amount)}`
}
