import Link from "next/link"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { pageContainerClass } from "@/components/landing/primitives"
import { WaitlistLink } from "@/components/waitlist-link"
import { cn } from "@/lib/utils"

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-16">
      <div className={cn("flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between", pageContainerClass)}>
        <div className="flex flex-col gap-4">
          <Link href="/" className="inline-flex w-fit">
            <PerkleyLogo />
          </Link>
          <p className="max-w-xs text-sm leading-7 text-muted-foreground">
            Creator marketing, reimagined. A performance marketplace where brands
            and creators both win.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Explore
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="#how-it-works" className="transition-colors hover:text-foreground">
                How it works
              </Link>
              <Link href="#why-perkley" className="transition-colors hover:text-foreground">
                Why Perkley
              </Link>
              <Link href="#faq" className="transition-colors hover:text-foreground">
                FAQ
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Join
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <WaitlistLink
                waitlistRole="brand"
                className="transition-colors hover:text-foreground"
              >
                Brand waitlist
              </WaitlistLink>
              <WaitlistLink
                waitlistRole="creator"
                className="transition-colors hover:text-foreground"
              >
                Creator waitlist
              </WaitlistLink>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("mt-12 border-t border-border pt-8", pageContainerClass)}>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Perkley</p>
          <p>Coming soon.</p>
        </div>
      </div>
    </footer>
  )
}
