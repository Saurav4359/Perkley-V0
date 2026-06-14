"use client"

import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, mounted } = useTheme()

  return (
    <div
      className={cn(
        "inline-flex h-[23px] w-16 items-center rounded-full border border-border/80 bg-muted/50 p-0.5 sm:h-[27px] sm:w-[4.5rem]",
        className
      )}
      role="group"
      aria-label="Theme"
    >
      {(["light", "dark"] as const).map((option) => {
        const active = mounted && theme === option
        const Icon = option === "light" ? SunIcon : MoonIcon

        return (
          <button
            key={option}
            type="button"
            aria-label={option === "light" ? "Light theme" : "Dark theme"}
            aria-pressed={active}
            onClick={() => setTheme(option)}
            className={cn(
              "inline-flex h-full flex-1 cursor-pointer items-center justify-center rounded-full transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-[11px] sm:size-[13px]" strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
