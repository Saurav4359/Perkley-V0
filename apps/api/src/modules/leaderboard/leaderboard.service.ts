import type { CampaignStatus } from "@prisma/client"

import { badRequest, notFound } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import {
  buildPrizeTiers,
  canGenerateLeaderboard,
  canSelectWinners,
  creatorInitials,
  isLeaderboardLive,
  pickWinnerSubmissionIds,
  rankLeaderboardCandidates,
  type LeaderboardCandidate,
} from "./leaderboard.utils"

const competingStatuses = ["competing", "won"] as const

async function loadBountyCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) throw notFound("Campaign not found.")
  if (!canGenerateLeaderboard(campaign.type)) {
    throw badRequest("Leaderboards are only available for bounty campaigns.", "not_bounty_campaign")
  }
  return campaign
}

async function loadBountyCampaignForBrand(brandId: string, campaignId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandId },
  })
  if (!campaign) throw notFound("Campaign not found.")
  if (!canGenerateLeaderboard(campaign.type)) {
    throw badRequest("Leaderboards are only available for bounty campaigns.", "not_bounty_campaign")
  }
  return campaign
}

function toLeaderboardCandidate(submission: {
  id: string
  creatorId: string
  views: number
  likes: number
  comments: number
  engagementScore: number
  createdAt: Date
  status: string
  creator: {
    creatorProfile: {
      displayName: string
      followersCount: number | null
    } | null
  }
}): LeaderboardCandidate {
  const displayName = submission.creator.creatorProfile?.displayName ?? "Creator"

  return {
    submissionId: submission.id,
    creatorId: submission.creatorId,
    creatorName: displayName,
    creatorInitials: creatorInitials(displayName),
    followers: submission.creator.creatorProfile?.followersCount ?? 0,
    views: submission.views,
    likes: submission.likes,
    comments: submission.comments,
    engagementScore: submission.engagementScore,
    submittedAt: submission.createdAt,
    status: submission.status,
  }
}

function serializeLeaderboard(campaign: {
  status: string
  deadline: Date
  prizeFirst: number | null
  prizeSecond: number | null
  prizeThird: number | null
  prizeTop20Each: number | null
}, entries: ReturnType<typeof rankLeaderboardCandidates>) {
  const prizes = {
    prizeFirst: campaign.prizeFirst,
    prizeSecond: campaign.prizeSecond,
    prizeThird: campaign.prizeThird,
    prizeTop20Each: campaign.prizeTop20Each,
  }

  return {
    isLive: isLeaderboardLive({
      campaignStatus: campaign.status as CampaignStatus,
      deadline: campaign.deadline,
    }),
    generatedAt: new Date().toISOString(),
    prizeTiers: buildPrizeTiers(prizes),
    entries: entries.map((entry) => ({
      rank: entry.rank,
      submissionId: entry.submissionId,
      creatorId: entry.creatorId,
      creatorName: entry.creatorName,
      creatorInitials: entry.creatorInitials,
      followers: entry.followers,
      views: entry.views,
      likes: entry.likes,
      comments: entry.comments,
      score: entry.score,
      prizeAmount: entry.prizeAmount,
      status: entry.status,
    })),
  }
}

async function fetchLeaderboardCandidates(campaignId: string) {
  const submissions = await prisma.campaignSubmission.findMany({
    where: {
      campaignId,
      status: { in: [...competingStatuses] },
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

  return submissions.map(toLeaderboardCandidate)
}

export async function getCampaignLeaderboard(campaignId: string) {
  const campaign = await loadBountyCampaign(campaignId)

  if (!["active", "archived", "completed"].includes(campaign.status)) {
    throw notFound("Campaign not found.")
  }

  const prizes = {
    prizeFirst: campaign.prizeFirst,
    prizeSecond: campaign.prizeSecond,
    prizeThird: campaign.prizeThird,
    prizeTop20Each: campaign.prizeTop20Each,
  }

  const ranked = rankLeaderboardCandidates(await fetchLeaderboardCandidates(campaignId), prizes)
  return serializeLeaderboard(campaign, ranked)
}

export async function selectCampaignWinners(brandId: string, campaignId: string) {
  const campaign = await loadBountyCampaignForBrand(brandId, campaignId)

  const existingWinners = await prisma.campaignSubmission.count({
    where: { campaignId, status: "won" },
  })

  const decision = canSelectWinners({
    campaignType: campaign.type,
    campaignStatus: campaign.status,
    deadline: campaign.deadline,
    hasExistingWinners: existingWinners > 0,
  })

  if (!decision.ok) {
    throw badRequest(`Cannot select winners: ${decision.reasons.join(", ")}.`, decision.reasons[0])
  }

  const prizes = {
    prizeFirst: campaign.prizeFirst,
    prizeSecond: campaign.prizeSecond,
    prizeThird: campaign.prizeThird,
    prizeTop20Each: campaign.prizeTop20Each,
  }

  const ranked = rankLeaderboardCandidates(await fetchLeaderboardCandidates(campaignId), prizes)
  const winnerIds = pickWinnerSubmissionIds(ranked, prizes)

  if (winnerIds.length === 0) {
    throw badRequest("No competing submissions are available for winner selection.", "no_competing_submissions")
  }

  await prisma.$transaction([
    prisma.campaignSubmission.updateMany({
      where: {
        id: { in: winnerIds },
        campaignId,
        status: "competing",
      },
      data: { status: "won" },
    }),
    prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "completed" },
    }),
  ])

  const winners = ranked
    .filter((entry) => winnerIds.includes(entry.submissionId))
    .map((entry) => ({
      rank: entry.rank,
      submissionId: entry.submissionId,
      creatorId: entry.creatorId,
      creatorName: entry.creatorName,
      creatorInitials: entry.creatorInitials,
      score: entry.score,
      prizeAmount: entry.prizeAmount,
      status: "won" as const,
    }))

  return {
    campaignId,
    campaignStatus: "completed" as const,
    winners,
    leaderboard: serializeLeaderboard(
      { ...campaign, status: "completed" },
      ranked.map((entry) => ({
        ...entry,
        status: winnerIds.includes(entry.submissionId) ? "won" : entry.status,
      }))
    ),
  }
}
