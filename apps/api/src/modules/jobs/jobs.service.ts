import { prisma } from "../../lib/prisma"
import { notifyDeadlineReminder } from "../notifications/notification.publisher"
import { resolveSubmissionMetrics } from "../instagram/instagram.service"
import { statusAfterValidation, validateInstagramPostUrl } from "../submissions/submission.utils"
import {
  DEFAULT_REMINDER_WINDOW_HOURS,
  reminderHoursRemaining,
  summarizeJobRun,
  type JobName,
} from "./jobs.utils"

export async function expireCampaigns(now: Date = new Date()) {
  const expired = await prisma.campaign.findMany({
    where: { status: "active", deadline: { lte: now } },
    select: { id: true },
  })

  if (expired.length > 0) {
    await prisma.campaign.updateMany({
      where: { id: { in: expired.map((campaign) => campaign.id) } },
      data: { status: "archived", archivedAt: now },
    })
  }

  return { job: "expire-campaigns" as const, processed: expired.length }
}

export async function verifyPendingSubmissions() {
  const submissions = await prisma.campaignSubmission.findMany({
    where: { status: "submitted" },
    include: {
      campaign: { select: { type: true, contentType: true } },
    },
    take: 100,
  })

  let processed = 0
  const now = new Date()

  for (const submission of submissions) {
    const validation = validateInstagramPostUrl(submission.postUrl, submission.campaign.contentType)
    if (!validation.ok || !validation.normalizedUrl) continue

    await prisma.campaignSubmission.update({
      where: { id: submission.id },
      data: {
        postUrl: validation.normalizedUrl,
        status: statusAfterValidation(submission.campaign.type),
        validationResult: {
          ok: true,
          normalizedUrl: validation.normalizedUrl,
          detectedContentType: validation.detectedContentType,
          errors: validation.errors,
          validatedAt: now.toISOString(),
          source: "job",
        },
        validatedAt: now,
      },
    })
    processed += 1
  }

  return { job: "verify-submissions" as const, processed }
}

export async function refreshActiveLeaderboardMetrics() {
  const submissions = await prisma.campaignSubmission.findMany({
    where: {
      status: "competing",
      campaign: { status: "active", type: "bounty" },
    },
    select: { id: true, creatorId: true, platformMediaId: true },
    take: 200,
  })

  let processed = 0
  for (const submission of submissions) {
    const metrics = await resolveSubmissionMetrics(submission)
    await prisma.campaignSubmission.update({
      where: { id: submission.id },
      data: {
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        engagementScore: metrics.engagementScore,
      },
    })
    processed += 1
  }

  return { job: "refresh-metrics" as const, processed }
}

export async function sendDeadlineReminders(
  now: Date = new Date(),
  windowHours: number = DEFAULT_REMINDER_WINDOW_HOURS
) {
  const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000)

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "active",
      deadline: { gt: now, lte: windowEnd },
    },
    select: { id: true, title: true, deadline: true },
  })

  let processed = 0

  for (const campaign of campaigns) {
    const applications = await prisma.campaignApplication.findMany({
      where: {
        campaignId: campaign.id,
        status: "accepted",
        submission: { is: null },
      },
      select: { creatorId: true },
    })

    const href = `/dashboard/campaigns/${campaign.id}`
    const reminderWindowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000)

    for (const application of applications) {
      const alreadyNotified = await prisma.notification.findFirst({
        where: {
          userId: application.creatorId,
          type: "deadline_reminder",
          href,
          createdAt: { gte: reminderWindowStart },
        },
        select: { id: true },
      })
      if (alreadyNotified) continue

      await notifyDeadlineReminder({
        creatorId: application.creatorId,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        hoursRemaining: reminderHoursRemaining(campaign.deadline, now),
      })
      processed += 1
    }
  }

  return { job: "deadline-reminders" as const, processed }
}

export async function runJob(name: JobName) {
  switch (name) {
    case "expire-campaigns":
      return expireCampaigns()
    case "verify-submissions":
      return verifyPendingSubmissions()
    case "refresh-metrics":
      return refreshActiveLeaderboardMetrics()
    case "deadline-reminders":
      return sendDeadlineReminders()
  }
}

export async function runAllJobs() {
  const results = [
    await expireCampaigns(),
    await verifyPendingSubmissions(),
    await refreshActiveLeaderboardMetrics(),
    await sendDeadlineReminders(),
  ]

  return summarizeJobRun(results)
}
