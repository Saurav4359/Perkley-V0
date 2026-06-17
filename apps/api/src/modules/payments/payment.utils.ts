import type { CampaignStatus, CampaignType, EscrowStatus, PayoutStatus, SubmissionStatus } from "@prisma/client"

import { getPrizeAmountForRank } from "../leaderboard/leaderboard.utils"

export type EscrowSnapshot = {
  amountInr: number
  releasedAmountInr: number
  status: EscrowStatus
}

export function escrowRemainingAmount(escrow: EscrowSnapshot) {
  return Math.max(0, escrow.amountInr - escrow.releasedAmountInr)
}

export function calculateEscrowAmount(totalBudget: number) {
  return totalBudget
}

export function canInitiateEscrowFunding(campaignStatus: CampaignStatus, escrowStatus?: EscrowStatus) {
  if (campaignStatus !== "draft") {
    return { ok: false as const, reason: "campaign_not_draft" as const }
  }
  if (escrowStatus === "funded" || escrowStatus === "released") {
    return { ok: false as const, reason: "escrow_already_funded" as const }
  }
  if (escrowStatus === "refunded") {
    return { ok: false as const, reason: "escrow_refunded" as const }
  }
  return { ok: true as const }
}

export function canConfirmEscrowFunding(escrowStatus: EscrowStatus) {
  if (escrowStatus !== "pending") {
    return { ok: false as const, reason: "escrow_not_pending" as const }
  }
  return { ok: true as const }
}

export function canPublishWithEscrow(escrowStatus?: EscrowStatus) {
  if (escrowStatus !== "funded") {
    return { ok: false as const, reason: "escrow_not_funded" as const }
  }
  return { ok: true as const }
}

export function eligibleSubmissionStatus(campaignType: CampaignType): SubmissionStatus {
  return campaignType === "bounty" ? "won" : "qualified"
}

export function canReleasePayments(input: {
  campaignStatus: CampaignStatus
  campaignType: CampaignType
  escrowStatus: EscrowStatus
  remainingAmountInr: number
}) {
  if (input.escrowStatus !== "funded") {
    return { ok: false as const, reason: "escrow_not_funded" as const }
  }
  if (input.remainingAmountInr <= 0) {
    return { ok: false as const, reason: "escrow_depleted" as const }
  }
  if (input.campaignType === "bounty" && input.campaignStatus !== "completed") {
    return { ok: false as const, reason: "winners_not_selected" as const }
  }
  if (input.campaignType === "campaign" && !["active", "archived", "completed"].includes(input.campaignStatus)) {
    return { ok: false as const, reason: "campaign_not_ready" as const }
  }
  return { ok: true as const }
}

export function calculateCampaignPayoutAmount(fixedReward: number | null) {
  return fixedReward ?? 0
}

export function calculateBountyPayoutAmount(input: {
  submissionId: string
  ranked: Array<{ submissionId: string; rank: number }>
  prizes: {
    prizeFirst: number | null
    prizeSecond: number | null
    prizeThird: number | null
    prizeTop20Each: number | null
  }
}) {
  const entry = input.ranked.find((candidate) => candidate.submissionId === input.submissionId)
  if (!entry) return 0
  return getPrizeAmountForRank(entry.rank, input.prizes) ?? 0
}

export function canRefundEscrow(input: {
  escrowStatus: EscrowStatus
  remainingAmountInr: number
  hasActivePayouts: boolean
}) {
  if (input.escrowStatus !== "funded") {
    return { ok: false as const, reason: "escrow_not_funded" as const }
  }
  if (input.remainingAmountInr <= 0) {
    return { ok: false as const, reason: "escrow_depleted" as const }
  }
  if (input.hasActivePayouts) {
    return { ok: false as const, reason: "payouts_in_progress" as const }
  }
  return { ok: true as const }
}

export function nextEscrowStatusAfterRelease(input: {
  amountInr: number
  releasedAmountInr: number
  releaseAmountInr: number
}): EscrowStatus {
  const totalReleased = input.releasedAmountInr + input.releaseAmountInr
  return totalReleased >= input.amountInr ? "released" : "funded"
}

export function isTerminalPayoutStatus(status: PayoutStatus) {
  return status === "paid" || status === "failed"
}
