import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { HeroPreview } from "@/components/landing/hero-preview"
import { MetricChip, pageContainerClass, SectionLabel } from "@/components/landing/primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="border-b border-border">
      <div className={cn("grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24", pageContainerClass)}>
        <div className="flex flex-col gap-8">
          <div className="landing-reveal">
            <SectionLabel>Performance-based creator marketing</SectionLabel>
          </div>

          <div className="flex max-w-xl flex-col gap-5">
            <h1
              className="landing-reveal font-display text-[2.65rem] leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]"
              style={{ "--reveal-delay": "0.04s" } as React.CSSProperties}
            >
              Creator marketing, reimagined.
            </h1>

            <p
              className="landing-reveal max-w-md text-base leading-7 text-muted-foreground sm:text-lg"
              style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
            >
              Launch creator campaigns. Let creators compete. Reward performance
              — not follower counts.
            </p>
          </div>

          <div
            className="landing-reveal flex flex-col gap-3 sm:flex-row"
            style={{ "--reveal-delay": "0.16s" } as React.CSSProperties}
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
          </div>

          <div
            className="landing-reveal flex flex-wrap gap-2 border-t border-border pt-6"
            style={{ "--reveal-delay": "0.24s" } as React.CSSProperties}
          >
            <MetricChip>Brands launch bounties</MetricChip>
            <MetricChip>Creators compete openly</MetricChip>
            <MetricChip>Rewards follow results</MetricChip>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}
