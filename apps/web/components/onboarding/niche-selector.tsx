"use client"

import { motion } from "framer-motion"

import { ONBOARDING_NICHES } from "@/lib/onboarding/constants"
import { cn } from "@/lib/utils"

type NicheSelectorProps = {
  selected: string[]
  onChange: (next: string[]) => void
  compact?: boolean
}

export function NicheSelector({ selected, onChange, compact = false }: NicheSelectorProps) {
  function toggle(niche: string) {
    onChange(
      selected.includes(niche)
        ? selected.filter((item) => item !== niche)
        : [...selected, niche]
    )
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3", compact ? "gap-2" : "gap-2.5")}>
      {ONBOARDING_NICHES.map((niche, index) => {
        const active = selected.includes(niche)

        return (
          <motion.button
            key={niche}
            type="button"
            onClick={() => toggle(niche)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.35 }}
            whileHover={{ y: compact ? 0 : -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "border text-left text-sm font-medium transition-colors",
              compact ? "rounded-xl px-3 py-2.5" : "rounded-xl px-3.5 py-3",
              active
                ? "border-brand/40 bg-brand/10 text-foreground shadow-[0_8px_24px_-16px_rgba(254,108,55,0.45)]"
                : "border-border/70 bg-card text-foreground hover:border-foreground/15 hover:bg-muted/30"
            )}
          >
            {niche}
          </motion.button>
        )
      })}
    </div>
  )
}
