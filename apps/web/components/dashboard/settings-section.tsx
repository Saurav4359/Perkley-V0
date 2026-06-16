import { cn } from "@/lib/utils"

export function SettingsPageShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-8">
      <div className="relative px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(254,108,55,0.06),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(147,197,253,0.06),transparent_40%)]"
        />

        <div className="relative mx-auto max-w-4xl">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="mt-8 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 sm:p-6", className)}>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function SettingsToggleRow({
  label,
  hint,
  enabled,
  onToggle,
}: {
  label: string
  hint: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
          enabled
            ? "border-brand bg-brand-muted text-brand"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        {enabled ? "On" : "Off"}
      </button>
    </div>
  )
}
