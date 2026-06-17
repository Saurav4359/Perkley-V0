import { cn } from "@/lib/utils"

export function DetailSectionLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/55",
        className
      )}
    >
      {children}
    </p>
  )
}

export function DetailMetaItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-foreground/70",
        className
      )}
    >
      {children}
    </span>
  )
}
