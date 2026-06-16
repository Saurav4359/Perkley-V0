"use client"

import { BriefcaseBusinessIcon, TrophyIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import {
  authInputClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-styles"
import { PasswordField } from "@/components/auth/password-field"
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
  const router = useRouter()

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

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                if (role === "brand") {
                  initBrandSession(
                    {
                      name: brandName.trim(),
                      website: website.trim(),
                      workEmail: workEmail.trim(),
                    },
                    { fromSignup: true }
                  )
                  router.push("/dashboard/brand/profile")
                  return
                }
                initCreatorSession()
                router.push("/onboarding")
              }}
            >
              {role === "creator" ? (
                <>
                  <Field label="Full name" type="text" placeholder="Saurav Kumar" />
                  <Field label="Email" type="email" placeholder="you@example.com" />
                  <Field
                    label="Instagram handle"
                    type="text"
                    placeholder="@yourhandle"
                  />
                  <PasswordField autoComplete="new-password" />
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
                  <PasswordField autoComplete="new-password" />
                </>
              )}
              <button type="submit" className={authPrimaryButtonClassName}>
                Create account
              </button>
            </form>
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
