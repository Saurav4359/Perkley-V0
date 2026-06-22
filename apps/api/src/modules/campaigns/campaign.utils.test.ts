import { describe, expect, test } from "bun:test"

import { validateCampaignBudgetSolvency, validateCampaignForPublish } from "./campaign.utils"

describe("validateCampaignBudgetSolvency", () => {
  test("rejects campaign liability above budget", () => {
    const result = validateCampaignBudgetSolvency({
      type: "campaign",
      totalBudget: 1000,
      maxCreators: 10,
      fixedReward: 150,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("campaign_liability_exceeds_budget")
    }
  })

  test("rejects bounty prize pool above budget", () => {
    const result = validateCampaignBudgetSolvency({
      type: "bounty",
      totalBudget: 5000,
      prizeFirst: 3000,
      prizeSecond: 1500,
      prizeThird: 1000,
      prizeTop20Each: 100,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("bounty_prizes_exceed_budget")
    }
  })

  test("accepts solvable campaign budgets", () => {
    expect(
      validateCampaignBudgetSolvency({
        type: "campaign",
        totalBudget: 10000,
        maxCreators: 10,
        fixedReward: 500,
      }).ok
    ).toBe(true)
  })
})

describe("validateCampaignForPublish", () => {
  test("includes solvency failures in publish validation", () => {
    const result = validateCampaignForPublish({
      type: "campaign",
      title: "Launch",
      description: "Desc",
      niche: "Tech",
      platform: "instagram",
      contentType: "reel",
      minFollowers: 1000,
      requiredHashtag: "#brand",
      requiredMention: "@brand",
      deadline: new Date("2030-01-01"),
      totalBudget: 1000,
      maxCreators: 10,
      minViewsThreshold: 1000,
      fixedReward: 500,
    })

    expect(result.ok).toBe(false)
    expect(result.solvencyReason).toBe("campaign_liability_exceeds_budget")
  })
})
