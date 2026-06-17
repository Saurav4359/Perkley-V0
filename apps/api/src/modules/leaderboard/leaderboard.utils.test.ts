import { describe, expect, test } from "bun:test"

import {
  buildPrizeTiers,
  canSelectWinners,
  creatorInitials,
  getPrizeAmountForRank,
  getWinnerRankCount,
  isLeaderboardLive,
  pickWinnerSubmissionIds,
  rankLeaderboardCandidates,
  scoreFromMetrics,
} from "./leaderboard.utils"

const prizes = {
  prizeFirst: 25000,
  prizeSecond: 15000,
  prizeThird: 10000,
  prizeTop20Each: 2500,
}

const activeDeadline = new Date("2026-12-31T00:00:00.000Z")
const pastDeadline = new Date("2020-01-01T00:00:00.000Z")
const now = new Date("2026-06-17T00:00:00.000Z")

function candidate(
  id: string,
  score: number,
  views: number,
  submittedAt: string,
  status = "competing"
) {
  return {
    submissionId: id,
    creatorId: `creator-${id}`,
    creatorName: `Creator ${id}`,
    creatorInitials: "C1",
    followers: 1000,
    views,
    likes: 10,
    comments: 2,
    engagementScore: score,
    submittedAt: new Date(submittedAt),
    status,
  }
}

describe("leaderboard utilities", () => {
  test("builds creator initials", () => {
    expect(creatorInitials("Alex Rivera")).toBe("AR")
    expect(creatorInitials("Perkley")).toBe("PE")
  })

  test("builds bounty prize tiers", () => {
    const tiers = buildPrizeTiers(prizes)
    expect(tiers[0]).toEqual({ rank: 1, label: "1st place", amount: 25000 })
    expect(tiers[3]).toEqual({ rank: 4, label: "Top 20 each", amount: 2500 })
    expect(tiers).toHaveLength(23)
  })

  test("maps prize amounts by rank", () => {
    expect(getPrizeAmountForRank(1, prizes)).toBe(25000)
    expect(getPrizeAmountForRank(4, prizes)).toBe(2500)
    expect(getPrizeAmountForRank(30, prizes)).toBeNull()
    expect(getWinnerRankCount(prizes)).toBe(23)
  })

  test("ranks by score, views, then earliest submission", () => {
    const ranked = rankLeaderboardCandidates(
      [
        candidate("a", 100, 500, "2026-06-10T10:00:00.000Z"),
        candidate("b", 120, 400, "2026-06-09T10:00:00.000Z"),
        candidate("c", 120, 500, "2026-06-08T10:00:00.000Z"),
      ],
      prizes
    )

    expect(ranked.map((entry) => entry.submissionId)).toEqual(["c", "b", "a"])
    expect(ranked[0]?.rank).toBe(1)
    expect(ranked[0]?.prizeAmount).toBe(25000)
  })

  test("detects live leaderboard state", () => {
    expect(
      isLeaderboardLive({
        campaignStatus: "active",
        deadline: activeDeadline,
        now,
      })
    ).toBe(true)

    expect(
      isLeaderboardLive({
        campaignStatus: "active",
        deadline: pastDeadline,
        now,
      })
    ).toBe(false)
  })

  test("validates winner selection rules", () => {
    expect(
      canSelectWinners({
        campaignType: "bounty",
        campaignStatus: "active",
        deadline: pastDeadline,
        hasExistingWinners: false,
        now,
      }).ok
    ).toBe(true)

    const blocked = canSelectWinners({
      campaignType: "campaign",
      campaignStatus: "active",
      deadline: pastDeadline,
      hasExistingWinners: false,
      now,
    })
    expect(blocked.ok).toBe(false)
    expect(blocked.reasons).toContain("not_bounty_campaign")
  })

  test("picks competing winner submission ids by rank", () => {
    const ranked = rankLeaderboardCandidates(
      [
        candidate("a", 100, 100, "2026-06-10T10:00:00.000Z", "won"),
        candidate("b", 120, 100, "2026-06-09T10:00:00.000Z"),
        candidate("c", 110, 100, "2026-06-08T10:00:00.000Z"),
      ],
      prizes
    )

    expect(pickWinnerSubmissionIds(ranked, prizes)).toEqual(["b", "c"])
  })

  test("calculates engagement score from metrics", () => {
    expect(scoreFromMetrics({ views: 1000, likes: 50, comments: 10 })).toBe(1130)
  })
})
