"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { cn } from "@/lib/utils"

type OnboardingLayoutProps = {
  children: React.ReactNode
  className?: string
}

export function OnboardingLayout({ children, className }: OnboardingLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand/[0.07] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-brand/[0.04] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
        <Link href="/" className="inline-flex w-fit shrink-0">
          <PerkleyLogo
            className="gap-2"
            markClassName="block h-8 w-8 sm:h-9 sm:w-9"
            textClassName="text-lg leading-none sm:text-xl"
          />
        </Link>

        <motion.main
          className={cn("mx-auto flex w-full min-h-0 flex-1 flex-col py-4 sm:py-5", className)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
