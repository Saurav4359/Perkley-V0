import type { Campaign, CampaignStatus, Prisma } from "@prisma/client"

import { badRequest, forbidden, notFound, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import type { CreateCampaignInput, UpdateCampaignInput } from "./campaign.schemas"
import {
  canArchiveCampaign,
  canDeleteCampaign,
  canPublishCampaign,
  validateCampaignForPublish,
} from "./campaign.utils"

function serializeCampaign(
  campaign: Campaign & {
    brand: {
      id: string
      brandProfile: { brandName: string | null; logoUrl: string | null } | null
    }
  }
) {
  return {
    id: campaign.id,
    brandId: campaign.brandId,
    brandName: campaign.brand.brandProfile?.brandName ?? "Brand",
    brandLogoUrl: campaign.brand.brandProfile?.logoUrl ?? null,
    type: campaign.type,
    title: campaign.title,
    description: campaign.description,
    niche: campaign.niche,
    platform: campaign.platform,
    contentType: campaign.contentType,
    minFollowers: campaign.minFollowers,
    requiredHashtag: campaign.requiredHashtag,
    requiredMention: campaign.requiredMention,
    deadline: campaign.deadline,
    status: campaign.status,
    totalBudget: campaign.totalBudget,
    maxCreators: campaign.maxCreators,
    minViewsThreshold: campaign.minViewsThreshold,
    fixedReward: campaign.fixedReward,
    prizeFirst: campaign.prizeFirst,
    prizeSecond: campaign.prizeSecond,
    prizeThird: campaign.prizeThird,
    prizeTop20Each: campaign.prizeTop20Each,
    publishedAt: campaign.publishedAt,
    archivedAt: campaign.archivedAt,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  }
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

async function loadCampaignForOwner(userId: string, campaignId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId: userId },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  })
  if (!campaign) throw notFound("Campaign not found.")
  return campaign
}

export async function createCampaign(userId: string, input: CreateCampaignInput) {
  await requireBrandUser(userId)

  const campaign = await prisma.campaign.create({
    data: {
      brandId: userId,
      type: input.type,
      title: input.title,
      description: input.description,
      niche: input.niche,
      platform: input.platform,
      contentType: input.contentType,
      minFollowers: input.minFollowers,
      requiredHashtag: input.requiredHashtag,
      requiredMention: input.requiredMention,
      deadline: input.deadline,
      totalBudget: input.totalBudget,
      maxCreators: input.maxCreators,
      minViewsThreshold: input.minViewsThreshold,
      fixedReward: input.fixedReward,
      prizeFirst: input.prizeFirst,
      prizeSecond: input.prizeSecond,
      prizeThird: input.prizeThird,
      prizeTop20Each: input.prizeTop20Each,
    },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  })

  return serializeCampaign(campaign)
}

export async function listPublicCampaigns(filters: {
  type?: Campaign["type"]
  niche?: string
  contentType?: Campaign["contentType"]
}) {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "active",
      type: filters.type,
      niche: filters.niche,
      contentType: filters.contentType,
    },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  })

  return campaigns.map(serializeCampaign)
}

export async function listMyCampaigns(userId: string, status?: CampaignStatus) {
  await requireBrandUser(userId)
  const campaigns = await prisma.campaign.findMany({
    where: {
      brandId: userId,
      status,
    },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  })

  return campaigns.map(serializeCampaign)
}

export async function getCampaign(campaignId: string, viewerId?: string | null) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const isOwner = viewerId ? campaign.brandId === viewerId : false
  if (!isOwner && campaign.status !== "active") {
    throw notFound("Campaign not found.")
  }

  return serializeCampaign(campaign)
}

export async function updateCampaign(userId: string, campaignId: string, input: UpdateCampaignInput) {
  await requireBrandUser(userId)
  const existing = await loadCampaignForOwner(userId, campaignId)

  if (existing.status !== "draft") {
    throw badRequest("Only draft campaigns can be edited.", "invalid_campaign_state")
  }

  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      type: input.type,
      title: input.title,
      description: input.description,
      niche: input.niche,
      platform: input.platform,
      contentType: input.contentType,
      minFollowers: input.minFollowers,
      requiredHashtag: input.requiredHashtag,
      requiredMention: input.requiredMention,
      deadline: input.deadline,
      totalBudget: input.totalBudget,
      maxCreators: input.maxCreators,
      minViewsThreshold: input.minViewsThreshold,
      fixedReward: input.fixedReward,
      prizeFirst: input.prizeFirst,
      prizeSecond: input.prizeSecond,
      prizeThird: input.prizeThird,
      prizeTop20Each: input.prizeTop20Each,
    },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  })

  return serializeCampaign(campaign)
}

export async function deleteCampaign(userId: string, campaignId: string) {
  await requireBrandUser(userId)
  const campaign = await loadCampaignForOwner(userId, campaignId)

  if (!canDeleteCampaign(campaign.status)) {
    throw badRequest("Only draft campaigns can be deleted.", "invalid_campaign_state")
  }

  await prisma.campaign.delete({ where: { id: campaignId } })
}

export async function publishCampaign(userId: string, campaignId: string) {
  await requireBrandUser(userId)
  const campaign = await loadCampaignForOwner(userId, campaignId)

  if (!canPublishCampaign(campaign.status)) {
    throw badRequest("Only draft campaigns can be published.", "invalid_campaign_state")
  }

  const validation = validateCampaignForPublish(campaign)
  if (!validation.ok) {
    throw badRequest(
      `Campaign is missing required publish fields: ${validation.missing.join(", ")}.`,
      "campaign_not_publishable"
    )
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "active",
      publishedAt: new Date(),
      archivedAt: null,
    },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  })

  return serializeCampaign(updated)
}

export async function archiveCampaign(userId: string, campaignId: string) {
  await requireBrandUser(userId)
  const campaign = await loadCampaignForOwner(userId, campaignId)

  if (!canArchiveCampaign(campaign.status)) {
    throw badRequest("Only active campaigns can be archived.", "invalid_campaign_state")
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "archived",
      archivedAt: new Date(),
    },
    include: {
      brand: {
        select: {
          id: true,
          brandProfile: {
            select: {
              brandName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  })

  return serializeCampaign(updated)
}
