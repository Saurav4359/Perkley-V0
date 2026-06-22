"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { pageContainerClass } from "@/components/landing/primitives"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { useActiveSection } from "@/lib/use-active-section"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Problem", href: "#problem", id: "problem" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Why Perkley", href: "#why-perkley", id: "why-perkley" },
  { label: "FAQ", href: "#faq", id: "faq" },
] as const

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

export function SiteHeader() {
  const { activeSection, setActiveOnNavigate } = useActiveSection(SECTION_IDS)
  const [scrolled, setScrolled] = useState(false)
  const overHero = !scrolled

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="fixed inset-x-0 top-3 z-50 sm:top-4">
      <div className={pageContainerClass}>
        <header
          className={cn(
            "glass-nav rounded-2xl border transition-[background-color,box-shadow,border-color,color] duration-300",
            scrolled && "glass-nav-scrolled",
            overHero &&
              !scrolled &&
              "border-white/15 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.2)] dark:border-white/12 dark:bg-black/35"
          )}
        >
            <div className="flex h-12 items-center justify-between gap-4 px-3.5 sm:h-14 sm:px-5">
              <Link href="/" className="shrink-0">
                <PerkleyLogo
                  markClassName="h-9 w-9 sm:h-10 sm:w-10"
                  textClassName={cn(
                    "text-[1.05rem] sm:text-[1.15rem]",
                    overHero && "text-white"
                  )}
                />
              </Link>

              <nav className="hidden items-center gap-6 text-[0.9375rem] lg:flex xl:gap-8">
                {NAV_ITEMS.map(({ label, href, id }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setActiveOnNavigate(id)}
                    className={cn(
                      "relative whitespace-nowrap font-medium no-underline transition-colors focus-visible:outline-none",
                      overHero
                        ? activeSection === id
                          ? "text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand after:content-['']"
                          : "text-white/78 hover:text-white"
                        : activeSection === id
                          ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand after:content-['']"
                          : "text-foreground/80 hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <ThemeToggle />
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors sm:px-4",
                    overHero
                      ? "text-white/82 hover:text-white"
                      : "text-foreground/75 hover:text-foreground"
                  )}
                >
                  Login
                </Link>
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      href="/signup"
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "h-9 rounded-full px-4",
                        overHero
                          ? "bg-white text-[#0a0a0a] hover:bg-white/92"
                          : "bg-foreground text-background hover:bg-foreground/90"
                      )}
                    />
                  }
                >
                  Get started
                </Button>
              </div>
            </div>
        </header>
      </div>
    </div>
  )
}
