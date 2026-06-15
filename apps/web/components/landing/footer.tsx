"use client"

import Link from "next/link"
import { MailIcon } from "lucide-react"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { FooterLinkColumn } from "@/components/landing/footer-links"
import {
  FooterWordmark,
  useFooterWordmarkMotion,
} from "@/components/landing/footer-wordmark"
import { pageContainerClass } from "@/components/landing/primitives"
import { cn } from "@/lib/utils"

const productLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Why Perkley", href: "/#why-perkley" },
  { label: "FAQ", href: "/#faq" },
  { label: "Campaigns", href: "/#how-it-works" },
]

const companyLinks = [
  { label: "About", href: "/#why-perkley" },
  { label: "Careers", href: "mailto:careers@perkley.com" },
  { label: "Blog", href: "/#faq" },
  { label: "Contact", href: "mailto:hello@perkley.com" },
]

const resourceLinks = [
  { label: "Documentation", href: "/#faq" },
  { label: "Creator guide", href: "/#how-it-works" },
  { label: "Brand guide", href: "/#why-perkley" },
  { label: "Support", href: "mailto:support@perkley.com" },
]

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" },
]

const socialLinks = [
  {
    label: "X",
    href: "https://x.com/perkley",
    className:
      "border-white/15 text-white/90 hover:border-white/30 hover:bg-white/10 hover:text-white",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/perkley",
    className:
      "border-[#0A66C2]/30 text-[#0A66C2] hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 hover:text-[#5BA8F5]",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.777 13.019H3.555V9h3.559v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/perkley",
    className:
      "border-[#E4405F]/30 hover:border-[#E4405F]/45 hover:bg-[#E4405F]/10",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-4">
        <defs>
          <linearGradient
            id="footer-instagram-gradient"
            x1="3"
            y1="21"
            x2="21"
            y2="3"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FEDA75" />
            <stop offset="0.35" stopColor="#FA7E1E" />
            <stop offset="0.65" stopColor="#D62976" />
            <stop offset="1" stopColor="#962FBF" />
          </linearGradient>
        </defs>
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          fill="none"
          stroke="url(#footer-instagram-gradient)"
          strokeWidth="1.75"
        />
        <circle
          cx="12"
          cy="12"
          r="4.2"
          fill="none"
          stroke="url(#footer-instagram-gradient)"
          strokeWidth="1.75"
        />
        <circle
          cx="17.35"
          cy="6.65"
          r="1.1"
          fill="url(#footer-instagram-gradient)"
          stroke="none"
        />
      </svg>
    ),
  },
] as const

export function SiteFooter() {
  const {
    pointer,
    parallax,
    isActive,
    reducedMotion,
    handlePointerMove,
    handlePointerLeave,
  } = useFooterWordmarkMotion()

  return (
    <footer
      className="relative overflow-x-hidden bg-[#0A0A0A] text-white"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="relative z-10">
        <div className={cn("pt-28 pb-20 sm:pt-32 sm:pb-24", pageContainerClass)}>
          <div className="grid grid-cols-1 gap-16 xl:grid-cols-12 xl:gap-10">
            <div className="flex max-w-sm flex-col gap-6 xl:col-span-3">
              <Link href="/" className="inline-flex w-fit">
                <PerkleyLogo textClassName="text-white" />
              </Link>
              <p className="max-w-xs text-[15px] leading-7 text-white/50">
                Performance-based creator marketing for brands that want
                measurable reach — and creators who want to be paid for results.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 xl:col-span-6 xl:gap-8">
              <FooterLinkColumn title="Product" links={productLinks} />
              <FooterLinkColumn title="Company" links={companyLinks} />
              <FooterLinkColumn title="Resources" links={resourceLinks} />
              <FooterLinkColumn title="Legal" links={legalLinks} />
            </div>

            <div className="flex flex-col gap-8 xl:col-span-3 xl:items-end xl:text-right">
              <div className="flex flex-col gap-5 xl:items-end">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
                  Connect
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={cn(
                        "inline-flex size-10 items-center justify-center rounded-full border transition-all duration-300",
                        social.className
                      )}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 xl:items-end">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
                  Contact
                </p>
                <a
                  href="mailto:hello@perkley.com"
                  className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors duration-300 hover:text-[#FF6B1A]"
                >
                  <MailIcon className="size-4" strokeWidth={1.75} />
                  hello@perkley.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("border-t border-white/[0.08] pt-8", pageContainerClass)}>
          <div className="mb-6 h-px w-12 bg-[#FF6B1A]" />
          <div className="flex flex-col gap-3 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Perkley. All rights reserved.</p>
            <p className="text-white/55">Built for creators and brands.</p>
          </div>

          <FooterWordmark
            pointer={pointer}
            parallax={parallax}
            isActive={isActive}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </footer>
  )
}
