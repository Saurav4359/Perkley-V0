import type { CreatorSubmission } from "@/lib/api/submissions"
import type { ListingType, Submission, SubmissionStatus } from "@/lib/dashboard/types"

export function creatorSubmissionToSubmission(
  item: CreatorSubmission
): Submission {
  const type = (item.campaign?.type === "bounty" ? "bounty" : "campaign") as ListingType

  return {
    id: item.id,
    listingId: item.campaignId,
    listingTitle: item.campaign?.title ?? "Campaign",
    listingType: type,
    creatorId: "me",
    creatorName: "You",
    creatorInitials: "You".slice(0, 1),
    creatorFollowers: 0,
    postUrl: item.postUrl,
    views: item.views,
    likes: item.likes,
    comments: item.comments,
    engagementScore: item.engagementScore,
    status: item.status as SubmissionStatus,
    submittedAt: item.createdAt,
    lastSyncedAt: item.validatedAt ?? item.updatedAt,
  }
}
