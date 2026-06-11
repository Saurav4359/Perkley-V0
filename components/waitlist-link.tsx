"use client"

import Link from "next/link"

import {
  openWaitlist,
  type WaitlistRole,
} from "@/lib/waitlist-navigation"
import { cn } from "@/lib/utils"

type WaitlistLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  waitlistRole?: WaitlistRole
  children: React.ReactNode
  className?: string
}

export function WaitlistLink({
  waitlistRole,
  children,
  className,
  onClick,
  ...props
}: WaitlistLinkProps) {
  const href = waitlistRole ? `/?role=${waitlistRole}#waitlist` : "#waitlist"

  return (
    <Link
      href={href}
      className={cn(className)}
      onClick={(event) => {
        event.preventDefault()
        openWaitlist(waitlistRole)
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </Link>
  )
}
