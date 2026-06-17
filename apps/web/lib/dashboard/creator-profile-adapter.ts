import type { CreatorProfile } from "@/lib/api/profile"
import type { CreatorStats } from "@/lib/api/dashboard"
import type { CreatorSubmission } from "@/lib/api/submissions"
import type { CreatorProfileData } from "@/lib/dashboard/creator-profile"
import { formatRelativeTime } from "@/lib/dashboard/utils"

function actionLabel(submission: CreatorSubmission) {
  if (submission.campaign?.type === "bounty") {
    return submission.status === "won" ? "won a bounty" : "submitted to a bounty"
  }
  if (submission.status === "paid") return "completed a campaign payout"
  if (submission.status === "qualified") return "qualified for a campaign"
  return "submitted to a campaign"
}

export function apiCreatorProfileToViewData(
  profile: CreatorProfile,
  stats?: CreatorStats,
  submissions: CreatorSubmission[] = []
): CreatorProfileData {
  const displayName = profile.displayName || "Creator"
  const handle = profile.instagramHandle?.replace(/^@/, "") ?? displayName.toLowerCase().replace(/\s+/g, "")

  return {
    displayName,
    handle,
    avatarInitial: displayName.slice(0, 1).toUpperCase(),
    profileImageUrl: profile.avatarUrl ?? "",
    location: profile.location ?? "",
    skills: profile.niches.length > 0 ? profile.niches : profile.contentTypes,
    stats: {
      earnedInr: stats?.estimatedEarningsInr ?? 0,
      submissions: stats?.submissions ?? submissions.length,
      won: stats?.won ?? 0,
    },
    activity: [...submissions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10)
      .map((submission) => ({
        id: submission.id,
        listingTitle: submission.campaign?.title ?? "Campaign",
        listingId: submission.campaignId,
        action: actionLabel(submission),
        timeAgo: formatRelativeTime(submission.createdAt),
        accent: "#FE6C37",
      })),
  }
}
