"use client"

import { useState } from "react"
import { LoaderCircleIcon } from "lucide-react"
import { motion } from "framer-motion"

import { InstagramIcon } from "@/components/auth/auth-social-icons"
import {
  onboardingCardClassName,
  onboardingPrimaryButtonClassName,
  OnboardingStepActions,
} from "@/components/onboarding/progress-header"
import { simulateInstagramConnect } from "@/lib/onboarding/mock-instagram"
import { cn } from "@/lib/utils"

type InstagramConnectCardProps = {
  onConnected: ReturnType<typeof simulateInstagramConnect> extends infer T ? (profile: T) => void : never
}

export function InstagramConnectCard({ onConnected }: InstagramConnectCardProps) {
  const [connecting, setConnecting] = useState(false)

  async function handleConnect() {
    setConnecting(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    onConnected(simulateInstagramConnect())
    setConnecting(false)
  }

  return (
    <motion.div
      className={cn(onboardingCardClassName(), "mx-auto max-w-xl text-center")}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted/40">
        <InstagramIcon />
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Connect your Instagram Professional Account
      </h2>
      <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        Connect your Instagram account to verify your creator profile and unlock
        campaign applications.
      </p>

      <OnboardingStepActions className="mt-7 sm:justify-center">
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className={cn(onboardingPrimaryButtonClassName(), "sm:min-w-[240px]")}
        >
          {connecting ? (
            <>
              <LoaderCircleIcon className="size-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <InstagramIcon />
              Continue with Instagram
            </>
          )}
        </button>
      </OnboardingStepActions>
    </motion.div>
  )
}
