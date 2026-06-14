"use client"

import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"

import { authInputClassName } from "@/components/auth/auth-styles"

type PasswordFieldProps = {
  label?: string
  placeholder?: string
  labelAction?: React.ReactNode
  autoComplete?: "current-password" | "new-password"
}

export function PasswordField({
  label = "Password",
  placeholder = "••••••••",
  labelAction,
  autoComplete = "current-password",
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {labelAction}
      </div>
      <div className="relative mt-2">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${authInputClassName} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((show) => !show)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          {showPassword ? (
            <EyeIcon className="size-4" strokeWidth={1.75} />
          ) : (
            <EyeOffIcon className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  )
}
