import type { NotificationType } from "@prisma/client"

export type NotificationKind =
  | "submit"
  | "qualified"
  | "payout"
  | "new"
  | "deadline"
  | "review"
  | "verification"

export function notificationKindForType(type: NotificationType): NotificationKind {
  switch (type) {
    case "new_campaign":
      return "new"
    case "application_accepted":
      return "qualified"
    case "submission_reviewed":
      return "review"
    case "winner_announced":
      return "qualified"
    case "payment_released":
      return "payout"
    default:
      return "review"
  }
}

export function buildApplicationAcceptedNotification(input: {
  campaignId: string
  campaignTitle: string
  brandName: string
}) {
  return {
    type: "application_accepted" as const,
    title: "Application accepted",
    body: `${input.brandName} accepted your application for ${input.campaignTitle}`,
    href: `/dashboard/campaigns/${input.campaignId}`,
    metadata: {
      campaignId: input.campaignId,
    },
  }
}

export function buildSubmissionReviewedNotification(input: {
  campaignId: string
  campaignTitle: string
  approved: boolean
}) {
  return {
    type: "submission_reviewed" as const,
    title: input.approved ? "Submission approved" : "Submission rejected",
    body: input.approved
      ? `Your submission for ${input.campaignTitle} was approved`
      : `Your submission for ${input.campaignTitle} was rejected`,
    href: `/dashboard/work`,
    metadata: {
      campaignId: input.campaignId,
      approved: input.approved,
    },
  }
}

export function buildWinnerAnnouncedNotification(input: {
  campaignId: string
  campaignTitle: string
  prizeAmount: number | null
}) {
  return {
    type: "winner_announced" as const,
    title: "You won!",
    body:
      input.prizeAmount && input.prizeAmount > 0
        ? `You won ${input.campaignTitle} — prize ₹${input.prizeAmount.toLocaleString("en-IN")}`
        : `You were selected as a winner for ${input.campaignTitle}`,
    href: `/dashboard/earnings`,
    metadata: {
      campaignId: input.campaignId,
      prizeAmount: input.prizeAmount,
    },
  }
}

export function buildNewCampaignNotification(input: {
  campaignId: string
  campaignTitle: string
  brandName: string
  campaignType: string
}) {
  return {
    type: "new_campaign" as const,
    title: `New ${input.campaignType} live`,
    body: `${input.brandName} posted ${input.campaignTitle}`,
    href: `/dashboard/campaigns/${input.campaignId}`,
    metadata: {
      campaignId: input.campaignId,
    },
  }
}

export function buildPaymentReleasedNotification(input: {
  campaignId: string
  campaignTitle: string
  amountInr: number
}) {
  return {
    type: "payment_released" as const,
    title: "Payout processed",
    body: `₹${input.amountInr.toLocaleString("en-IN")} was released for ${input.campaignTitle}`,
    href: `/dashboard/earnings`,
    metadata: {
      campaignId: input.campaignId,
      amountInr: input.amountInr,
    },
  }
}
