"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { motion } from "framer-motion"

import { pageContainerClass } from "@/components/landing/primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/hero-perkley-8k.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_38%] sm:object-center dark:brightness-[0.82] dark:saturate-[0.9]"
          sizes="100vw"
        />
        <div className="hero-premium-scrim absolute inset-0" />
      </div>

      <div className={cn("relative z-10 w-full", pageContainerClass)}>
        <div className="flex flex-col items-center gap-8 px-1 py-24 text-center sm:gap-9 sm:py-28 lg:gap-10 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-4 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/90 backdrop-blur-md sm:text-[11px]">
              Performance-based creator marketing
            </span>
          </motion.div>

          <div className="flex max-w-3xl flex-col gap-5 sm:gap-6">
            <motion.h1
              className="font-display text-[2.75rem] leading-[1.02] tracking-[-0.02em] text-balance text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-[4rem] lg:leading-[1.04]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Creator marketing, reimagined.
            </motion.h1>

            <motion.p
              className="mx-auto max-w-xl text-base leading-7 text-white/84 sm:text-lg sm:leading-8"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Launch creator campaigns. Let creators compete. Reward performance
              — not follower counts.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Button
              size="lg"
              className="h-11 rounded-full px-7 bg-white text-[#0a0a0a] shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:bg-white/92"
              render={<Link href="#how-it-works" />}
            >
              For brands
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-full border-white/30 bg-white/10 px-7 text-white backdrop-blur-sm hover:border-white/45 hover:bg-white/18 hover:text-white"
              render={<Link href="#how-it-works" />}
            >
              For creators
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
