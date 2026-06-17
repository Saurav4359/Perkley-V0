import { runAllJobs } from "./jobs.service"

let timer: ReturnType<typeof setInterval> | null = null
let running = false

export function startJobScheduler(intervalMs: number) {
  if (timer) return timer

  timer = setInterval(() => {
    if (running) return
    running = true
    runAllJobs()
      .catch((error) => {
        console.error("Background job run failed:", error)
      })
      .finally(() => {
        running = false
      })
  }, intervalMs)

  if (typeof timer.unref === "function") timer.unref()

  return timer
}

export function stopJobScheduler() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
