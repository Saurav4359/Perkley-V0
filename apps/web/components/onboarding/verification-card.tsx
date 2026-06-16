"use client"

import Image from "next/image"
import { AlertTriangleIcon, BadgeCheckIcon } from "lucide-react"
import { motion } from "framer-motion"

import {
  onboardingCardClassName,
  onboardingPrimaryButtonClassName,
  OnboardingCardBack,
  OnboardingStepActions,
} from "@/components/onboarding/progress-header"
import type { InstagramProfile } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

type VerificationCardProps = {
  profile: InstagramProfile
  onContinue: () => void
  onBack?: () => void
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value)
}

function ProfileAvatar({ profile }: { profile: InstagramProfile }) {
  if (profile.profileImageUrl) {
    return (
      <Image
        src={profile.profileImageUrl}
        alt=""
        width={64}
        height={64}
        className="size-16 rounded-2xl object-cover ring-2 ring-border"
      />
    )
  }

  const initial = profile.username.replace("@", "").charAt(0).toUpperCase() || "S"

  return (
    <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#FF8547] text-2xl font-semibold text-white ring-2 ring-border">
      {initial}
    </div>
  )
}

function ReadOnlyField({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 sm:px-4 sm:py-3",
        className
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function VerificationCard({ profile, onContinue, onBack }: VerificationCardProps) {
  const blocked = !profile.isProfessionalAccount

  return (
    <motion.div
      className={onboardingCardClassName()}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {onBack ? <OnboardingCardBack onClick={onBack} className="mb-4" /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Verify your profile
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Review the information pulled from Instagram before continuing.
          </p>
        </div>
        {!blocked ? (
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <BadgeCheckIcon className="size-4" />
            Verified
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-4 border-b border-border/60 pb-5">
        <ProfileAvatar profile={profile} />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-foreground">{profile.username}</p>
          <p className="truncate text-sm text-muted-foreground">{profile.category}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <ReadOnlyField label="Followers" value={formatCount(profile.followers)} />
        <ReadOnlyField label="Category" value={profile.category} />
        <ReadOnlyField label="Location" value={profile.location} />
        <ReadOnlyField
          label="Professional account"
          value={profile.isProfessionalAccount ? "Yes" : "No"}
        />
        <ReadOnlyField label="Average views" value={formatCount(profile.averageViews)} />
        <ReadOnlyField label="Average likes" value={formatCount(profile.averageLikes)} />
      </div>

      {blocked ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Switch to Professional Account to continue
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Convert your Instagram account to a Professional account, then reconnect.
            </p>
          </div>
        </div>
      ) : null}

      <OnboardingStepActions className="mt-5">
        {!blocked ? (
          <button
            type="button"
            onClick={onContinue}
            className={onboardingPrimaryButtonClassName()}
          >
            Continue
          </button>
        ) : null}
      </OnboardingStepActions>
    </motion.div>
  )
}
