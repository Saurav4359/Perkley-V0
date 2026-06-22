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
      <div className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
        <div className={pageContainerClass}>
          <header
            className={cn(
              "glass-nav rounded-2xl border transition-[background-color,box-shadow,border-color] duration-300",
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
                    onClick={() => setActiveOnNavigate(id)}
                    className={cn(
                      "relative whitespace-nowrap font-medium no-underline transition-colors focus-visible:outline-none",
                      activeSection === id
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
                  className="inline-flex h-9 items-center rounded-full px-3.5 text-[0.9375rem] font-medium text-foreground/75 transition-colors hover:text-foreground sm:px-4"
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
                        "h-9 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
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
    </>
  )
}
