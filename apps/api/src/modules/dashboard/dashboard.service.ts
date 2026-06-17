import { forbidden, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import {
  buildCampaignSearchHaystack,
  matchesSearchQuery,
} from "../campaigns/campaign-list.utils"
import { listPublicCampaigns } from "../campaigns/campaign.service"
import {
  brandApplicationAction,
  brandSubmissionAction,
  buildSearchResult,
  creatorApplicationAction,
  creatorSubmissionAction,
  estimateCreatorEarnings,
  mergeActivity,
  type DashboardActivityItem,
} from "./dashboard.utils"

async function requireCreatorUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "creator") throw forbidden("Creator role required.")
  return user
}

async function requireBrandUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { brandProfile: true },
  })
  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "brand") throw forbidden("Brand role required.")
  return user
}

export async function getCreatorStats(userId: string) {
  await requireCreatorUser(userId)

  const [applications, submissions, openCampaigns] = await Promise.all([
    prisma.campaignApplication.findMany({
      where: { creatorId: userId },
      select: { status: true },
    }),
    prisma.campaignSubmission.findMany({
      where: { creatorId: userId },
      include: {
        campaign: {
          select: {
            type: true,
            fixedReward: true,
            prizeFirst: true,
          },
        },
      },
    }),
    prisma.campaign.count({ where: { status: "active" } }),
  ])

  const estimatedEarningsInr = submissions.reduce(
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
    applications: applications.length,
    pendingApplications: applications.filter((item) => item.status === "pending").length,
    acceptedApplications: applications.filter((item) => item.status === "accepted").length,
    submissions: submissions.length,
    competing: submissions.filter((item) => item.status === "competing").length,
    underReview: submissions.filter((item) => item.status === "under_review").length,
    qualified: submissions.filter((item) => item.status === "qualified").length,
    won: submissions.filter((item) => item.status === "won").length,
    estimatedEarningsInr,
    openCampaigns,
  }
}

export async function getBrandStats(userId: string) {
  await requireBrandUser(userId)

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: userId },
    select: { id: true, status: true },
  })

  const campaignIds = campaigns.map((campaign) => campaign.id)

  const [applications, submissions] = await Promise.all([
    campaignIds.length
      ? prisma.campaignApplication.findMany({
          where: { campaignId: { in: campaignIds } },
          select: { status: true },
        })
      : Promise.resolve([]),
    campaignIds.length
      ? prisma.campaignSubmission.findMany({
          where: { campaignId: { in: campaignIds } },
          select: { status: true },
        })
      : Promise.resolve([]),
  ])

  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((campaign) => campaign.status === "active").length,
    draftCampaigns: campaigns.filter((campaign) => campaign.status === "draft").length,
    completedCampaigns: campaigns.filter((campaign) => campaign.status === "completed").length,
    totalApplications: applications.length,
    pendingApplications: applications.filter((item) => item.status === "pending").length,
    totalSubmissions: submissions.length,
    pendingReviews: submissions.filter((item) =>
      ["under_review", "competing", "submitted"].includes(item.status)
    ).length,
  }
}

export async function getCreatorRecentActivity(userId: string, limit = 10) {
  await requireCreatorUser(userId)

  const [applications, submissions] = await Promise.all([
    prisma.campaignApplication.findMany({
      where: { creatorId: userId },
      include: {
        campaign: { select: { id: true, title: true, type: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }),
    prisma.campaignSubmission.findMany({
      where: { creatorId: userId },
      include: {
        campaign: { select: { id: true, title: true, type: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }),
  ])

  const activity: DashboardActivityItem[] = [
    ...applications.map((application) => ({
      id: `application:${application.id}`,
      kind: "application" as const,
      campaignId: application.campaignId,
      campaignTitle: application.campaign.title,
      actorName: "You",
      action: creatorApplicationAction(application.status),
      occurredAt: application.updatedAt.toISOString(),
    })),
    ...submissions.map((submission) => ({
      id: `submission:${submission.id}`,
      kind: "submission" as const,
      campaignId: submission.campaignId,
      campaignTitle: submission.campaign.title,
      actorName: "You",
      action: creatorSubmissionAction(submission.status, submission.campaign.type),
      occurredAt: submission.updatedAt.toISOString(),
    })),
  ]

  return mergeActivity(activity, limit)
}

export async function getBrandRecentActivity(userId: string, limit = 10) {
  await requireBrandUser(userId)

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: userId },
    select: { id: true, title: true, status: true, updatedAt: true, publishedAt: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  })

  const campaignIds = campaigns.map((campaign) => campaign.id)

  const [applications, submissions] = await Promise.all([
    campaignIds.length
      ? prisma.campaignApplication.findMany({
          where: { campaignId: { in: campaignIds } },
          include: {
            campaign: { select: { id: true, title: true } },
            creator: {
              select: {
                creatorProfile: { select: { displayName: true } },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: limit,
        })
      : Promise.resolve([]),
    campaignIds.length
      ? prisma.campaignSubmission.findMany({
          where: { campaignId: { in: campaignIds } },
          include: {
            campaign: { select: { id: true, title: true } },
            creator: {
              select: {
                creatorProfile: { select: { displayName: true } },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: limit,
        })
      : Promise.resolve([]),
  ])

  const activity: DashboardActivityItem[] = [
    ...campaigns
      .filter((campaign) => campaign.status === "active" && campaign.publishedAt)
      .map((campaign) => ({
        id: `campaign:${campaign.id}`,
        kind: "campaign" as const,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        actorName: "You",
        action: "published a campaign",
        occurredAt: (campaign.publishedAt ?? campaign.updatedAt).toISOString(),
      })),
    ...applications.map((application) => {
      const creatorName = application.creator.creatorProfile?.displayName ?? "Creator"
      return {
        id: `application:${application.id}`,
        kind: "application" as const,
        campaignId: application.campaignId,
        campaignTitle: application.campaign.title,
        actorName: creatorName,
        action: brandApplicationAction(creatorName, application.status),
        occurredAt: application.updatedAt.toISOString(),
      }
    }),
    ...submissions.map((submission) => {
      const creatorName = submission.creator.creatorProfile?.displayName ?? "Creator"
      return {
        id: `submission:${submission.id}`,
        kind: "review" as const,
        campaignId: submission.campaignId,
        campaignTitle: submission.campaign.title,
        actorName: creatorName,
        action: brandSubmissionAction(creatorName, submission.status),
        occurredAt: submission.updatedAt.toISOString(),
      }
    }),
  ]

  return mergeActivity(activity, limit)
}

export async function getCreatorDashboard(userId: string) {
  const [stats, recentActivity] = await Promise.all([
    getCreatorStats(userId),
    getCreatorRecentActivity(userId, 10),
  ])

  return { stats, recentActivity }
}

export async function getBrandDashboard(userId: string) {
  const [stats, recentActivity] = await Promise.all([
    getBrandStats(userId),
    getBrandRecentActivity(userId, 10),
  ])

  return { stats, recentActivity }
}

export async function searchCreatorCampaigns(query: string, limit = 8) {
  const campaigns = await listPublicCampaigns({ q: query, sort: "published_at_desc" })

  return campaigns.slice(0, limit).map((campaign) =>
    buildSearchResult({
      id: campaign.id,
      title: campaign.title,
      brandName: campaign.brandName,
      type: campaign.type,
      niche: campaign.niche,
      brandId: campaign.brandId,
    })
  )
}

export async function searchBrandCampaigns(brandId: string, query: string, limit = 8) {
  await requireBrandUser(brandId)

  const [marketplace, owned] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "active" },
      include: {
        brand: {
          select: {
            id: true,
            brandProfile: { select: { brandName: true } },
          },
        },
      },
    }),
    prisma.campaign.findMany({
      where: { brandId },
      include: {
        brand: {
          select: {
            id: true,
            brandProfile: { select: { brandName: true } },
          },
        },
      },
    }),
  ])

  const deduped = new Map<string, (typeof marketplace)[number]>()
  for (const campaign of [...marketplace, ...owned]) {
    deduped.set(campaign.id, campaign)
  }

  return [...deduped.values()]
    .filter((campaign) => {
      const haystack = buildCampaignSearchHaystack({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        niche: campaign.niche,
        type: campaign.type,
        platform: campaign.platform,
        brandName: campaign.brand.brandProfile?.brandName,
      })
      return matchesSearchQuery(haystack, query)
    })
    .slice(0, limit)
    .map((campaign) =>
      buildSearchResult({
        id: campaign.id,
        title: campaign.title,
        brandName: campaign.brand.brandProfile?.brandName ?? "Brand",
        type: campaign.type,
        niche: campaign.niche,
        brandId: campaign.brandId,
        viewerBrandId: brandId,
      })
    )
}
