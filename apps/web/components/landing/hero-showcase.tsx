"use client"

import { motion } from "framer-motion"

import { HeroPreview } from "@/components/landing/hero-preview"
import {
  FlowDottedArrow,
  MetricChip,
  pageContainerClass,
} from "@/components/landing/primitives"

const SHOWCASE_FLOW_STEPS = [
  "Brands launch bounties",
  "Creators compete openly",
  "Rewards follow results",
] as const

export function HeroShowcaseSection() {
  return (
    <section
      id="showcase"
      className="border-b border-border bg-background py-14 sm:py-20 lg:py-24"
    >
      <div className={pageContainerClass}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_24px_64px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)_inset] sm:rounded-[2rem] dark:border-white/10 dark:shadow-[0_32px_96px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.05)_inset]">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 border-b border-border bg-muted/40 px-5 py-4 sm:gap-x-2.5 sm:px-7 sm:py-5 dark:bg-white/[0.03]">
              {SHOWCASE_FLOW_STEPS.flatMap((step, index) => {
                const chip = (
                  <MetricChip key={step} variant="emphasis">
                    {step}
                  </MetricChip>
                )

                if (index === 0) return [chip]

                return [<FlowDottedArrow key={`arrow-${index}`} />, chip]
              })}
            </div>
            <div className="p-4 sm:p-6 lg:p-7">
              <HeroPreview embedded />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
