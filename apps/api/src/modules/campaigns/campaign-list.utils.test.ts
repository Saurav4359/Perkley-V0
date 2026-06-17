import { describe, expect, test } from "bun:test"

import {
  buildCampaignSearchHaystack,
  campaignMatchesRewardRange,
  getCampaignRewardValue,
  matchesSearchQuery,
  sortCampaigns,
} from "./campaign-list.utils"

describe("campaign list utilities", () => {
  test("calculates reward value by campaign type", () => {
    expect(
      getCampaignRewardValue({
        type: "campaign",
        platform: "instagram",
        fixedReward: 5000,
        totalBudget: 100000,
        prizeFirst: null,
        publishedAt: null,
        createdAt: new Date(),
        deadline: new Date(),
      })
    ).toBe(5000)

    expect(
      getCampaignRewardValue({
        type: "bounty",
        platform: "instagram",
        fixedReward: null,
        totalBudget: 100000,
        prizeFirst: 25000,
        publishedAt: null,
        createdAt: new Date(),
        deadline: new Date(),
      })
    ).toBe(25000)
  })

  test("filters campaigns by reward range", () => {
    const campaign = {
      type: "campaign" as const,
      platform: "instagram" as const,
      fixedReward: 5000,
      totalBudget: 100000,
      prizeFirst: null,
      publishedAt: null,
      createdAt: new Date(),
      deadline: new Date(),
    }

    expect(campaignMatchesRewardRange(campaign, 4000, 6000)).toBe(true)
    expect(campaignMatchesRewardRange(campaign, 6000)).toBe(false)
  })

  test("matches all search tokens against haystack", () => {
    const haystack = buildCampaignSearchHaystack({
      id: "abc",
      title: "Vitamin C launch reel",
      description: "Skincare bounty",
      niche: "lifestyle",
      type: "bounty",
      platform: "instagram",
      brandName: "Northline",
    })

    expect(matchesSearchQuery(haystack, "vitamin northline")).toBe(true)
    expect(matchesSearchQuery(haystack, "vault pay")).toBe(false)
  })

  test("sorts campaigns by reward descending", () => {
    const campaigns = sortCampaigns(
      [
        {
          type: "campaign",
          platform: "instagram",
          fixedReward: 5000,
          totalBudget: 100000,
          prizeFirst: null,
          publishedAt: null,
          createdAt: new Date("2026-06-01"),
          deadline: new Date("2026-07-01"),
        },
        {
          type: "bounty",
          platform: "instagram",
          fixedReward: null,
          totalBudget: 100000,
          prizeFirst: 25000,
          publishedAt: null,
          createdAt: new Date("2026-06-02"),
          deadline: new Date("2026-07-02"),
        },
      ],
      "reward_desc"
    )

    expect(getCampaignRewardValue(campaigns[0]!)).toBe(25000)
  })
})
