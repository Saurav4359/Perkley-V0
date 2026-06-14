"use client"

import { Montserrat } from "next/font/google"
import { useCallback, useEffect, useState } from "react"

const wordmarkFont = Montserrat({
  subsets: ["latin"],
  weight: ["700"],
})

const WORDMARK_GRADIENT =
  "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.52) 38%, rgba(255,255,255,0.22) 68%, rgba(255,255,255,0.08) 100%)"

type FooterWordmarkProps = {
  pointer: { x: number; y: number }
  parallax: { x: number; y: number }
  isActive: boolean
  reducedMotion: boolean
}

export function useFooterWordmarkMotion() {
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 })
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [isActive, setIsActive] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width
      const y = (event.clientY - bounds.top) / bounds.height

      const nextPointer = {
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
      }

      setPointer(nextPointer)
      setIsActive(true)

      if (!reducedMotion) {
        setParallax({
          x: (nextPointer.x - 0.5) * 8,
          y: (nextPointer.y - 0.5) * 4,
        })
      }
    },
    [reducedMotion]
  )

  const handlePointerLeave = useCallback(() => {
    setIsActive(false)
    setParallax({ x: 0, y: 0 })
    setPointer({ x: 0.5, y: 0.5 })
  }, [])

  return {
    pointer,
    parallax,
    isActive,
    reducedMotion,
    handlePointerMove,
    handlePointerLeave,
  }
}

export function FooterWordmark({
  pointer,
  parallax,
  isActive,
  reducedMotion,
}: FooterWordmarkProps) {
  const glowX = pointer.x * 100
  const glowY = pointer.y * 100

  const wordmarkTextClass = `${wordmarkFont.className} block w-full text-center whitespace-nowrap text-[length:clamp(3rem,min(14vw,calc((100vw-4rem)/5.5)),9.5rem)] leading-none font-bold tracking-[0.08em] sm:tracking-[0.12em] text-transparent`

  return (
    <div
      aria-hidden
      className="pointer-events-none relative w-full select-none overflow-hidden pt-2 sm:pt-4"
    >
      <div
        className="relative w-full translate-y-[7%]"
        style={{
          transform: reducedMotion
            ? undefined
            : `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          willChange: reducedMotion ? undefined : "transform",
        }}
      >
        <span
          className={wordmarkTextClass}
          style={{
            backgroundImage: WORDMARK_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          PERKLEY
        </span>

        <span
          className={`${wordmarkTextClass} absolute inset-0 transition-opacity duration-500`}
          style={{
            opacity: isActive && !reducedMotion ? 1 : 0,
            backgroundImage: `radial-gradient(circle 120px at ${glowX}% ${glowY}%, rgba(255,107,26,0.35), transparent 72%), ${WORDMARK_GRADIENT}`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          PERKLEY
        </span>
      </div>
    </div>
  )
}
