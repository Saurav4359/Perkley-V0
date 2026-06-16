"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleIcon, InstagramIcon } from "@/components/auth/auth-social-icons"
import {
  authInputClassName,
  authPrimaryButtonClassName,
  authSegmentClassName,
  authSocialButtonClassName,
} from "@/components/auth/auth-styles"
import { PasswordField } from "@/components/auth/password-field"
import {
  clearOnboardingPending,
  initBrandSession,
  setUserRole,
} from "@/lib/onboarding/storage"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const [role, setRole] = useState<"creator" | "brand">("creator")
  const [email, setEmail] = useState("")
  const router = useRouter()

  function handleLogin(event: React.FormEvent) {
    event.preventDefault()

    if (role === "brand") {
      initBrandSession({ workEmail: email.trim() })
      router.push("/dashboard/brand")
      return
    }

    setUserRole("creator")
    clearOnboardingPending()
    router.push("/dashboard")
  }

  return (
    <AuthShell variant="login">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome backkk!
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Sign in to manage campaigns, track creator performance, and pay
            out winners.
          </p>
        </div>

        <div className={authSegmentClassName}>
          {(["creator", "brand"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex-1 rounded-full py-2.5 text-sm transition-all",
                role === r
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r === "creator" ? "Creator" : "Brand"}
            </button>
          ))}
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-medium text-foreground">
              {role === "brand" ? "Work email" : "Email"}
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`mt-2 ${authInputClassName}`}
            />
          </div>
          <PasswordField
            labelAction={
              <Link
                href="#"
                className="text-xs font-medium text-foreground hover:text-brand"
              >
                Forgot password?
              </Link>
            }
          />
          <button type="submit" className={authPrimaryButtonClassName}>
            Login
          </button>
        </form>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              aria-label="Continue with Google"
              className={authSocialButtonClassName}
            >
              <GoogleIcon />
            </button>
            <button
              type="button"
              aria-label="Continue with Instagram"
              className={authSocialButtonClassName}
            >
              <InstagramIcon />
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-foreground hover:text-brand"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
