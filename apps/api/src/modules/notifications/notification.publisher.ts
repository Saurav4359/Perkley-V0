import type { NotificationType, Prisma } from "@prisma/client"

import { prisma } from "../../lib/prisma"
import {
  buildApplicationAcceptedNotification,
  buildNewCampaignNotification,
  buildPaymentReleasedNotification,
  buildSubmissionReviewedNotification,
  buildWinnerAnnouncedNotification,
} from "./notification.utils"

type CreateNotificationInput = {
  userId: string
  type: NotificationType
  title: string
  body: string
  href?: string | null
  metadata?: Prisma.InputJsonValue
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      metadata: input.metadata ?? {},
    },
  })
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) return { count: 0 }

  const result = await prisma.notification.createMany({
    data: inputs.map((input) => ({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      metadata: input.metadata ?? {},
    })),
  })

  return result
}

export async function notifyNewCampaignPublished(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      brand: {
        select: {
          brandProfile: { select: { brandName: true } },
        },
      },
    },
  })

  if (!campaign || campaign.status !== "active") return

  const brandName = campaign.brand.brandProfile?.brandName ?? "A brand"
  const payload = buildNewCampaignNotification({
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    brandName,
    campaignType: campaign.type,
  })

  const creators = await prisma.creatorProfile.findMany({
    where: {
      niches: { has: campaign.niche },
    },
    select: { userId: true },
  })

  await createNotifications(
    creators.map((creator) => ({
      userId: creator.userId,
      ...payload,
    }))
  )
}

export async function notifyApplicationAccepted(input: {
  creatorId: string
  campaignId: string
  campaignTitle: string
  brandName: string
}) {
  await createNotification({
    userId: input.creatorId,
    ...buildApplicationAcceptedNotification(input),
  })
}

export async function notifyApplicationAcceptedForCampaign(campaignId: string, creatorId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      brand: {
        select: {
          brandProfile: { select: { brandName: true } },
        },
      },
    },
  })
  if (!campaign) return

  await notifyApplicationAccepted({
    creatorId,
    campaignId,
    campaignTitle: campaign.title,
    brandName: campaign.brand.brandProfile?.brandName ?? "A brand",
  })
}

export async function notifySubmissionReviewed(input: {
  creatorId: string
  campaignId: string
  campaignTitle: string
  approved: boolean
}) {
  await createNotification({
    userId: input.creatorId,
    ...buildSubmissionReviewedNotification(input),
  })
}

export async function notifyWinnerAnnounced(input: {
  creatorId: string
  campaignId: string
  campaignTitle: string
  prizeAmount: number | null
}) {
  await createNotification({
    userId: input.creatorId,
    ...buildWinnerAnnouncedNotification(input),
  })
}

export async function notifyPaymentReleased(input: {
  creatorId: string
  campaignId: string
  campaignTitle: string
  amountInr: number
}) {
  await createNotification({
    userId: input.creatorId,
    ...buildPaymentReleasedNotification(input),
  })
}

export function runNotificationSideEffect(task: Promise<unknown>) {
  void task.catch(() => undefined)
}
