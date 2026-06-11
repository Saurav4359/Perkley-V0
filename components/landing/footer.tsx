import Link from "next/link"

import { WaitlistLink } from "@/components/waitlist-link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-white">
              P
            </span>
            <span className="text-sm font-semibold tracking-tight">Perkley</span>
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

      <div className="mx-auto mt-12 max-w-6xl border-t border-border px-4 pt-8 sm:px-6">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Perkley</p>
          <p>Coming soon.</p>
        </div>
      </div>
    </footer>
  )
}
