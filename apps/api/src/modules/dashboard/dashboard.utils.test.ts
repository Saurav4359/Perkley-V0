import { describe, expect, test } from "bun:test"

import {
  brandApplicationAction,
  creatorSubmissionAction,
  estimateCreatorEarnings,
  mergeActivity,
} from "./dashboard.utils"

describe("dashboard utilities", () => {
  test("maps creator submission actions", () => {
    expect(creatorSubmissionAction("competing", "bounty")).toBe("submitted to a bounty")
    expect(creatorSubmissionAction("qualified", "campaign")).toBe("qualified for campaign payout")
    expect(creatorSubmissionAction("won", "bounty")).toBe("won a bounty")
  })

  test("maps brand application actions", () => {
    expect(brandApplicationAction("Alex Rivera", "pending")).toBe("Alex Rivera applied")
    expect(brandApplicationAction("Alex Rivera", "accepted")).toBe("Alex Rivera was accepted")
  })

  test("estimates creator earnings from submission state", () => {
    expect(
      estimateCreatorEarnings({
        status: "qualified",
        campaignType: "campaign",
        fixedReward: 5000,
        prizeFirst: null,
      })
    ).toBe(5000)

    expect(
      estimateCreatorEarnings({
        status: "won",
        campaignType: "bounty",
        fixedReward: null,
        prizeFirst: 25000,
      })
    ).toBe(25000)
  })

  test("merges and limits activity items by recency", () => {
    const activity = mergeActivity(
      [
        {
          id: "1",
          kind: "submission",
          campaignId: "a",
          campaignTitle: "A",
          actorName: "You",
          action: "submitted",
          occurredAt: "2026-06-10T10:00:00.000Z",
        },
        {
          id: "2",
          kind: "application",
          campaignId: "b",
          campaignTitle: "B",
          actorName: "You",
          action: "applied",
          occurredAt: "2026-06-11T10:00:00.000Z",
        },
      ],
      1
    )

    expect(activity).toHaveLength(1)
    expect(activity[0]?.id).toBe("2")
  })
})
