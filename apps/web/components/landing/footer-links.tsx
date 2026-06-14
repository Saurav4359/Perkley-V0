"use client"

import Link from "next/link"
import { useRef, useState } from "react"

type FooterMagneticLinkProps = {
  href: string
  children: React.ReactNode
  external?: boolean
}

export function FooterMagneticLink({
  href,
  children,
  external,
}: FooterMagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2

    setOffset({ x: x * 0.12, y: y * 0.18 })
  }

  const className =
    "inline-flex w-fit text-sm text-white/55 transition-colors duration-300 hover:text-white"

  const style = {
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
  }

  if (external || href.startsWith("mailto:")) {
    return (
      <a
        ref={ref}
        href={href}
        className={className}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setOffset({ x: 0, y: 0 })}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </Link>
  )
}

type FooterLinkColumnProps = {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <FooterMagneticLink href={link.href} external={link.external}>
              {link.label}
            </FooterMagneticLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
