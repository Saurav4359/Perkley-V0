"use client"

import { motion } from "framer-motion"

import { ONBOARDING_CONTENT_TYPES } from "@/lib/onboarding/constants"
import { cn } from "@/lib/utils"

type ContentTypeSelectorProps = {
  selected: string[]
  onChange: (next: string[]) => void
  compact?: boolean
}

export function ContentTypeSelector({
  selected,
  onChange,
  compact = false,
}: ContentTypeSelectorProps) {
  function toggle(contentType: string) {
    onChange(
      selected.includes(contentType)
        ? selected.filter((item) => item !== contentType)
        : [...selected, contentType]
    )
  }

  return (
    <div className={cn("flex flex-wrap", compact ? "gap-2" : "gap-3")}>
      {ONBOARDING_CONTENT_TYPES.map((contentType, index) => {
        const active = selected.includes(contentType)

        return (
          <motion.button
            key={contentType}
            type="button"
            onClick={() => toggle(contentType)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            whileHover={{ y: compact ? 0 : -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "rounded-full border text-sm font-medium transition-colors",
              compact ? "px-3.5 py-2" : "px-4 py-2.5",
              active
                ? "border-brand/40 bg-brand text-white shadow-[0_8px_24px_-16px_rgba(254,108,55,0.55)]"
                : "border-border/70 bg-card text-foreground hover:border-foreground/15 hover:bg-muted/30"
            )}
          >
            {contentType}
          </motion.button>
        )
      })}
    </div>
  )
}
