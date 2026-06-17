import type { ApplicationStatus, CampaignStatus, CampaignType } from "@prisma/client"

export type ApplicationEligibilityInput = {
  campaignStatus: CampaignStatus
  campaignDeadline: Date
  campaignType: CampaignType
  minFollowers: number
  maxCreators: number | null
  acceptedCount: number
  creatorFollowers: number | null
  existingStatus?: ApplicationStatus | null
  now?: Date
}

export function initialApplicationStatus(campaignType: CampaignType): ApplicationStatus {
  return campaignType === "bounty" ? "accepted" : "pending"
}

export function canApplyToCampaign(input: ApplicationEligibilityInput) {
  const now = input.now ?? new Date()
  const reasons: string[] = []

  if (input.campaignStatus !== "active") {
    reasons.push("campaign_not_active")
  }

  if (input.campaignDeadline.getTime() <= now.getTime()) {
    reasons.push("campaign_deadline_passed")
  }

  if (input.existingStatus && input.existingStatus !== "withdrawn" && input.existingStatus !== "rejected") {
    reasons.push("already_applied")
  }

  const followers = input.creatorFollowers ?? 0
  if (followers < input.minFollowers) {
    reasons.push("insufficient_followers")
  }

  if (input.campaignType === "campaign") {
    if (!input.maxCreators || input.maxCreators <= 0) {
      reasons.push("campaign_full")
    } else if (input.acceptedCount >= input.maxCreators) {
      reasons.push("campaign_full")
    }
  }

  return {
    ok: reasons.length === 0,
    reasons,
  }
}

export function canWithdrawApplication(status: ApplicationStatus) {
  return status === "pending" || status === "accepted"
}

export function canReviewApplication(status: ApplicationStatus) {
  return status === "pending"
}

export function canAcceptApplication(input: {
  campaignType: CampaignType
  status: ApplicationStatus
  acceptedCount: number
  maxCreators: number | null
}) {
  if (input.campaignType === "bounty") {
    return { ok: false, reason: "bounty_auto_accept" as const }
  }

  if (!canReviewApplication(input.status)) {
    return { ok: false, reason: "invalid_application_state" as const }
  }

  if (!input.maxCreators || input.acceptedCount >= input.maxCreators) {
    return { ok: false, reason: "campaign_full" as const }
  }

  return { ok: true as const }
}

export function canRejectApplication(status: ApplicationStatus) {
  return canReviewApplication(status)
}
