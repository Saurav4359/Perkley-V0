import { cn } from "@/lib/utils"

export const pageContainerClass = "mx-auto w-full max-w-6xl px-4 sm:px-6"

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brand",
        className
      )}
    >
      {children}
    </p>
  )
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
  className,
}: {
  label: string
  title: string
  description?: string
  align?: "center" | "left"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-2xl text-center",
        className
      )}
    >
      <SectionLabel>{label}</SectionLabel>
      <h2 className="font-display text-3xl font-normal tracking-tight text-balance sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function SurfaceCard({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "muted" | "inverse"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        variant === "default" &&
          "border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        variant === "muted" && "border-border bg-muted/50",
        variant === "inverse" &&
          "border-white/10 bg-[#0a0a0a] text-[#fafafa] shadow-[0_24px_64px_rgba(0,0,0,0.24)]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AudienceTag({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: "brand" | "creator"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em]",
        variant === "brand" && "bg-foreground text-background",
        variant === "creator" &&
          "border border-brand/20 bg-brand-muted text-brand"
      )}
    >
      {children}
    </span>
  )
}

export function MetricChip({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}
