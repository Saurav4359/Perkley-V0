import type { CampaignSubmission, Prisma, SubmissionStatus } from "@prisma/client"

import { badRequest, conflict, forbidden, notFound, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import {
  notifySubmissionReviewed,
  runNotificationSideEffect,
} from "../notifications/notification.publisher"
import type {
  CreateSubmissionInput,
  RejectSubmissionInput,
  UpdateSubmissionInput,
} from "./submission.schemas"
import {
  calculateEngagementScore,
  canApproveSubmission,
  canEditSubmission,
  canRejectSubmission,
  canSubmitSubmission,
  canValidateSubmission,
  statusAfterValidation,
  validateInstagramPostUrl,
} from "./submission.utils"

type SubmissionWithCreator = CampaignSubmission & {
  creator: {
    id: string
    creatorProfile: {
      displayName: string
      instagramHandle: string | null
      avatarUrl: string | null
      followersCount: number | null
    } | null
  }
  campaign: {
    id: string
    title: string
    type: string
    contentType: string
    status: string
    deadline: Date
  }
}

type SubmissionWithCampaign = CampaignSubmission & {
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

function serializeSubmission(submission: SubmissionWithCreator) {
  const profile = submission.creator.creatorProfile

  return {
    id: submission.id,
    applicationId: submission.applicationId,
    campaignId: submission.campaignId,
    creatorId: submission.creatorId,
    postUrl: submission.postUrl,
    note: submission.note,
    platform: submission.platform,
    platformMediaId: submission.platformMediaId,
    status: submission.status,
    validationResult: submission.validationResult,
    views: submission.views,
    likes: submission.likes,
    comments: submission.comments,
    engagementScore: submission.engagementScore,
    rejectionReason: submission.rejectionReason,
    validatedAt: submission.validatedAt,
    reviewedAt: submission.reviewedAt,
    reviewedBy: submission.reviewedBy,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    creator: {
      id: submission.creator.id,
      displayName: profile?.displayName ?? "Creator",
      instagramHandle: profile?.instagramHandle ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      followersCount: profile?.followersCount ?? null,
    },
    campaign: {
      id: submission.campaign.id,
      title: submission.campaign.title,
      type: submission.campaign.type,
      contentType: submission.campaign.contentType,
      status: submission.campaign.status,
      deadline: submission.campaign.deadline,
    },
  }
}

function serializeCreatorSubmission(submission: SubmissionWithCampaign) {
  const brandProfile = submission.campaign.brand.brandProfile

  return {
    id: submission.id,
    campaignId: submission.campaignId,
    postUrl: submission.postUrl,
    note: submission.note,
    status: submission.status,
    views: submission.views,
    likes: submission.likes,
    comments: submission.comments,
    engagementScore: submission.engagementScore,
    rejectionReason: submission.rejectionReason,
    validatedAt: submission.validatedAt,
    reviewedAt: submission.reviewedAt,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    campaign: {
      id: submission.campaign.id,
      title: submission.campaign.title,
      type: submission.campaign.type,
      status: submission.campaign.status,
      deadline: submission.campaign.deadline,
      brandName: brandProfile?.brandName ?? "Brand",
      brandLogoUrl: brandProfile?.logoUrl ?? null,
    },
  }
}

const submissionInclude = {
  creator: {
    select: {
      id: true,
      creatorProfile: {
        select: {
          displayName: true,
          instagramHandle: true,
          avatarUrl: true,
          followersCount: true,
        },
      },
    },
  },
  campaign: {
    select: {
      id: true,
      title: true,
      type: true,
      contentType: true,
      status: true,
      deadline: true,
    },
  },
} as const

async function requireCreatorUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { creatorProfile: true },
  })

  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "creator") throw forbidden("Creator role required.")
  if (!user.creatorProfile) throw badRequest("Creator profile is required before submitting.")

  return user
}

async function requireBrandUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  if (user.role !== "brand") throw forbidden("Brand role required.")
  return user
}

async function loadCampaignContext(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) throw notFound("Campaign not found.")
  return campaign
}

async function loadAcceptedApplication(campaignId: string, creatorId: string) {
  return prisma.campaignApplication.findUnique({
    where: {
      campaignId_creatorId: {
        campaignId,
        creatorId,
      },
    },
  })
}

async function loadSubmissionForCampaign(campaignId: string, submissionId: string) {
  const submission = await prisma.campaignSubmission.findFirst({
    where: { id: submissionId, campaignId },
    include: submissionInclude,
  })

  if (!submission) throw notFound("Submission not found.")
  return submission
}

function buildValidatedSubmissionData(input: {
  applicationId: string
  campaignId: string
  creatorId: string
  postUrl: string
  note?: string
  campaignType: "bounty" | "campaign"
  contentType: "reel" | "post" | "story"
}) {
  const validation = validateInstagramPostUrl(input.postUrl, input.contentType)
  if (!validation.ok || !validation.normalizedUrl) {
    throw badRequest(validation.errors.join(" "), "invalid_instagram_url")
  }

  const status = statusAfterValidation(input.campaignType)
  const now = new Date()

  return {
    applicationId: input.applicationId,
    campaignId: input.campaignId,
    creatorId: input.creatorId,
    postUrl: validation.normalizedUrl,
    note: input.note,
    status,
    validationResult: {
      ok: true,
      normalizedUrl: validation.normalizedUrl,
      detectedContentType: validation.detectedContentType,
      errors: [],
      validatedAt: now.toISOString(),
    },
    validatedAt: now,
    engagementScore: 0,
  }
}

export async function createSubmission(
  creatorId: string,
  campaignId: string,
  input: CreateSubmissionInput
) {
  await requireCreatorUser(creatorId)
  const campaign = await loadCampaignContext(campaignId)
  const application = await loadAcceptedApplication(campaignId, creatorId)

  const existing = await prisma.campaignSubmission.findUnique({
    where: { applicationId: application?.id ?? "" },
  })

  const eligibility = canSubmitSubmission({
    campaignStatus: campaign.status,
    campaignDeadline: campaign.deadline,
    applicationStatus: application?.status ?? null,
    hasExistingSubmission: Boolean(existing),
  })

  if (!eligibility.ok) {
    const code = eligibility.reasons[0] ?? "cannot_submit"
    if (code === "submission_exists") {
      throw conflict("You have already submitted to this campaign.", code)
    }
    throw badRequest(`Cannot submit: ${eligibility.reasons.join(", ")}.`, code)
  }

  const data = buildValidatedSubmissionData({
    applicationId: application!.id,
    campaignId,
    creatorId,
    postUrl: input.postUrl,
    note: input.note,
    campaignType: campaign.type,
    contentType: campaign.contentType,
  })

  const submission = await prisma.campaignSubmission.create({
    data,
    include: submissionInclude,
  })

  return serializeSubmission(submission)
}

export async function getMyCampaignSubmission(creatorId: string, campaignId: string) {
  await requireCreatorUser(creatorId)

  const application = await loadAcceptedApplication(campaignId, creatorId)
  if (!application) throw notFound("Submission not found.")

  const submission = await prisma.campaignSubmission.findUnique({
    where: { applicationId: application.id },
    include: submissionInclude,
  })

  if (!submission) throw notFound("Submission not found.")
  return serializeSubmission(submission)
}

export async function updateMyCampaignSubmission(
  creatorId: string,
  campaignId: string,
  input: UpdateSubmissionInput
) {
  await requireCreatorUser(creatorId)
  const campaign = await loadCampaignContext(campaignId)

  if (campaign.status !== "active" || campaign.deadline.getTime() <= Date.now()) {
    throw badRequest("Submissions can no longer be edited for this campaign.", "campaign_closed")
  }

  const application = await loadAcceptedApplication(campaignId, creatorId)
  if (!application) throw notFound("Submission not found.")

  const existing = await prisma.campaignSubmission.findUnique({
    where: { applicationId: application.id },
    include: submissionInclude,
  })

  if (!existing) throw notFound("Submission not found.")

  if (!canEditSubmission(existing.status)) {
    throw badRequest("This submission can no longer be edited.", "invalid_submission_state")
  }

  const nextPostUrl = input.postUrl ?? existing.postUrl
  const validation = validateInstagramPostUrl(nextPostUrl, campaign.contentType)
  if (!validation.ok || !validation.normalizedUrl) {
    throw badRequest(validation.errors.join(" "), "invalid_instagram_url")
  }

  const status = statusAfterValidation(campaign.type)
  const now = new Date()

  const submission = await prisma.campaignSubmission.update({
    where: { id: existing.id },
    data: {
      postUrl: validation.normalizedUrl,
      note: input.note === undefined ? existing.note : input.note,
      status,
      validationResult: {
        ok: true,
        normalizedUrl: validation.normalizedUrl,
        detectedContentType: validation.detectedContentType,
        errors: [],
        validatedAt: now.toISOString(),
      },
      validatedAt: now,
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    },
    include: submissionInclude,
  })

  return serializeSubmission(submission)
}

export async function validateSubmission(
  requesterId: string,
  requesterRole: "creator" | "brand",
  campaignId: string,
  submissionId: string
) {
  const campaign = await loadCampaignContext(campaignId)
  const submission = await loadSubmissionForCampaign(campaignId, submissionId)

  if (requesterRole === "creator") {
    if (submission.creatorId !== requesterId) throw forbidden()
    await requireCreatorUser(requesterId)
  } else {
    await requireBrandUser(requesterId)
    if (campaign.brandId !== requesterId) throw notFound("Campaign not found.")
  }

  if (!canValidateSubmission(submission.status)) {
    throw badRequest("This submission cannot be validated.", "invalid_submission_state")
  }

  const validation = validateInstagramPostUrl(submission.postUrl, campaign.contentType)
  const now = new Date()

  const updated = await prisma.campaignSubmission.update({
    where: { id: submission.id },
    data: {
      postUrl: validation.normalizedUrl ?? submission.postUrl,
      status: validation.ok ? statusAfterValidation(campaign.type) : "submitted",
      validationResult: {
        ok: validation.ok,
        normalizedUrl: validation.normalizedUrl,
        detectedContentType: validation.detectedContentType,
        errors: validation.errors,
        validatedAt: now.toISOString(),
      },
      validatedAt: now,
    },
    include: submissionInclude,
  })

  return serializeSubmission(updated)
}

export async function listCampaignSubmissions(
  brandId: string,
  campaignId: string,
  status?: SubmissionStatus
) {
  await requireBrandUser(brandId)

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const submissions = await prisma.campaignSubmission.findMany({
    where: { campaignId, status },
    include: submissionInclude,
    orderBy: [{ engagementScore: "desc" }, { createdAt: "desc" }],
  })

  return submissions.map(serializeSubmission)
}

export async function approveSubmission(
  brandId: string,
  campaignId: string,
  submissionId: string
) {
  await requireBrandUser(brandId)

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const submission = await loadSubmissionForCampaign(campaignId, submissionId)
  const decision = canApproveSubmission({
    campaignType: campaign.type,
    status: submission.status,
  })

  if (!decision.ok) {
    throw badRequest(`Cannot approve submission: ${decision.reason}.`, decision.reason)
  }

  const updated = await prisma.campaignSubmission.update({
    where: { id: submissionId },
    data: {
      status: "qualified",
      reviewedAt: new Date(),
      reviewedBy: brandId,
      rejectionReason: null,
    },
    include: submissionInclude,
  })

  runNotificationSideEffect(
    notifySubmissionReviewed({
      creatorId: updated.creatorId,
      campaignId,
      campaignTitle: updated.campaign.title,
      approved: true,
    })
  )

  return serializeSubmission(updated)
}
  brandId: string,
  campaignId: string,
  submissionId: string,
  input: RejectSubmissionInput
) {
  await requireBrandUser(brandId)

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")

  const submission = await loadSubmissionForCampaign(campaignId, submissionId)

  if (!canRejectSubmission(submission.status)) {
    throw badRequest("This submission cannot be rejected.", "invalid_submission_state")
  }

  const updated = await prisma.campaignSubmission.update({
    where: { id: submissionId },
    data: {
      status: "rejected",
      rejectionReason: input.reason,
      reviewedAt: new Date(),
      reviewedBy: brandId,
    },
    include: submissionInclude,
  })

  runNotificationSideEffect(
    notifySubmissionReviewed({
      creatorId: updated.creatorId,
      campaignId,
      campaignTitle: updated.campaign.title,
      approved: false,
    })
  )

  return serializeSubmission(updated)
}

export async function listCreatorSubmissions(creatorId: string, status?: SubmissionStatus) {
  await requireCreatorUser(creatorId)

  const where: Prisma.CampaignSubmissionWhereInput = {
    creatorId,
    status,
  }

  const submissions = await prisma.campaignSubmission.findMany({
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

  return submissions.map(serializeCreatorSubmission)
}

export { calculateEngagementScore }
