import type { PaymentDetails } from "@/lib/onboarding/types"

export function validateNiches(niches: string[]): string | null {
  if (niches.length === 0) {
    return "Select at least one niche."
  }
  return null
}

export function validateContentTypes(contentTypes: string[]): string | null {
  if (contentTypes.length === 0) {
    return "Select at least one content type."
  }
  return null
}

export function validatePayment(payment: PaymentDetails): string | null {
  if (payment.method === "upi") {
    if (!payment.upi.fullName.trim()) return "Enter your full name."
    if (!payment.upi.upiId.trim()) return "Enter your UPI ID."
    if (!payment.upi.upiId.includes("@")) return "Enter a valid UPI ID (e.g. name@upi)."
    return null
  }

  if (!payment.bank.accountHolder.trim()) return "Enter the account holder name."
  if (!payment.bank.accountNumber.trim()) return "Enter your account number."
  if (payment.bank.accountNumber.replace(/\D/g, "").length < 8) {
    return "Enter a valid account number."
  }
  if (!payment.bank.ifsc.trim()) return "Enter your IFSC code."
  if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(payment.bank.ifsc.trim())) {
    return "Enter a valid IFSC code."
  }
  return null
}
