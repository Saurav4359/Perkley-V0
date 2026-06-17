import type { CampaignStatus, CampaignType } from "@prisma/client"

import { calculateEngagementScore } from "../submissions/submission.utils"

export type LeaderboardCandidate = {
  submissionId: string
  creatorId: string
  creatorName: string
  creatorInitials: string
  followers: number
  views: number
  likes: number
  comments: number
  engagementScore: number
  submittedAt: Date
  status: string
}

export type RankedLeaderboardEntry = LeaderboardCandidate & {
  rank: number
  score: number
  prizeAmount: number | null
}

export type PrizeTier = {
  rank: number
  label: string
  amount: number
}

export type BountyPrizeStructure = {
  prizeFirst: number | null
  prizeSecond: number | null
  prizeThird: number | null
  prizeTop20Each: number | null
}

const TOP_BONUS_WINNER_COUNT = 20

export function creatorInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "CR"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function buildPrizeTiers(prizes: BountyPrizeStructure): PrizeTier[] {
  const tiers: PrizeTier[] = []

  if (prizes.prizeFirst) tiers.push({ rank: 1, label: "1st place", amount: prizes.prizeFirst })
  if (prizes.prizeSecond) tiers.push({ rank: 2, label: "2nd place", amount: prizes.prizeSecond })
  if (prizes.prizeThird) tiers.push({ rank: 3, label: "3rd place", amount: prizes.prizeThird })

  if (prizes.prizeTop20Each) {
    for (let rank = 4; rank <= 3 + TOP_BONUS_WINNER_COUNT; rank += 1) {
      tiers.push({
        rank,
        label: "Top 20 each",
        amount: prizes.prizeTop20Each,
      })
    }
  }

  return tiers
}

export function getPrizeAmountForRank(rank: number, prizes: BountyPrizeStructure) {
  if (rank === 1) return prizes.prizeFirst
  if (rank === 2) return prizes.prizeSecond
  if (rank === 3) return prizes.prizeThird
  if (rank >= 4 && rank <= 3 + TOP_BONUS_WINNER_COUNT) return prizes.prizeTop20Each
  return null
}

export function getWinnerRankCount(prizes: BountyPrizeStructure) {
  let count = 0
  if (prizes.prizeFirst) count += 1
  if (prizes.prizeSecond) count += 1
  if (prizes.prizeThird) count += 1
  if (prizes.prizeTop20Each) count += TOP_BONUS_WINNER_COUNT
  return count
}

export function rankLeaderboardCandidates(candidates: LeaderboardCandidate[], prizes: BountyPrizeStructure) {
  const sorted = [...candidates].sort((a, b) => {
    if (b.engagementScore !== a.engagementScore) {
      return b.engagementScore - a.engagementScore
    }
    if (b.views !== a.views) return b.views - a.views
    return a.submittedAt.getTime() - b.submittedAt.getTime()
  })

  return sorted.map((entry, index) => {
    const rank = index + 1
    return {
      ...entry,
      rank,
      score: entry.engagementScore,
      prizeAmount: getPrizeAmountForRank(rank, prizes),
    }
  })
}

export function isLeaderboardLive(input: {
  campaignStatus: CampaignStatus
  deadline: Date
  now?: Date
}) {
  const now = input.now ?? new Date()
  return input.campaignStatus === "active" && input.deadline.getTime() > now.getTime()
}

export function canGenerateLeaderboard(campaignType: CampaignType) {
  return campaignType === "bounty"
}

export function canSelectWinners(input: {
  campaignType: CampaignType
  campaignStatus: CampaignStatus
  deadline: Date
  hasExistingWinners: boolean
  now?: Date
}) {
  const now = input.now ?? new Date()
  const reasons: string[] = []

  if (input.campaignType !== "bounty") reasons.push("not_bounty_campaign")
  if (!["active", "archived"].includes(input.campaignStatus)) {
    reasons.push("invalid_campaign_state")
  }
  if (input.deadline.getTime() > now.getTime()) reasons.push("deadline_not_passed")
  if (input.hasExistingWinners) reasons.push("winners_already_selected")

  return { ok: reasons.length === 0, reasons }
}

export function pickWinnerSubmissionIds(
  rankedEntries: RankedLeaderboardEntry[],
  prizes: BountyPrizeStructure
) {
  const winnerCount = getWinnerRankCount(prizes)
  return rankedEntries
    .filter((entry) => entry.status === "competing")
    .slice(0, winnerCount)
    .map((entry) => entry.submissionId)
}

export function scoreFromMetrics(metrics: { views: number; likes: number; comments: number }) {
  return calculateEngagementScore(metrics)
}
