import { describe, expect, test } from "bun:test"

import {
  buildSyncedMetrics,
  normalizeInstagramMediaMetrics,
  simulateInstagramMetrics,
} from "./instagram.metrics"

describe("instagram metrics", () => {
  test("normalizes raw graph media fields", () => {
    expect(
      normalizeInstagramMediaMetrics({
        view_count: 1500,
        like_count: 120,
        comments_count: 18,
      })
    ).toEqual({ views: 1500, likes: 120, comments: 18 })
  })

  test("falls back to play_count and clamps negatives", () => {
    expect(
      normalizeInstagramMediaMetrics({
        play_count: 900,
        like_count: -5,
      })
    ).toEqual({ views: 900, likes: 0, comments: 0 })
  })

  test("simulated metrics are deterministic for a seed", () => {
    const first = simulateInstagramMetrics("submission-1")
    const second = simulateInstagramMetrics("submission-1")
    expect(first).toEqual(second)
    expect(first.views).toBeGreaterThan(0)
    expect(first.likes).toBeLessThanOrEqual(first.views)
  })

  test("builds synced metrics with engagement score and source", () => {
    expect(
      buildSyncedMetrics({ views: 1000, likes: 100, comments: 10 }, "simulated")
    ).toEqual({
      views: 1000,
      likes: 100,
      comments: 10,
      engagementScore: 1000 + 100 * 2 + 10 * 3,
      source: "simulated",
    })
  })
})
