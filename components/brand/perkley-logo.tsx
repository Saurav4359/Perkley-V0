import { Montserrat } from "next/font/google"

import { cn } from "@/lib/utils"

const perkleyWordmark = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
})

type PerkleyLogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
}

export function PerkleyMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand-logo-perkley.png"
      alt=""
      aria-hidden
      decoding="async"
      className={cn(
        "h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12",
        className
      )}
    />
  )
}

export function PerkleyLogo({
  className,
  markClassName,
  textClassName,
}: PerkleyLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <PerkleyMark className={markClassName} />
      <span
        className={cn(
          perkleyWordmark.className,
          "text-[1.2rem] leading-none font-bold tracking-[-0.02em] text-foreground sm:text-[1.3rem]",
          textClassName
        )}
      >
        Perkley
      </span>
    </span>
  )
}
