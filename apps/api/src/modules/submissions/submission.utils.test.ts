import { describe, expect, test } from "bun:test"

import {
  calculateEngagementScore,
  canApproveSubmission,
  canEditSubmission,
  canSubmitSubmission,
  detectInstagramContentType,
  normalizeInstagramPostUrl,
  statusAfterValidation,
  validateInstagramPostUrl,
} from "./submission.utils"

const activeDeadline = new Date("2026-12-31T00:00:00.000Z")
const pastDeadline = new Date("2020-01-01T00:00:00.000Z")
const now = new Date("2026-06-17T00:00:00.000Z")

describe("submission utilities", () => {
  test("normalizes instagram urls", () => {
    expect(normalizeInstagramPostUrl("instagram.com/reel/abc123/")).toBe(
      "https://instagram.com/reel/abc123"
    )
    expect(normalizeInstagramPostUrl("https://www.instagram.com/p/abc123/?utm=1")).toBe(
      "https://www.instagram.com/p/abc123"
    )
    expect(normalizeInstagramPostUrl("https://example.com/p/abc")).toBeNull()
  })

  test("detects instagram content types from paths", () => {
    expect(detectInstagramContentType("/reel/abc123/")).toBe("reel")
    expect(detectInstagramContentType("/p/abc123/")).toBe("post")
    expect(detectInstagramContentType("/stories/user/123/")).toBe("story")
  })

  test("validates instagram urls and content type expectations", () => {
    const valid = validateInstagramPostUrl("https://instagram.com/reel/abc123", "reel")
    expect(valid.ok).toBe(true)
    expect(valid.normalizedUrl).toBe("https://instagram.com/reel/abc123")

    const mismatch = validateInstagramPostUrl("https://instagram.com/p/abc123", "reel")
    expect(mismatch.ok).toBe(false)
    expect(mismatch.errors[0]).toContain("reel")
  })

  test("assigns status after validation by campaign type", () => {
    expect(statusAfterValidation("bounty")).toBe("competing")
    expect(statusAfterValidation("campaign")).toBe("under_review")
  })

  test("checks submission eligibility", () => {
    expect(
      canSubmitSubmission({
        campaignStatus: "active",
        campaignDeadline: activeDeadline,
        applicationStatus: "accepted",
        hasExistingSubmission: false,
        now,
      }).ok
    ).toBe(true)

    const blocked = canSubmitSubmission({
      campaignStatus: "active",
      campaignDeadline: activeDeadline,
      applicationStatus: "pending",
      hasExistingSubmission: false,
      now,
    })
    expect(blocked.ok).toBe(false)
    expect(blocked.reasons).toContain("application_not_accepted")
  })

  test("blocks submission after deadline", () => {
    const result = canSubmitSubmission({
      campaignStatus: "active",
      campaignDeadline: pastDeadline,
      applicationStatus: "accepted",
      hasExistingSubmission: false,
      now,
    })
    expect(result.ok).toBe(false)
    expect(result.reasons).toContain("campaign_deadline_passed")
  })

  test("controls edit and approval transitions", () => {
    expect(canEditSubmission("under_review")).toBe(true)
    expect(canEditSubmission("qualified")).toBe(false)

    expect(
      canApproveSubmission({ campaignType: "campaign", status: "under_review" }).ok
    ).toBe(true)
    expect(
      canApproveSubmission({ campaignType: "bounty", status: "under_review" }).ok
    ).toBe(false)
  })

  test("calculates engagement score", () => {
    expect(calculateEngagementScore({ views: 1000, likes: 50, comments: 10 })).toBe(1130)
  })
})
