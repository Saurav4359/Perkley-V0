import { describe, expect, test } from "bun:test"

import {
  createPortfolioItemSchema,
  updateBrandProfileSchema,
  updateCreatorProfileSchema,
  upsertPaymentDetailsSchema,
} from "./profile.schemas"

describe("profile schemas", () => {
  test("accepts creator profile updates", () => {
    const parsed = updateCreatorProfileSchema.parse({
      displayName: "Saurav",
      instagramHandle: "@saurav.creator",
      location: "Bengaluru",
      niches: ["Tech", " Lifestyle "],
      contentTypes: ["reel", "post"],
    })

    expect(parsed.niches).toEqual(["tech", "lifestyle"])
  })

  test("rejects unsafe instagram handles", () => {
    const parsed = updateCreatorProfileSchema.safeParse({
      instagramHandle: "bad handle",
    })

    expect(parsed.success).toBe(false)
  })

  test("accepts upi and bank payout details", () => {
    expect(
      upsertPaymentDetailsSchema.safeParse({
        type: "upi",
        upiId: "saurav@upi",
      }).success
    ).toBe(true)

    expect(
      upsertPaymentDetailsSchema.safeParse({
        type: "bank",
        accountHolder: "Saurav Sharma",
        accountNumber: "1234567890",
        ifsc: "HDFC0123456",
      }).success
    ).toBe(true)
  })

  test("accepts brand profile updates", () => {
    const parsed = updateBrandProfileSchema.parse({
      brandName: "Perkley",
      website: "https://perkley.example",
      workEmail: "HELLO@PERKLEY.EXAMPLE",
      socialLinks: {
        instagram: "https://instagram.com/perkley",
      },
    })

    expect(parsed.workEmail).toBe("hello@perkley.example")
  })

  test("accepts portfolio item metadata", () => {
    const parsed = createPortfolioItemSchema.parse({
      title: "Launch reel",
      url: "https://instagram.com/p/example",
      contentType: "reel",
    })

    expect(parsed.platform).toBe("instagram")
    expect(parsed.metrics).toEqual({})
  })
})
