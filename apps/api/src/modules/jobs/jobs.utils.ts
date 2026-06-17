export const DEFAULT_REMINDER_WINDOW_HOURS = 24

export function isCampaignExpired(deadline: Date, now: Date = new Date()) {
  return deadline.getTime() <= now.getTime()
}

export function hoursUntil(deadline: Date, now: Date = new Date()) {
  return (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
}

export function isWithinReminderWindow(
  deadline: Date,
  now: Date = new Date(),
  windowHours: number = DEFAULT_REMINDER_WINDOW_HOURS
) {
  const remaining = hoursUntil(deadline, now)
  return remaining > 0 && remaining <= windowHours
}

export function reminderHoursRemaining(deadline: Date, now: Date = new Date()) {
  return Math.max(1, Math.ceil(hoursUntil(deadline, now)))
}

export const JOB_NAMES = [
  "expire-campaigns",
  "verify-submissions",
  "refresh-metrics",
  "deadline-reminders",
] as const

export type JobName = (typeof JOB_NAMES)[number]

export function isValidJobName(name: string): name is JobName {
  return (JOB_NAMES as readonly string[]).includes(name)
}

export function summarizeJobRun(results: Array<{ job: string; processed: number }>) {
  return {
    jobs: results.length,
    totalProcessed: results.reduce((sum, result) => sum + result.processed, 0),
    results,
  }
}
