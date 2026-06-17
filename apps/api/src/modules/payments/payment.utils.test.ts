import { describe, expect, test } from "bun:test"

import {
  calculateBountyPayoutAmount,
  calculateCampaignPayoutAmount,
  canInitiateEscrowFunding,
  canPublishWithEscrow,
  canRefundEscrow,
  canReleasePayments,
  eligibleSubmissionStatus,
  escrowRemainingAmount,
  nextEscrowStatusAfterRelease,
} from "./payment.utils"

describe("payment utilities", () => {
  test("calculates remaining escrow balance", () => {
    expect(escrowRemainingAmount({ amountInr: 100_000, releasedAmountInr: 25_000, status: "funded" })).toBe(
      75_000
    )
  })

  test("requires funded escrow before publish", () => {
    expect(canPublishWithEscrow("funded").ok).toBe(true)
    expect(canPublishWithEscrow("pending").ok).toBe(false)
  })

  test("only draft campaigns can initiate escrow funding", () => {
    expect(canInitiateEscrowFunding("draft").ok).toBe(true)
    expect(canInitiateEscrowFunding("active").ok).toBe(false)
    expect(canInitiateEscrowFunding("draft", "funded").ok).toBe(false)
  })

  test("maps eligible submission status by campaign type", () => {
    expect(eligibleSubmissionStatus("bounty")).toBe("won")
    expect(eligibleSubmissionStatus("campaign")).toBe("qualified")
  })

  test("validates release rules by campaign type", () => {
    expect(
      canReleasePayments({
        campaignStatus: "completed",
        campaignType: "bounty",
        escrowStatus: "funded",
        remainingAmountInr: 10_000,
      }).ok
    ).toBe(true)

    expect(
      canReleasePayments({
        campaignStatus: "active",
        campaignType: "bounty",
        escrowStatus: "funded",
        remainingAmountInr: 10_000,
      }).ok
    ).toBe(false)

    expect(
      canReleasePayments({
        campaignStatus: "active",
        campaignType: "campaign",
        escrowStatus: "funded",
        remainingAmountInr: 10_000,
      }).ok
    ).toBe(true)
  })

  test("calculates payout amounts", () => {
    expect(calculateCampaignPayoutAmount(5000)).toBe(5000)
    expect(
      calculateBountyPayoutAmount({
        submissionId: "submission-2",
        ranked: [
          { submissionId: "submission-1", rank: 1 },
          { submissionId: "submission-2", rank: 2 },
        ],
        prizes: {
          prizeFirst: 50_000,
          prizeSecond: 25_000,
          prizeThird: 10_000,
          prizeTop20Each: 1000,
        },
      })
    ).toBe(25_000)
  })

  test("tracks escrow status after release", () => {
    expect(
      nextEscrowStatusAfterRelease({
        amountInr: 100_000,
        releasedAmountInr: 90_000,
        releaseAmountInr: 10_000,
      })
    ).toBe("released")
  })

  test("blocks refund while payouts are active", () => {
    expect(
      canRefundEscrow({
        escrowStatus: "funded",
        remainingAmountInr: 50_000,
        hasActivePayouts: true,
      }).ok
    ).toBe(false)
  })
})
