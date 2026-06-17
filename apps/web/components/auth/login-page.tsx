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
import { ApiError } from "@/lib/api/client"
import { oauthStartUrl } from "@/lib/api/auth"
import { signInWithGoogle } from "@/lib/supabase/oauth"
import { useSignin } from "@/hooks/use-auth"
import {
  clearOnboardingPending,
  initBrandSession,
} from "@/lib/onboarding/storage"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const [role, setRole] = useState<"creator" | "brand">("creator")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const signin = useSignin()
  const submitting = signin.isPending

  async function handleGoogle() {
    if (googleLoading) return
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle(role)
    } catch {
      setError("Unable to start Google sign-in. Please try again.")
      setGoogleLoading(false)
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return

    setError(null)

    try {
      const user = await signin.mutateAsync({
        email: email.trim(),
        password,
      })

      if (user.role === "brand") {
        initBrandSession({ workEmail: user.email ?? email.trim() })
        router.push("/dashboard/brand")
        return
      }

      clearOnboardingPending()
      router.push("/dashboard")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Please try again."
      )
    }
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
            value={password}
            onChange={setPassword}
            required
            labelAction={
              <Link
                href="#"
                className="text-xs font-medium text-foreground hover:text-brand"
              >
                Forgot password?
              </Link>
            }
          />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              authPrimaryButtonClassName,
              submitting && "cursor-not-allowed opacity-70"
            )}
          >
            {submitting ? "Signing in…" : "Login"}
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
              onClick={handleGoogle}
              disabled={googleLoading}
              aria-label="Continue with Google"
              className={cn(
                authSocialButtonClassName,
                googleLoading && "cursor-not-allowed opacity-70"
              )}
            >
              <GoogleIcon />
            </button>
            <a
              href={oauthStartUrl("instagram", role)}
              aria-label="Continue with Instagram"
              className={authSocialButtonClassName}
            >
              <InstagramIcon />
            </a>
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
