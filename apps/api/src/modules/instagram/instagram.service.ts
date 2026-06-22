import { badRequest, forbidden, notFound, unauthorized } from "../../lib/http-error"
import { isInstagramConfigured } from "../../lib/env"
import { prisma } from "../../lib/prisma"
import { decryptSecret } from "../../lib/secrets"
import {
  buildSyncedMetrics,
  normalizeInstagramMediaMetrics,
  simulateInstagramMetrics,
  type SyncedSubmissionMetrics,
} from "./instagram.metrics"

async function loadCreatorInstagramToken(creatorId: string) {
  const account = await prisma.oAuthAccount.findFirst({
    where: { userId: creatorId, provider: "instagram" },
    select: { accessToken: true },
  })
  return decryptSecret(account?.accessToken ?? null)
}

async function fetchInstagramMetricsForMedia(input: {
  mediaId: string
  accessToken: string
}): Promise<SyncedSubmissionMetrics | null> {
  const url = new URL(`https://graph.instagram.com/${input.mediaId}`)
  url.searchParams.set("fields", "like_count,comments_count,view_count,play_count")
  url.searchParams.set("access_token", input.accessToken)

  const response = await fetch(url)
  if (!response.ok) return null

  const raw = (await response.json()) as {
    like_count?: number
    comments_count?: number
    view_count?: number
    play_count?: number
  }

  return buildSyncedMetrics(normalizeInstagramMediaMetrics(raw), "instagram")
}

export async function resolveSubmissionMetrics(submission: {
  id: string
  creatorId: string
  platformMediaId: string | null
}): Promise<SyncedSubmissionMetrics> {
  if (isInstagramConfigured() && submission.platformMediaId) {
    const accessToken = await loadCreatorInstagramToken(submission.creatorId)
    if (accessToken) {
      const fetched = await fetchInstagramMetricsForMedia({
        mediaId: submission.platformMediaId,
        accessToken,
      })
      if (fetched) return fetched
    }
  }

  return buildSyncedMetrics(simulateInstagramMetrics(submission.id), "simulated")
}

async function loadSubmissionWithCampaign(campaignId: string, submissionId: string) {
  const submission = await prisma.campaignSubmission.findFirst({
    where: { id: submissionId, campaignId },
    include: {
      campaign: { select: { id: true, brandId: true } },
    },
  })
  if (!submission) throw notFound("Submission not found.")
  return submission
}

export async function syncSubmissionMetrics(
  requesterId: string,
  requesterRole: "creator" | "brand",
  campaignId: string,
  submissionId: string
) {
  const user = await prisma.user.findUnique({ where: { id: requesterId } })
  if (!user || user.status !== "active") throw unauthorized()

  const submission = await loadSubmissionWithCampaign(campaignId, submissionId)

  if (requesterRole === "creator") {
    if (submission.creatorId !== requesterId) throw forbidden()
  } else {
    if (submission.campaign.brandId !== requesterId) throw notFound("Campaign not found.")
  }

  if (submission.status === "submitted") {
    throw badRequest("Submission must be validated before syncing metrics.", "submission_not_validated")
  }

  const metrics = await resolveSubmissionMetrics(submission)

  const updated = await prisma.campaignSubmission.update({
    where: { id: submission.id },
    data: {
      views: metrics.views,
      likes: metrics.likes,
      comments: metrics.comments,
      engagementScore: metrics.engagementScore,
    },
    select: {
      id: true,
      views: true,
      likes: true,
      comments: true,
      engagementScore: true,
      updatedAt: true,
    },
  })

  return {
    submission: {
      ...updated,
      updatedAt: updated.updatedAt.toISOString(),
    },
    source: metrics.source,
  }
}
