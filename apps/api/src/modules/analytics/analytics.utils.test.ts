import { describe, expect, test } from "bun:test"

import {
  averageEngagementScore,
  buildEngagementSummary,
  calculateWinRate,
  countByStatus,
  engagementRate,
  sumEngagement,
  topPerformers,
} from "./analytics.utils"

describe("analytics utilities", () => {
  test("sums engagement metrics", () => {
    expect(
      sumEngagement([
        { views: 100, likes: 10, comments: 2 },
        { views: 50, likes: 5, comments: 1 },
      ])
    ).toEqual({ views: 150, likes: 15, comments: 3 })
  })

  test("calculates engagement rate as percentage of views", () => {
    expect(engagementRate({ views: 1000, likes: 80, comments: 20 })).toBe(10)
    expect(engagementRate({ views: 0, likes: 5, comments: 5 })).toBe(0)
  })

  test("averages engagement score rounding to nearest integer", () => {
    expect(averageEngagementScore([100, 200, 301])).toBe(200)
    expect(averageEngagementScore([])).toBe(0)
  })

  test("calculates win rate", () => {
    expect(calculateWinRate({ submissions: 4, wins: 1 })).toBe(25)
    expect(calculateWinRate({ submissions: 0, wins: 0 })).toBe(0)
  })

  test("counts submissions by status", () => {
    expect(
      countByStatus([
        { status: "won" },
        { status: "won" },
        { status: "qualified" },
      ])
    ).toEqual({ won: 2, qualified: 1 })
  })

  test("returns top performers by engagement score", () => {
    const result = topPerformers(
      [
        { id: "a", engagementScore: 10 },
        { id: "b", engagementScore: 30 },
        { id: "c", engagementScore: 20 },
      ],
      2
    )
    expect(result.map((item) => item.id)).toEqual(["b", "c"])
  })

  test("builds engagement summary", () => {
    expect(
      buildEngagementSummary([
        { views: 1000, likes: 80, comments: 20, status: "won", engagementScore: 1240 },
        { views: 1000, likes: 20, comments: 0, status: "qualified", engagementScore: 1040 },
      ])
    ).toEqual({
      submissions: 2,
      totalViews: 2000,
      totalLikes: 100,
      totalComments: 20,
      engagementRate: 6,
      averageEngagementScore: 1140,
    })
  })
})
