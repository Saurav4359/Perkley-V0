import { describe, expect, test } from "bun:test"

import {
  hoursUntil,
  isCampaignExpired,
  isValidJobName,
  isWithinReminderWindow,
  reminderHoursRemaining,
  summarizeJobRun,
} from "./jobs.utils"

const NOW = new Date("2026-06-17T12:00:00.000Z")

describe("jobs utilities", () => {
  test("detects expired campaigns", () => {
    expect(isCampaignExpired(new Date("2026-06-17T11:00:00.000Z"), NOW)).toBe(true)
    expect(isCampaignExpired(new Date("2026-06-17T13:00:00.000Z"), NOW)).toBe(false)
  })

  test("computes hours until deadline", () => {
    expect(hoursUntil(new Date("2026-06-17T18:00:00.000Z"), NOW)).toBe(6)
  })

  test("detects reminder window", () => {
    expect(isWithinReminderWindow(new Date("2026-06-18T06:00:00.000Z"), NOW)).toBe(true)
    expect(isWithinReminderWindow(new Date("2026-06-19T12:00:00.000Z"), NOW)).toBe(false)
    expect(isWithinReminderWindow(new Date("2026-06-17T11:00:00.000Z"), NOW)).toBe(false)
  })

  test("rounds up reminder hours remaining", () => {
    expect(reminderHoursRemaining(new Date("2026-06-17T17:30:00.000Z"), NOW)).toBe(6)
    expect(reminderHoursRemaining(new Date("2026-06-17T12:01:00.000Z"), NOW)).toBe(1)
  })

  test("validates job names", () => {
    expect(isValidJobName("expire-campaigns")).toBe(true)
    expect(isValidJobName("unknown-job")).toBe(false)
  })

  test("summarizes job run results", () => {
    expect(
      summarizeJobRun([
        { job: "expire-campaigns", processed: 2 },
        { job: "deadline-reminders", processed: 3 },
      ])
    ).toEqual({
      jobs: 2,
      totalProcessed: 5,
      results: [
        { job: "expire-campaigns", processed: 2 },
        { job: "deadline-reminders", processed: 3 },
      ],
    })
  })
})
