"use client"

import Link from "next/link"
import { ArrowRight, LockKeyhole } from "lucide-react"

import { useOnboardingProgress } from "@/hooks/use-onboarding-progress"
import { cn } from "@/lib/utils"

type CompleteProfileReminderProps = {
  className?: string
  title?: string
}

export function CompleteProfileReminder({
  className,
  title = "Complete your profile to participate",
}: CompleteProfileReminderProps) {
  const { canParticipate, incomplete, resumeStep } = useOnboardingProgress()

  if (canParticipate) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-500/25 bg-amber-500/8 p-5",
        className
      )}
    >
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
          <LockKeyhole className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Finish the remaining steps before you submit an entry to this listing.
          </p>
          <ul className="mt-3 space-y-1">
            {incomplete.map((item) => (
              <li key={item.id} className="text-sm text-foreground/85">
                · {item.label}
              </li>
            ))}
          </ul>
          <Link
            href={`/onboarding?step=${resumeStep}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            Complete profile
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
