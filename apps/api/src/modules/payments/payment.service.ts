import type { Campaign, EscrowTransaction, Payout } from "@prisma/client"

import { badRequest, forbidden, notFound, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import { rankLeaderboardCandidates, creatorInitials } from "../leaderboard/leaderboard.utils"
import {
  notifyPaymentReleased,
  runNotificationSideEffect,
} from "../notifications/notification.publisher"
import {
  createEscrowOrder,
  createPayoutReference,
  verifyEscrowPayment,
} from "./payment.gateway"
import type { ConfirmEscrowInput, ReleasePaymentsInput } from "./payment.schemas"
import {
  calculateBountyPayoutAmount,
  calculateCampaignPayoutAmount,
  calculateEscrowAmount,
  canConfirmEscrowFunding,
  canInitiateEscrowFunding,
  canRefundEscrow,
  canReleasePayments,
  eligibleSubmissionStatus,
  escrowRemainingAmount,
  nextEscrowStatusAfterRelease,
} from "./payment.utils"

function serializeEscrow(escrow: EscrowTransaction) {
  const remainingAmountInr = escrowRemainingAmount(escrow)

  return {
    id: escrow.id,
    campaignId: escrow.campaignId,
    amountInr: escrow.amountInr,
    releasedAmountInr: escrow.releasedAmountInr,
    remainingAmountInr,
    status: escrow.status,
    razorpayOrderId: escrow.razorpayOrderId,
    razorpayPaymentId: escrow.razorpayPaymentId,
    fundedAt: escrow.fundedAt?.toISOString() ?? null,
    releasedAt: escrow.releasedAt?.toISOString() ?? null,
    refundedAt: escrow.refundedAt?.toISOString() ?? null,
    failureReason: escrow.failureReason,
    createdAt: escrow.createdAt.toISOString(),
  }
}

function serializePayout(payout: Payout & { campaign?: { title: string } }) {
  return {
    id: payout.id,
    campaignId: payout.campaignId,
    campaignTitle: payout.campaign?.title,
    submissionId: payout.submissionId,
    amountInr: payout.amountInr,
    status: payout.status,
    razorpayPayoutId: payout.razorpayPayoutId,
    failureReason: payout.failureReason,
    paidAt: payout.paidAt?.toISOString() ?? null,
    createdAt: payout.createdAt.toISOString(),
  }
}

async function requireBrandUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "brand") throw forbidden()
  return user
}

async function requireCreatorUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "creator") throw forbidden()
  return user
}

async function loadOwnedCampaign(brandId: string, campaignId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")
  return campaign
}

async function creatorHasPayoutMethod(creatorId: string) {
  const method = await prisma.creatorPayoutMethod.findFirst({
    where: { creatorId, isDefault: true },
  })
  return Boolean(method)
}

async function rankBountySubmissions(campaign: Campaign) {
  const submissions = await prisma.campaignSubmission.findMany({
    where: {
      campaignId: campaign.id,
      status: { in: ["competing", "won"] },
    },
    include: {
      creator: {
        select: {
          creatorProfile: {
            select: {
              displayName: true,
              followersCount: true,
            },
          },
        },
      },
    },
  })

  const candidates = submissions.map((submission) => ({
    submissionId: submission.id,
    creatorId: submission.creatorId,
    creatorName: submission.creator.creatorProfile?.displayName ?? "Creator",
    creatorInitials: creatorInitials(submission.creator.creatorProfile?.displayName ?? "Creator"),
    followers: submission.creator.creatorProfile?.followersCount ?? 0,
    views: submission.views,
    likes: submission.likes,
    comments: submission.comments,
    engagementScore: submission.engagementScore,
    submittedAt: submission.createdAt,
    status: submission.status,
  }))

  return rankLeaderboardCandidates(candidates, {
    prizeFirst: campaign.prizeFirst,
    prizeSecond: campaign.prizeSecond,
    prizeThird: campaign.prizeThird,
    prizeTop20Each: campaign.prizeTop20Each,
  })
}

export async function getCampaignEscrow(brandId: string, campaignId: string) {
  await requireBrandUser(brandId)
  await loadOwnedCampaign(brandId, campaignId)

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { campaignId },
  })

  return { escrow: escrow ? serializeEscrow(escrow) : null }
}

export async function initiateCampaignEscrowFunding(brandId: string, campaignId: string) {
  await requireBrandUser(brandId)
  const campaign = await loadOwnedCampaign(brandId, campaignId)
  const amountInr = calculateEscrowAmount(campaign.totalBudget)

  const existing = await prisma.escrowTransaction.findUnique({
    where: { campaignId },
  })

  const decision = canInitiateEscrowFunding(campaign.status, existing?.status)
  if (!decision.ok) {
    throw badRequest(`Cannot fund escrow: ${decision.reason}.`, decision.reason)
  }

  const order = await createEscrowOrder({ campaignId, amountInr })

  const escrow = existing
    ? await prisma.escrowTransaction.update({
        where: { id: existing.id },
        data: {
          amountInr,
          status: "pending",
          razorpayOrderId: order.orderId,
          razorpayPaymentId: null,
          failureReason: null,
          fundedAt: null,
          releasedAt: null,
          refundedAt: null,
          releasedAmountInr: 0,
        },
      })
    : await prisma.escrowTransaction.create({
        data: {
          campaignId,
          brandId,
          amountInr,
          status: "pending",
          razorpayOrderId: order.orderId,
        },
      })

  return {
    escrow: serializeEscrow(escrow),
    order,
  }
}

export async function confirmCampaignEscrowFunding(
  brandId: string,
  campaignId: string,
  input: ConfirmEscrowInput
) {
  await requireBrandUser(brandId)
  await loadOwnedCampaign(brandId, campaignId)

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { campaignId },
  })
  if (!escrow) throw notFound("Escrow not found.")

  const decision = canConfirmEscrowFunding(escrow.status)
  if (!decision.ok) {
    throw badRequest(`Cannot confirm escrow: ${decision.reason}.`, decision.reason)
  }

  if (escrow.razorpayOrderId && escrow.razorpayOrderId !== input.orderId) {
    throw badRequest("Escrow order does not match.", "invalid_escrow_order")
  }

  const verification = verifyEscrowPayment(input)
  if (!verification.ok) {
    const failed = await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: {
        status: "failed",
        failureReason: verification.reason,
      },
    })
    throw badRequest(`Escrow payment verification failed: ${verification.reason}.`, verification.reason)
  }

  const updated = await prisma.escrowTransaction.update({
    where: { id: escrow.id },
    data: {
      status: "funded",
      razorpayPaymentId: verification.paymentId,
      fundedAt: new Date(),
      failureReason: null,
    },
  })

  return { escrow: serializeEscrow(updated) }
}

export async function releaseCampaignPayments(
  brandId: string,
  campaignId: string,
  input: ReleasePaymentsInput = {}
) {
  await requireBrandUser(brandId)
  const campaign = await loadOwnedCampaign(brandId, campaignId)

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { campaignId },
  })
  if (!escrow) throw notFound("Escrow not found.")

  const remainingAmountInr = escrowRemainingAmount(escrow)
  const releaseDecision = canReleasePayments({
    campaignStatus: campaign.status,
    campaignType: campaign.type,
    escrowStatus: escrow.status,
    remainingAmountInr,
  })
  if (!releaseDecision.ok) {
    throw badRequest(`Cannot release payments: ${releaseDecision.reason}.`, releaseDecision.reason)
  }

  const targetStatus = eligibleSubmissionStatus(campaign.type)
  const submissions = await prisma.campaignSubmission.findMany({
    where: {
      campaignId,
      status: targetStatus,
      payout: null,
      ...(input.submissionIds ? { id: { in: input.submissionIds } } : {}),
    },
  })

  if (submissions.length === 0) {
    throw badRequest("No eligible submissions are ready for payout.", "no_eligible_submissions")
  }

  const ranked =
    campaign.type === "bounty" ? await rankBountySubmissions(campaign) : []

  const payoutPlans: Array<{ submission: (typeof submissions)[number]; amountInr: number }> = []
  for (const submission of submissions) {
    const hasPayoutMethod = await creatorHasPayoutMethod(submission.creatorId)
    if (!hasPayoutMethod) {
      throw badRequest(
        `Creator ${submission.creatorId} has no payout method on file.`,
        "creator_payout_method_missing"
      )
    }

    const amountInr =
      campaign.type === "bounty"
        ? calculateBountyPayoutAmount({
            submissionId: submission.id,
            ranked: ranked.map((entry) => ({
              submissionId: entry.submissionId,
              rank: entry.rank,
            })),
            prizes: {
              prizeFirst: campaign.prizeFirst,
              prizeSecond: campaign.prizeSecond,
              prizeThird: campaign.prizeThird,
              prizeTop20Each: campaign.prizeTop20Each,
            },
          })
        : calculateCampaignPayoutAmount(campaign.fixedReward)

    if (amountInr <= 0) {
      throw badRequest("Payout amount must be greater than zero.", "invalid_payout_amount")
    }

    payoutPlans.push({ submission, amountInr })
  }

  const totalReleaseAmount = payoutPlans.reduce((sum, plan) => sum + plan.amountInr, 0)
  if (totalReleaseAmount > remainingAmountInr) {
    throw badRequest("Escrow balance is insufficient for these payouts.", "insufficient_escrow")
  }

  const now = new Date()
  const nextStatus = nextEscrowStatusAfterRelease({
    amountInr: escrow.amountInr,
    releasedAmountInr: escrow.releasedAmountInr,
    releaseAmountInr: totalReleaseAmount,
  })

  const payouts = await prisma.$transaction(async (tx) => {
    const created = []

    for (const plan of payoutPlans) {
      const payout = await tx.payout.create({
        data: {
          escrowId: escrow.id,
          campaignId,
          submissionId: plan.submission.id,
          creatorId: plan.submission.creatorId,
          amountInr: plan.amountInr,
          status: "paid",
          razorpayPayoutId: createPayoutReference(plan.submission.id),
          paidAt: now,
        },
        include: {
          campaign: { select: { title: true } },
        },
      })

      await tx.campaignSubmission.update({
        where: { id: plan.submission.id },
        data: { status: "paid" },
      })

      created.push(payout)
    }

    await tx.escrowTransaction.update({
      where: { id: escrow.id },
      data: {
        releasedAmountInr: escrow.releasedAmountInr + totalReleaseAmount,
        status: nextStatus,
        releasedAt: nextStatus === "released" ? now : escrow.releasedAt,
      },
    })

    return created
  })

  for (const payout of payouts) {
    runNotificationSideEffect(
      notifyPaymentReleased({
        creatorId: payout.creatorId,
        campaignId,
        campaignTitle: payout.campaign.title,
        amountInr: payout.amountInr,
      })
    )
  }

  return {
    releasedAmountInr: totalReleaseAmount,
    payouts: payouts.map(serializePayout),
  }
}

export async function refundCampaignEscrow(brandId: string, campaignId: string) {
  await requireBrandUser(brandId)
  await loadOwnedCampaign(brandId, campaignId)

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { campaignId },
  })
  if (!escrow) throw notFound("Escrow not found.")

  const activePayouts = await prisma.payout.count({
    where: {
      escrowId: escrow.id,
      status: { in: ["pending", "processing", "on_hold"] },
    },
  })

  const remainingAmountInr = escrowRemainingAmount(escrow)
  const decision = canRefundEscrow({
    escrowStatus: escrow.status,
    remainingAmountInr,
    hasActivePayouts: activePayouts > 0,
  })
  if (!decision.ok) {
    throw badRequest(`Cannot refund escrow: ${decision.reason}.`, decision.reason)
  }

  const updated = await prisma.escrowTransaction.update({
    where: { id: escrow.id },
    data: {
      status: "refunded",
      refundedAt: new Date(),
    },
  })

  return {
    escrow: serializeEscrow(updated),
    refundedAmountInr: remainingAmountInr,
  }
}

export async function listCreatorPaymentHistory(
  creatorId: string,
  options: { limit?: number; status?: Payout["status"] } = {}
) {
  await requireCreatorUser(creatorId)

  const payouts = await prisma.payout.findMany({
    where: {
      creatorId,
      status: options.status,
    },
    include: {
      campaign: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 20,
  })

  return payouts.map(serializePayout)
}

export async function listBrandPaymentHistory(
  brandId: string,
  options: { limit?: number } = {}
) {
  await requireBrandUser(brandId)

  const escrows = await prisma.escrowTransaction.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 20,
    include: {
      campaign: { select: { title: true } },
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  return escrows.map((escrow) => ({
    ...serializeEscrow(escrow),
    campaignTitle: escrow.campaign.title,
    recentPayouts: escrow.payouts.map((payout) => serializePayout(payout)),
  }))
}

export async function assertEscrowFundedForPublish(campaignId: string) {
  const escrow = await prisma.escrowTransaction.findUnique({
    where: { campaignId },
  })

  if (!escrow || escrow.status !== "funded") {
    throw badRequest("Campaign escrow must be funded before publishing.", "escrow_not_funded")
  }
}
