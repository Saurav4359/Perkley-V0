import type { ApplicationStatus, CampaignApplication, Prisma } from "@prisma/client"

import { badRequest, conflict, forbidden, notFound, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import {
  notifyApplicationAcceptedForCampaign,
  runNotificationSideEffect,
} from "../notifications/notification.publisher"
import type { ApplyToCampaignInput } from "./application.schemas"
import {
  canAcceptApplication,
  canApplyToCampaign,
  canRejectApplication,
  canWithdrawApplication,
  initialApplicationStatus,
} from "./application.utils"

type ApplicationWithCreator = CampaignApplication & {
  creator: {
    id: string
    creatorProfile: {
      displayName: string
      instagramHandle: string | null
      avatarUrl: string | null
      followersCount: number | null
      verificationStatus: string
    } | null
  }
}

type ApplicationWithCampaign = CampaignApplication & {
  campaign: {
    id: string
    title: string
    type: string
    status: string
    deadline: Date
    brandId: string
    brand: {
      brandProfile: {
        brandName: string
        logoUrl: string | null
      } | null
    }
  }
}

function serializeApplication(application: ApplicationWithCreator) {
  const profile = application.creator.creatorProfile

  return {
    id: application.id,
    campaignId: application.campaignId,
    creatorId: application.creatorId,
    status: application.status,
    message: application.message,
    reviewedAt: application.reviewedAt,
    reviewedBy: application.reviewedBy,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    creator: {
      id: application.creator.id,
      displayName: profile?.displayName ?? "Creator",
      instagramHandle: profile?.instagramHandle ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      followersCount: profile?.followersCount ?? null,
      verificationStatus: profile?.verificationStatus ?? "none",
    },
  }
}

function serializeCreatorApplication(application: ApplicationWithCampaign) {
  const brandProfile = application.campaign.brand.brandProfile

  return {
    id: application.id,
    campaignId: application.campaignId,
    status: application.status,
    message: application.message,
    reviewedAt: application.reviewedAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    campaign: {
      id: application.campaign.id,
      title: application.campaign.title,
      type: application.campaign.type,
      status: application.campaign.status,
      deadline: application.campaign.deadline,
      brandName: brandProfile?.brandName ?? "Brand",
      brandLogoUrl: brandProfile?.logoUrl ?? null,
    },
  }
}

async function requireCreatorUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { creatorProfile: true },
  })

  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "creator") throw forbidden("Creator role required.")
  if (!user.creatorProfile) throw badRequest("Creator profile is required before applying.")

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

async function loadActiveCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) throw notFound("Campaign not found.")
  return campaign
}

async function countAcceptedApplications(campaignId: string) {
  return prisma.campaignApplication.count({
    where: {
      campaignId,
      status: "accepted",
    },
  })
}

async function loadApplicationForCampaign(campaignId: string, applicationId: string) {
  const application = await prisma.campaignApplication.findFirst({
    where: {
      id: applicationId,
      campaignId,
    },
    include: {
      creator: {
        select: {
          id: true,
          creatorProfile: {
            select: {
              displayName: true,
              instagramHandle: true,
              avatarUrl: true,
              followersCount: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
  })

  if (!application) throw notFound("Application not found.")
  return application
}

export async function applyToCampaign(
  creatorId: string,
  campaignId: string,
  input: ApplyToCampaignInput
) {
  const creator = await requireCreatorUser(creatorId)
  const campaign = await loadActiveCampaign(campaignId)
  const acceptedCount = await countAcceptedApplications(campaignId)

  const existing = await prisma.campaignApplication.findUnique({
    where: {
      campaignId_creatorId: {
        campaignId,
        creatorId,
      },
    },
  })

  const eligibility = canApplyToCampaign({
    campaignStatus: campaign.status,
    campaignDeadline: campaign.deadline,
    campaignType: campaign.type,
    minFollowers: campaign.minFollowers,
    maxCreators: campaign.maxCreators,
    acceptedCount,
    creatorFollowers: creator.creatorProfile?.followersCount ?? null,
    existingStatus: existing?.status,
  })

  if (!eligibility.ok) {
    const code = eligibility.reasons[0] ?? "cannot_apply"
    if (code === "already_applied") {
      throw conflict("You have already applied to this campaign.", code)
    }
    throw badRequest(`Cannot apply to campaign: ${eligibility.reasons.join(", ")}.`, code)
  }

  const status = initialApplicationStatus(campaign.type)
  const reviewedAt = status === "accepted" ? new Date() : null

  const application = await prisma.campaignApplication.upsert({
    where: {
      campaignId_creatorId: {
        campaignId,
        creatorId,
      },
    },
    create: {
      campaignId,
      creatorId,
      status,
      message: input.message,
      reviewedAt,
    },
    update: {
      status,
      message: input.message ?? existing?.message,
      reviewedAt,
      reviewedBy: null,
    },
    include: {
      creator: {
        select: {
          id: true,
          creatorProfile: {
            select: {
              displayName: true,
              instagramHandle: true,
              avatarUrl: true,
              followersCount: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
  })

  if (status === "accepted") {
    runNotificationSideEffect(notifyApplicationAcceptedForCampaign(campaignId, creatorId))
  }

  return serializeApplication(application)
}

export async function withdrawApplication(creatorId: string, campaignId: string) {
  await requireCreatorUser(creatorId)
  await loadActiveCampaign(campaignId)

  const application = await prisma.campaignApplication.findUnique({
    where: {
      campaignId_creatorId: {
        campaignId,
        creatorId,
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          creatorProfile: {
            select: {
              displayName: true,
              instagramHandle: true,
              avatarUrl: true,
              followersCount: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
  })

  if (!application) throw notFound("Application not found.")

  if (!canWithdrawApplication(application.status)) {
    throw badRequest("This application cannot be withdrawn.", "invalid_application_state")
  }

  const updated = await prisma.campaignApplication.update({
    where: { id: application.id },
    data: { status: "withdrawn" },
    include: {
      creator: {
        select: {
          id: true,
          creatorProfile: {
            select: {
              displayName: true,
              instagramHandle: true,
              avatarUrl: true,
              followersCount: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
  })

  return serializeApplication(updated)
}

export async function listCampaignApplications(
  brandId: string,
  campaignId: string,
  status?: ApplicationStatus
) {
  await requireBrandUser(brandId)

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const applications = await prisma.campaignApplication.findMany({
    where: {
      campaignId,
      status,
    },
    include: {
      creator: {
        select: {
          id: true,
          creatorProfile: {
            select: {
              displayName: true,
              instagramHandle: true,
              avatarUrl: true,
              followersCount: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  })

  return applications.map(serializeApplication)
}

export async function acceptApplication(
  brandId: string,
  campaignId: string,
  applicationId: string
) {
  await requireBrandUser(brandId)

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const application = await loadApplicationForCampaign(campaignId, applicationId)
  const acceptedCount = await countAcceptedApplications(campaignId)

  const decision = canAcceptApplication({
    campaignType: campaign.type,
    status: application.status,
    acceptedCount,
    maxCreators: campaign.maxCreators,
  })

  if (!decision.ok) {
    throw badRequest(`Cannot accept application: ${decision.reason}.`, decision.reason)
  }

  const updated = await prisma.campaignApplication.update({
    where: { id: applicationId },
    data: {
      status: "accepted",
      reviewedAt: new Date(),
      reviewedBy: brandId,
    },
    include: {
      creator: {
        select: {
          id: true,
          creatorProfile: {
            select: {
              displayName: true,
              instagramHandle: true,
              avatarUrl: true,
              followersCount: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
  })

  runNotificationSideEffect(notifyApplicationAcceptedForCampaign(campaignId, updated.creatorId))

  return serializeApplication(updated)
}

export async function rejectApplication(
  brandId: string,
  campaignId: string,
  applicationId: string
) {
  await requireBrandUser(brandId)

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const application = await loadApplicationForCampaign(campaignId, applicationId)

  if (!canRejectApplication(application.status)) {
    throw badRequest("Only pending applications can be rejected.", "invalid_application_state")
  }

  const updated = await prisma.campaignApplication.update({
    where: { id: applicationId },
    data: {
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: brandId,
    },
    include: {
      creator: {
        select: {
          id: true,
          creatorProfile: {
            select: {
              displayName: true,
              instagramHandle: true,
              avatarUrl: true,
              followersCount: true,
              verificationStatus: true,
            },
          },
        },
      },
    },
  })

  return serializeApplication(updated)
}

export async function listCreatorApplications(creatorId: string, status?: ApplicationStatus) {
  await requireCreatorUser(creatorId)

  const where: Prisma.CampaignApplicationWhereInput = {
    creatorId,
    status,
  }

  const applications = await prisma.campaignApplication.findMany({
    where,
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          deadline: true,
          brandId: true,
          brand: {
            select: {
              brandProfile: {
                select: {
                  brandName: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  })

  return applications.map(serializeCreatorApplication)
}
