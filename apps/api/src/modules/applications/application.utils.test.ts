import { describe, expect, test } from "bun:test"

import {
  canAcceptApplication,
  canApplyToCampaign,
  canRejectApplication,
  canWithdrawApplication,
  initialApplicationStatus,
} from "./application.utils"

const activeDeadline = new Date("2026-12-31T00:00:00.000Z")
const pastDeadline = new Date("2020-01-01T00:00:00.000Z")
const now = new Date("2026-06-17T00:00:00.000Z")

describe("application utilities", () => {
  test("assigns initial status by campaign type", () => {
    expect(initialApplicationStatus("bounty")).toBe("accepted")
    expect(initialApplicationStatus("campaign")).toBe("pending")
  })

  test("allows apply when campaign is active and creator is eligible", () => {
    expect(
      canApplyToCampaign({
        campaignStatus: "active",
        campaignDeadline: activeDeadline,
        campaignType: "campaign",
        minFollowers: 1000,
        maxCreators: 10,
        acceptedCount: 3,
        creatorFollowers: 5000,
        now,
      }).ok
    ).toBe(true)
  })

  test("rejects apply when campaign is not active", () => {
    const result = canApplyToCampaign({
      campaignStatus: "draft",
      campaignDeadline: activeDeadline,
      campaignType: "campaign",
      minFollowers: 0,
      maxCreators: 10,
      acceptedCount: 0,
      creatorFollowers: 100,
      now,
    })

    expect(result.ok).toBe(false)
    expect(result.reasons).toContain("campaign_not_active")
  })

  test("rejects apply when deadline passed", () => {
    const result = canApplyToCampaign({
      campaignStatus: "active",
      campaignDeadline: pastDeadline,
      campaignType: "campaign",
      minFollowers: 0,
      maxCreators: 10,
      acceptedCount: 0,
      creatorFollowers: 100,
      now,
    })

    expect(result.ok).toBe(false)
    expect(result.reasons).toContain("campaign_deadline_passed")
  })

  test("rejects apply when followers are below minimum", () => {
    const result = canApplyToCampaign({
      campaignStatus: "active",
      campaignDeadline: activeDeadline,
      campaignType: "campaign",
      minFollowers: 5000,
      maxCreators: 10,
      acceptedCount: 0,
      creatorFollowers: 1200,
      now,
    })

    expect(result.ok).toBe(false)
    expect(result.reasons).toContain("insufficient_followers")
  })

  test("rejects apply when campaign slots are full", () => {
    const result = canApplyToCampaign({
      campaignStatus: "active",
      campaignDeadline: activeDeadline,
      campaignType: "campaign",
      minFollowers: 0,
      maxCreators: 5,
      acceptedCount: 5,
      creatorFollowers: 1000,
      now,
    })

    expect(result.ok).toBe(false)
    expect(result.reasons).toContain("campaign_full")
  })

  test("allows re-apply after withdrawn or rejected", () => {
    expect(
      canApplyToCampaign({
        campaignStatus: "active",
        campaignDeadline: activeDeadline,
        campaignType: "campaign",
        minFollowers: 0,
        maxCreators: 10,
        acceptedCount: 0,
        creatorFollowers: 100,
        existingStatus: "withdrawn",
        now,
      }).ok
    ).toBe(true)

    expect(
      canApplyToCampaign({
        campaignStatus: "active",
        campaignDeadline: activeDeadline,
        campaignType: "campaign",
        minFollowers: 0,
        maxCreators: 10,
        acceptedCount: 0,
        creatorFollowers: 100,
        existingStatus: "rejected",
        now,
      }).ok
    ).toBe(true)
  })

  test("blocks duplicate active applications", () => {
    const result = canApplyToCampaign({
      campaignStatus: "active",
      campaignDeadline: activeDeadline,
      campaignType: "campaign",
      minFollowers: 0,
      maxCreators: 10,
      acceptedCount: 0,
      creatorFollowers: 100,
      existingStatus: "pending",
      now,
    })

    expect(result.ok).toBe(false)
    expect(result.reasons).toContain("already_applied")
  })

  test("does not enforce max creators for bounty campaigns", () => {
    expect(
      canApplyToCampaign({
        campaignStatus: "active",
        campaignDeadline: activeDeadline,
        campaignType: "bounty",
        minFollowers: 0,
        maxCreators: null,
        acceptedCount: 999,
        creatorFollowers: 100,
        now,
      }).ok
    ).toBe(true)
  })

  test("controls withdraw and review transitions", () => {
    expect(canWithdrawApplication("pending")).toBe(true)
    expect(canWithdrawApplication("accepted")).toBe(true)
    expect(canWithdrawApplication("rejected")).toBe(false)

    expect(canRejectApplication("pending")).toBe(true)
    expect(canRejectApplication("accepted")).toBe(false)
  })

  test("accepts pending campaign applications when slots remain", () => {
    expect(
      canAcceptApplication({
        campaignType: "campaign",
        status: "pending",
        acceptedCount: 4,
        maxCreators: 10,
      }).ok
    ).toBe(true)
  })

  test("blocks accept when campaign is full or bounty type", () => {
    expect(
      canAcceptApplication({
        campaignType: "campaign",
        status: "pending",
        acceptedCount: 10,
        maxCreators: 10,
      }).ok
    ).toBe(false)

    expect(
      canAcceptApplication({
        campaignType: "bounty",
        status: "pending",
        acceptedCount: 0,
        maxCreators: null,
      }).ok
    ).toBe(false)
  })
})
