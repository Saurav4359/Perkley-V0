"use client"

import { useEffect, useState } from "react"

type CampaignCountdownProps = {
  dueInDays: number
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function CampaignCountdown({ dueInDays }: CampaignCountdownProps) {
  const [remaining, setRemaining] = useState(() => ({
    days: dueInDays,
    hours: 4,
    minutes: 22,
  }))

  useEffect(() => {
    if (dueInDays <= 0) return

    const interval = window.setInterval(() => {
      setRemaining((current) => {
        let { days, hours, minutes } = current
        minutes -= 1
        if (minutes < 0) {
          minutes = 59
          hours -= 1
        }
        if (hours < 0) {
          hours = 23
          days -= 1
        }
        if (days < 0) {
          return { days: 0, hours: 0, minutes: 0 }
        }
        return { days, hours, minutes }
      })
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [dueInDays])

  if (dueInDays <= 0) {
    return <span className="font-semibold tabular-nums text-foreground">Closed</span>
  }

  return (
    <span className="font-semibold tabular-nums text-foreground">
      {remaining.days}d:{pad(remaining.hours)}h:{pad(remaining.minutes)}m
    </span>
  )
}
