"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { motion } from "framer-motion"

import { HeroPreview } from "@/components/landing/hero-preview"
import { MetricChip, pageContainerClass, SectionLabel } from "@/components/landing/primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/hero-nyc-times-square.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_42%] sm:object-center"
          sizes="100vw"
        />
        <div className="hero-cinematic-scrim absolute inset-0" />
      </div>

      <div
        className={cn(
          "relative z-10 grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24",
          pageContainerClass
        )}
      >
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionLabel>Performance-based creator marketing</SectionLabel>
          </motion.div>

          <div className="flex max-w-xl flex-col gap-5">
            <motion.h1
              className="font-display text-[2.65rem] leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              Creator marketing, reimagined.
            </motion.h1>

            <motion.p
              className="max-w-md text-base leading-7 text-muted-foreground sm:text-lg"
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
              className="h-11 rounded-full px-6 bg-foreground text-background hover:bg-foreground/90"
              render={<Link href="#how-it-works" />}
            >
              For brands
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-full border-brand/30 px-6 text-brand hover:border-brand hover:bg-brand-muted"
              render={<Link href="#how-it-works" />}
            >
              For creators
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-2 border-t border-border pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.24 }}
          >
            <MetricChip>Brands launch bounties</MetricChip>
            <MetricChip>Creators compete openly</MetricChip>
            <MetricChip>Rewards follow results</MetricChip>
          </motion.div>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}
