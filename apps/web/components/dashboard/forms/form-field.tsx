"use client"

import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export function FormField({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}

export const inputClassName = cn(
  "h-11 w-full rounded-xl border border-border/70 bg-card px-3.5 text-sm text-foreground",
  "shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors",
  "placeholder:text-muted-foreground/70",
  "focus-visible:border-brand/35 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/15",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

export const textareaClassName = cn(
  "min-h-[132px] w-full resize-y rounded-xl border border-border/70 bg-card px-3.5 py-3 text-sm text-foreground",
  "shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors",
  "placeholder:text-muted-foreground/70",
  "focus-visible:border-brand/35 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/15"
)

export function CharCounter({
  current,
  max,
  className,
}: {
  current: number
  max: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "pointer-events-none text-xs tabular-nums text-muted-foreground",
        current > max && "text-destructive",
        className
      )}
    >
      {current}/{max}
    </span>
  )
}

export function SelectInput({
  value,
  onChange,
  options,
  icon,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  icon?: React.ReactNode
}) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          inputClassName,
          "appearance-none pr-10",
          icon && "pl-10"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={2}
      />
    </div>
  )
}

export function InputWithIcon({
  icon,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <input
        className={cn(inputClassName, icon && "pl-10", className)}
        {...props}
      />
    </div>
  )
}
