"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { pageContainerClass } from "@/components/landing/primitives"
import { Button, buttonVariants } from "@/components/ui/button"
import { WaitlistLink } from "@/components/waitlist-link"
import { useActiveSection } from "@/lib/use-active-section"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Problem", href: "#problem", id: "problem" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Why Perkley", href: "#why-perkley", id: "why-perkley" },
  { label: "FAQ", href: "#faq", id: "faq" },
  { label: "Waitlist", href: "#waitlist", id: "waitlist" },
] as const

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

export function SiteHeader() {
  const activeSection = useActiveSection(SECTION_IDS)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <div
        className="pointer-events-none h-16 shrink-0 sm:h-[4.5rem]"
        aria-hidden
      />
      <div className="fixed inset-x-0 top-0 z-50">
        <div className={pageContainerClass}>
          <header
            className={cn(
              "glass-nav my-4 rounded-2xl border transition-[background-color,box-shadow,border-color] duration-300",
              scrolled && "glass-nav-scrolled"
            )}
          >
            <div className="flex h-12 items-center justify-between gap-4 px-3.5 sm:h-14 sm:px-5">
              <Link href="/" className="shrink-0">
                <PerkleyLogo
                  markClassName="h-9 w-9 sm:h-10 sm:w-10"
                  textClassName="text-[1.05rem] sm:text-[1.15rem]"
                />
              </Link>

              <nav className="hidden items-center gap-6 text-[0.9375rem] lg:flex xl:gap-8">
                {NAV_ITEMS.map(({ label, href, id }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative whitespace-nowrap font-medium transition-colors",
                      activeSection === id
                        ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand"
                        : "text-foreground/80 hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  nativeButton={false}
                  render={
                    <WaitlistLink
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
                      )}
                    >
                      Join waitlist
                    </WaitlistLink>
                  }
                />
              </div>
            </div>
          </header>
        </div>
      </div>
    </>
  )
}
