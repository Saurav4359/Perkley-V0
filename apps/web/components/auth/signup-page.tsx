"use client"

import { BriefcaseBusinessIcon, TrophyIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleIcon } from "@/components/auth/auth-social-icons"
import {
  authInputClassName,
  authPrimaryButtonClassName,
  authSocialButtonClassName,
} from "@/components/auth/auth-styles"
import { PasswordField } from "@/components/auth/password-field"
import { ApiError } from "@/lib/api/client"
import { signInWithGoogle } from "@/lib/supabase/oauth"
import { useSignup } from "@/hooks/use-auth"
import {
  initBrandSession,
  initCreatorSession,
} from "@/lib/onboarding/storage"
import { cn } from "@/lib/utils"

const roleOptions = [
  {
    id: "creator" as const,
    icon: TrophyIcon,
    title: "I'm a Creator",
    desc: "Compete in brand campaigns",
  },
  {
    id: "brand" as const,
    icon: BriefcaseBusinessIcon,
    title: "I'm a Brand",
    desc: "Launch creator campaigns",
  },
]

export function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<"creator" | "brand" | null>(null)
  const [brandName, setBrandName] = useState("")
  const [workEmail, setWorkEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [fullName, setFullName] = useState("")
  const [creatorEmail, setCreatorEmail] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const signup = useSignup()
  const submitting = signup.isPending

  async function handleGoogle() {
    if (!role || googleLoading) return
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle(role)
    } catch {
      setError("Unable to start Google sign-in. Please try again.")
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!role || submitting) return

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setError(null)

    try {
      if (role === "brand") {
        await signup.mutateAsync({
          role: "brand",
          email: workEmail.trim(),
          password,
          brandName: brandName.trim(),
        })
        initBrandSession(
          {
            name: brandName.trim(),
            website: website.trim(),
            workEmail: workEmail.trim(),
          },
          { fromSignup: true }
        )
        router.push("/brand-onboarding")
        return
      }

      await signup.mutateAsync({
        role: "creator",
        email: creatorEmail.trim(),
        password,
        displayName: fullName.trim() || undefined,
      })
      initCreatorSession()
      router.push("/onboarding")
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to create your account. Please try again."
      )
    }
  }

  return (
    <AuthShell variant="signup" formClassName="max-w-lg">
      <div className="space-y-8">
        {step === 1 ? (
          <>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Create your account
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Choose how you want to use Perkley — compete as a creator or
                launch campaigns as a brand.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roleOptions.map((opt) => {
                const Icon = opt.icon
                const selected = role === opt.id

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={cn(
                      "rounded-[1.25rem] border-2 p-5 text-left transition-all",
                      selected
                        ? "border-brand bg-brand/10 dark:bg-brand/15"
                        : "border-border bg-card hover:border-foreground/20"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mb-3 h-6 w-6",
                        selected ? "text-brand" : "text-foreground"
                      )}
                      strokeWidth={1.75}
                    />
                    <div className="font-medium text-foreground">{opt.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {opt.desc}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              disabled={!role}
              onClick={() => setStep(2)}
              className={authPrimaryButtonClassName}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mb-4 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Your details
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Signing up as a {role === "creator" ? "Creator" : "Brand"}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {role === "creator" ? (
                <>
                  <Field
                    label="Full name"
                    type="text"
                    placeholder="Saurav Kumar"
                    value={fullName}
                    onChange={setFullName}
                  />
                  <Field
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={creatorEmail}
                    onChange={setCreatorEmail}
                    required
                  />
                  <Field
                    label="Instagram handle"
                    type="text"
                    placeholder="@yourhandle"
                    value={instagramHandle}
                    onChange={setInstagramHandle}
                  />
                  <PasswordField
                    autoComplete="new-password"
                    value={password}
                    onChange={setPassword}
                    required
                  />
                </>
              ) : (
                <>
                  <Field
                    label="Brand / Company name"
                    type="text"
                    placeholder="Acme Inc."
                    value={brandName}
                    onChange={setBrandName}
                    required
                  />
                  <Field
                    label="Work email"
                    type="email"
                    placeholder="hello@acme.com"
                    value={workEmail}
                    onChange={setWorkEmail}
                    required
                  />
                  <Field
                    label="Website"
                    type="url"
                    placeholder="https://acme.com"
                    value={website}
                    onChange={setWebsite}
                  />
                  <PasswordField
                    autoComplete="new-password"
                    value={password}
                    onChange={setPassword}
                    required
                  />
                </>
              )}
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
                {submitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  or continue with
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex justify-center">
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
              </div>
            </div>
          </>
        )}

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground hover:text-brand"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string
  type: string
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(event) => onChange?.(event.target.value)}
        className={`mt-2 ${authInputClassName}`}
      />
    </div>
  )
}
