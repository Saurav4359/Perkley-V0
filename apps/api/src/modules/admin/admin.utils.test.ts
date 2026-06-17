import { describe, expect, test } from "bun:test"

import {
  canModerateCampaign,
  canTransitionUserStatus,
  isWhitelistedAdminEmail,
  normalizePagination,
  summarizeCampaigns,
  summarizeRevenue,
  summarizeUsers,
} from "./admin.utils"

describe("admin utilities", () => {
  test("validates user status transitions", () => {
    expect(canTransitionUserStatus("active", "suspended").ok).toBe(true)
    expect(canTransitionUserStatus("active", "active").ok).toBe(false)
    expect(canTransitionUserStatus("deleted", "active").ok).toBe(false)
  })

  test("validates campaign moderation", () => {
    expect(canModerateCampaign("active").ok).toBe(true)
    expect(canModerateCampaign("cancelled").ok).toBe(false)
    expect(canModerateCampaign("completed").ok).toBe(false)
  })

  test("normalizes pagination with bounds", () => {
    expect(normalizePagination({ page: 2, pageSize: 10 })).toEqual({
      page: 2,
      pageSize: 10,
      skip: 10,
      take: 10,
    })
    expect(normalizePagination({ page: 0, pageSize: 500 })).toEqual({
      page: 1,
      pageSize: 100,
      skip: 0,
      take: 100,
    })
  })

  test("summarizes users by role and status", () => {
    expect(
      summarizeUsers([
        { role: "creator", status: "active" },
        { role: "brand", status: "suspended" },
        { role: "admin", status: "active" },
      ])
    ).toEqual({
      total: 3,
      creators: 1,
      brands: 1,
      admins: 1,
      active: 2,
      suspended: 1,
      deleted: 0,
    })
  })

  test("summarizes campaigns by status", () => {
    expect(
      summarizeCampaigns([{ status: "active" }, { status: "draft" }, { status: "active" }])
    ).toEqual({
      total: 3,
      draft: 1,
      active: 2,
      archived: 0,
      completed: 0,
      cancelled: 0,
    })
  })

  test("summarizes revenue from escrows", () => {
    expect(
      summarizeRevenue([
        { amountInr: 100_000, releasedAmountInr: 40_000 },
        { amountInr: 50_000, releasedAmountInr: 50_000 },
      ])
    ).toEqual({
      escrowedInr: 150_000,
      releasedInr: 90_000,
      inEscrowInr: 60_000,
    })
  })

  test("matches whitelisted admin emails case-insensitively", () => {
    expect(isWhitelistedAdminEmail("Admin@Perkley.com", ["admin@perkley.com"])).toBe(true)
    expect(isWhitelistedAdminEmail("other@perkley.com", ["admin@perkley.com"])).toBe(false)
    expect(isWhitelistedAdminEmail(null, ["admin@perkley.com"])).toBe(false)
  })
})
