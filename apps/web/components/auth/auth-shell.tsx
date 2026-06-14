import Link from "next/link"

import { AuthShowcase } from "@/components/auth/auth-showcase"
import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  children: React.ReactNode
  className?: string
  formClassName?: string
  variant?: "login" | "signup"
}

export function AuthShell({
  children,
  className,
  formClassName,
  variant = "login",
}: AuthShellProps) {
  return (
    <div className={cn("min-h-screen bg-background lg:grid lg:grid-cols-2", className)}>
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
        <Link href="/" className="inline-flex w-fit shrink-0">
          <PerkleyLogo
            className="gap-2"
            markClassName="block h-10 w-10 sm:h-11 sm:w-11"
            textClassName="text-[1.65rem] leading-none sm:text-[1.85rem]"
          />
        </Link>

        <div
          className={cn(
            "mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 lg:py-12",
            formClassName
          )}
        >
          {children}
        </div>
      </div>

      <div className="hidden bg-muted/40 p-8 lg:flex lg:items-center lg:justify-center lg:p-10 xl:p-14">
        <AuthShowcase variant={variant} className="max-h-[calc(100vh-5rem)]" />
      </div>
    </div>
  )
}
