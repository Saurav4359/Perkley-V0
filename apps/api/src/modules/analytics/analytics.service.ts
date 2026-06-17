import { forbidden, notFound, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import { estimateCreatorEarnings } from "../dashboard/dashboard.utils"
import {
  buildEngagementSummary,
  calculateWinRate,
  countByStatus,
  topPerformers,
  type AnalyticsSubmission,
} from "./analytics.utils"

async function requireCreatorUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "creator") throw forbidden("Creator role required.")
  return user
}

async function requireBrandUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "brand") throw forbidden("Brand role required.")
  return user
}

export async function getCreatorAnalytics(userId: string) {
  await requireCreatorUser(userId)

  const submissions = await prisma.campaignSubmission.findMany({
    where: { creatorId: userId },
    include: {
      campaign: {
        select: { type: true, fixedReward: true, prizeFirst: true },
      },
    },
  })

  const analyticsSubmissions: AnalyticsSubmission[] = submissions.map((submission) => ({
    views: submission.views,
    likes: submission.likes,
    comments: submission.comments,
    status: submission.status,
    engagementScore: submission.engagementScore,
  }))

  const wins = submissions.filter((submission) =>
    ["won", "paid"].includes(submission.status)
  ).length

  const earningsInr = submissions.reduce(
    (total, submission) =>
      total +
      estimateCreatorEarnings({
        status: submission.status,
        campaignType: submission.campaign.type,
        fixedReward: submission.campaign.fixedReward,
        prizeFirst: submission.campaign.prizeFirst,
      }),
    0
  )

  return {
    engagement: buildEngagementSummary(analyticsSubmissions),
    statusBreakdown: countByStatus(submissions),
    winRate: calculateWinRate({ submissions: submissions.length, wins }),
    wins,
    estimatedEarningsInr: earningsInr,
  }
}

export async function getBrandAnalytics(userId: string) {
  await requireBrandUser(userId)

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: userId },
    select: { id: true, status: true },
  })
  const campaignIds = campaigns.map((campaign) => campaign.id)

  const [applications, submissions, escrows] = await Promise.all([
    campaignIds.length
      ? prisma.campaignApplication.count({ where: { campaignId: { in: campaignIds } } })
      : Promise.resolve(0),
    campaignIds.length
      ? prisma.campaignSubmission.findMany({
          where: { campaignId: { in: campaignIds } },
          select: {
            views: true,
            likes: true,
            comments: true,
            status: true,
            engagementScore: true,
          },
        })
      : Promise.resolve([]),
    campaignIds.length
      ? prisma.escrowTransaction.findMany({
          where: { campaignId: { in: campaignIds } },
          select: { amountInr: true, releasedAmountInr: true },
        })
      : Promise.resolve([]),
  ])

  const totalBudgetInr = escrows.reduce((sum, escrow) => sum + escrow.amountInr, 0)
  const releasedInr = escrows.reduce((sum, escrow) => sum + escrow.releasedAmountInr, 0)

  return {
    campaigns: campaigns.length,
    activeCampaigns: campaigns.filter((campaign) => campaign.status === "active").length,
    completedCampaigns: campaigns.filter((campaign) => campaign.status === "completed").length,
    totalApplications: applications,
    engagement: buildEngagementSummary(submissions),
    statusBreakdown: countByStatus(submissions),
    spend: {
      totalBudgetInr,
      releasedInr,
      remainingInr: Math.max(0, totalBudgetInr - releasedInr),
    },
  }
}

export async function getCampaignAnalytics(brandId: string, campaignId: string) {
  await requireBrandUser(brandId)

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
    select: { id: true, title: true, type: true, status: true },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const [applicationCount, submissions] = await Promise.all([
    prisma.campaignApplication.count({ where: { campaignId } }),
    prisma.campaignSubmission.findMany({
      where: { campaignId },
      include: {
        creator: {
          select: {
            id: true,
            creatorProfile: { select: { displayName: true } },
          },
        },
      },
    }),
  ])

  const analyticsSubmissions: AnalyticsSubmission[] = submissions.map((submission) => ({
    views: submission.views,
    likes: submission.likes,
    comments: submission.comments,
    status: submission.status,
    engagementScore: submission.engagementScore,
  }))

  const performers = topPerformers(
    submissions.map((submission) => ({
      submissionId: submission.id,
      creatorId: submission.creatorId,
      creatorName: submission.creator.creatorProfile?.displayName ?? "Creator",
      views: submission.views,
      likes: submission.likes,
      comments: submission.comments,
      engagementScore: submission.engagementScore,
      status: submission.status,
    })),
    5
  )

  return {
    campaign,
    applicationCount,
    engagement: buildEngagementSummary(analyticsSubmissions),
    statusBreakdown: countByStatus(submissions),
    topPerformers: performers,
  }
}
