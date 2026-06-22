"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { motion } from "framer-motion"

import { HeroPreview } from "@/components/landing/hero-preview"
import { MetricChip, pageContainerClass } from "@/components/landing/primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative -mt-16 overflow-hidden border-b border-border sm:-mt-[4.5rem]">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/hero-nyc-times-square.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_42%] sm:object-center dark:brightness-[0.78] dark:saturate-[0.88] dark:contrast-[1.04]"
          sizes="100vw"
        />
        <div className="hero-cinematic-scrim absolute inset-0" />
      </div>

      <div className={cn("relative z-10", pageContainerClass)}>
        <div className="flex flex-col items-center gap-8 px-1 pb-10 pt-[5.5rem] text-center sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center rounded-full border border-white/25 bg-black/35 px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/92 backdrop-blur-md dark:border-white/20 dark:bg-black/55">
              Performance-based creator marketing
            </span>
          </motion.div>

          <div className="flex max-w-3xl flex-col gap-5">
            <motion.h1
              className="font-display text-[2.65rem] leading-[1.02] tracking-tight text-balance text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-[3.65rem]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              Creator marketing, reimagined.
            </motion.h1>

            <motion.p
              className="mx-auto max-w-xl text-base leading-7 text-white/88 drop-shadow-[0_1px_16px_rgba(0,0,0,0.35)] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Launch creator campaigns. Let creators compete. Reward performance
              — not follower counts.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              size="lg"
              className="h-11 rounded-full px-6 bg-white text-[#0a0a0a] shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/92 dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
              render={<Link href="#how-it-works" />}
            >
              For brands
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-full border-white/35 bg-white/12 px-6 text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/20 hover:text-white dark:border-white/25 dark:bg-black/30 dark:hover:border-white/40 dark:hover:bg-black/40"
              render={<Link href="#how-it-works" />}
            >
              For creators
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mb-14 sm:mb-20 lg:mb-24"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-card shadow-[0_32px_80px_rgba(0,0,0,0.16),0_1px_0_rgba(255,255,255,0.8)_inset] sm:rounded-[2rem] dark:border-white/10 dark:bg-card dark:shadow-[0_32px_96px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.05)_inset]">
            <div className="flex flex-wrap justify-center gap-3 border-b border-border bg-muted/40 px-5 py-4 sm:gap-4 sm:px-7 sm:py-5 dark:bg-white/[0.03]">
              <MetricChip variant="emphasis">Brands launch bounties</MetricChip>
              <MetricChip variant="emphasis">Creators compete openly</MetricChip>
              <MetricChip variant="emphasis">Rewards follow results</MetricChip>
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
