"use client"

import { useState } from "react"

import {
  onboardingCardClassName,
  onboardingPrimaryButtonClassName,
  OnboardingCardBack,
  OnboardingStepActions,
} from "@/components/onboarding/progress-header"
import { inputClassName } from "@/components/dashboard/forms/form-field"
import type { PaymentDetails, PaymentMethod } from "@/lib/onboarding/types"
import { validatePayment } from "@/lib/onboarding/validation"
import { cn } from "@/lib/utils"

type PaymentFormProps = {
  initial?: PaymentDetails | null
  onSubmit: (payment: PaymentDetails) => void
  onBack?: () => void
  embedded?: boolean
  submitLabel?: string
  notice?: React.ReactNode
}

const emptyUpi = { fullName: "", upiId: "" }
const emptyBank = { accountHolder: "", accountNumber: "", ifsc: "" }

export function PaymentForm({
  initial,
  onSubmit,
  onBack,
  embedded = false,
  submitLabel = "Continue",
  notice,
}: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>(initial?.method ?? "upi")
  const [upi, setUpi] = useState(initial?.upi ?? emptyUpi)
  const [bank, setBank] = useState(initial?.bank ?? emptyBank)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const payment: PaymentDetails = { method, upi, bank }
    const validationError = validatePayment(payment)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onSubmit(payment)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(embedded ? "space-y-5" : cn(onboardingCardClassName(), "space-y-5"))}
    >
      {!embedded ? (
        <>
          {onBack ? <OnboardingCardBack onClick={onBack} className="mb-4" /> : null}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Get paid
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              We&apos;ll use this when you win campaigns.
            </p>
          </div>
        </>
      ) : null}

      <div className="inline-flex w-full rounded-full border border-border bg-muted p-1 sm:w-auto">
        {(["upi", "bank"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMethod(tab)
              setError(null)
            }}
            className={cn(
              "flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition-all sm:flex-none",
              method === tab
                ? "bg-card text-foreground shadow-sm dark:ring-1 dark:ring-border/80"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "upi" ? "UPI" : "Bank Account"}
          </button>
        ))}
      </div>

      {method === "upi" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full Name">
            <input
              className={inputClassName}
              value={upi.fullName}
              onChange={(e) => setUpi({ ...upi, fullName: e.target.value })}
              placeholder="Saurav Kumar"
            />
          </Field>
          <Field label="UPI ID">
            <input
              className={inputClassName}
              value={upi.upiId}
              onChange={(e) => setUpi({ ...upi, upiId: e.target.value })}
              placeholder="name@upi"
            />
          </Field>
        </div>
      ) : (
        <div className="grid gap-4">
          <Field label="Account Holder">
            <input
              className={inputClassName}
              value={bank.accountHolder}
              onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
              placeholder="Saurav Kumar"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Account Number">
              <input
                className={inputClassName}
                value={bank.accountNumber}
                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                placeholder="123456789012"
              />
            </Field>
            <Field label="IFSC">
              <input
                className={inputClassName}
                value={bank.ifsc}
                onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })}
                placeholder="HDFC0001234"
              />
            </Field>
          </div>
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {embedded ? (
        <div className="relative inline-flex items-center">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {submitLabel}
          </button>
          {notice}
        </div>
      ) : (
        <OnboardingStepActions className="mt-2">
          <button type="submit" className={onboardingPrimaryButtonClassName()}>
            {submitLabel}
          </button>
        </OnboardingStepActions>
      )}
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
