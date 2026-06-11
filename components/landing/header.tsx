"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

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
    <div className="sticky top-[15px] z-50 mx-[120px] my-[15px]">
      <header
        className={cn(
          "glass-nav rounded-3xl border border-border transition-[background-color,box-shadow] duration-300",
          scrolled && "glass-nav-scrolled"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-white transition-transform group-hover:scale-[1.02]">
              P
            </span>
            <span className="text-sm font-semibold tracking-tight">Perkley</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            {NAV_ITEMS.map(({ label, href, id }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative transition-colors hover:text-foreground",
                  activeSection === id
                    ? "font-medium text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-brand"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              nativeButton={false}
              render={
                <WaitlistLink
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-full bg-brand px-4 text-white hover:bg-brand/90"
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
  )
}
