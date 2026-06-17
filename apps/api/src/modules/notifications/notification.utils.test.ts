import { describe, expect, test } from "bun:test"

import {
  buildApplicationAcceptedNotification,
  buildDeadlineReminderNotification,
  buildNewCampaignNotification,
  buildPaymentReleasedNotification,
  buildSubmissionReviewedNotification,
  buildWinnerAnnouncedNotification,
  notificationKindForType,
} from "./notification.utils"

describe("notification utilities", () => {
  test("maps notification types to dashboard kinds", () => {
    expect(notificationKindForType("new_campaign")).toBe("new")
    expect(notificationKindForType("application_accepted")).toBe("qualified")
    expect(notificationKindForType("submission_reviewed")).toBe("review")
    expect(notificationKindForType("payment_released")).toBe("payout")
    expect(notificationKindForType("deadline_reminder")).toBe("deadline")
  })

  test("builds deadline reminder notification copy", () => {
    const reminder = buildDeadlineReminderNotification({
      campaignId: "campaign-1",
      campaignTitle: "UPI demo reel",
      hoursRemaining: 12,
    })
    expect(reminder.type).toBe("deadline_reminder")
    expect(reminder.body).toContain("12h")
  })

  test("builds application accepted notification copy", () => {
    expect(
      buildApplicationAcceptedNotification({
        campaignId: "campaign-1",
        campaignTitle: "Vitamin C launch",
        brandName: "Northline",
      })
    ).toEqual({
      type: "application_accepted",
      title: "Application accepted",
      body: "Northline accepted your application for Vitamin C launch",
      href: "/dashboard/campaigns/campaign-1",
      metadata: { campaignId: "campaign-1" },
    })
  })

  test("builds submission reviewed notification copy", () => {
    const rejected = buildSubmissionReviewedNotification({
      campaignId: "campaign-1",
      campaignTitle: "UPI demo reel",
      approved: false,
    })

    expect(rejected.title).toBe("Submission rejected")
    expect(rejected.body).toContain("rejected")
  })

  test("builds winner and payment notifications", () => {
    expect(
      buildWinnerAnnouncedNotification({
        campaignId: "campaign-1",
        campaignTitle: "Summer shred",
        prizeAmount: 25000,
      }).body
    ).toContain("₹25,000")

    expect(
      buildPaymentReleasedNotification({
        campaignId: "campaign-1",
        campaignTitle: "Summer shred",
        amountInr: 5000,
      }).title
    ).toBe("Payout processed")
  })

  test("builds new campaign notification copy", () => {
    expect(
      buildNewCampaignNotification({
        campaignId: "campaign-1",
        campaignTitle: "Vitamin C launch",
        brandName: "Northline",
        campaignType: "bounty",
      }).title
    ).toBe("New bounty live")
  })
})
