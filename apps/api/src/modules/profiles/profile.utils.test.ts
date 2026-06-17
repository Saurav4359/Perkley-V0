import { describe, expect, test } from "bun:test"

import {
  accountLast4,
  calculateBrandProfileCompletion,
  calculateCreatorProfileCompletion,
  maskAccountNumber,
  maskUpiId,
  normalizeInstagramHandle,
} from "./profile.utils"

describe("profile utilities", () => {
  test("normalizes instagram handles", () => {
    expect(normalizeInstagramHandle(" @Perkley.Creator ")).toBe("perkley.creator")
    expect(normalizeInstagramHandle("")).toBeNull()
  })

  test("calculates creator profile completion", () => {
    expect(
      calculateCreatorProfileCompletion({
        displayName: "Saurav",
        instagramHandle: "saurav",
        niches: ["tech"],
        contentTypes: ["reel"],
        location: "Bengaluru",
        payoutMethodCount: 1,
        portfolioItemCount: 1,
      })
    ).toBe(100)

    expect(calculateCreatorProfileCompletion({ displayName: "Saurav" })).toBe(14)
  })

  test("calculates brand profile completion", () => {
    expect(
      calculateBrandProfileCompletion({
        brandName: "Perkley",
        bio: "Creator marketing",
        industry: "tech",
        website: "https://perkley.example",
        workEmail: "hello@perkley.example",
        logoUrl: "https://perkley.example/logo.png",
        socialLinks: { instagram: "https://instagram.com/perkley" },
      })
    ).toBe(100)
  })

  test("masks payout details", () => {
    expect(maskUpiId("saurav@upi")).toBe("sa****@upi")
    expect(accountLast4("1234567890")).toBe("7890")
    expect(maskAccountNumber("7890")).toBe("********7890")
  })
})
