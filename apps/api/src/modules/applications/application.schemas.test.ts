import { describe, expect, test } from "bun:test"

import {
  applyToCampaignSchema,
  creatorApplicationsQuerySchema,
  listApplicationsQuerySchema,
} from "./application.schemas"

describe("application schemas", () => {
  test("accepts optional apply message", () => {
    expect(applyToCampaignSchema.parse({})).toEqual({})
    expect(applyToCampaignSchema.parse({ message: "Excited to collaborate" })).toEqual({
      message: "Excited to collaborate",
    })
  })

  test("rejects overly long apply messages", () => {
    expect(() => applyToCampaignSchema.parse({ message: "a".repeat(501) })).toThrow()
  })

  test("accepts optional status filters", () => {
    expect(listApplicationsQuerySchema.parse({})).toEqual({})
    expect(listApplicationsQuerySchema.parse({ status: "pending" })).toEqual({
      status: "pending",
    })
    expect(creatorApplicationsQuerySchema.parse({ status: "accepted" })).toEqual({
      status: "accepted",
    })
  })
})
