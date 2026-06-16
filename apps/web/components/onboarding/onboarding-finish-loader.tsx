"use client"

import { motion } from "framer-motion"

import { onboardingCardClassName } from "@/components/onboarding/progress-header"

export const ONBOARDING_FINISH_DURATION_MS = 1200

export function OnboardingFinishLoader() {
  return (
    <motion.div
      className={onboardingCardClassName("mx-auto max-w-xl text-center")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Finishing your profile
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Saving your details and unlocking your dashboard…
      </p>

      <div className="mx-auto mt-8 max-w-sm space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand to-[#FF8547]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: ONBOARDING_FINISH_DURATION_MS / 1000,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
        <motion.p
          className="text-xs font-medium text-muted-foreground"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          Almost there
        </motion.p>
      </div>
    </motion.div>
  )
}
