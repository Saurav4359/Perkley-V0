import { createHmac, timingSafeEqual } from "node:crypto"

import { getEnv, isRazorpayConfigured } from "../../lib/env"
import { badRequest } from "../../lib/http-error"

export type EscrowOrderResult = {
  provider: "razorpay" | "dev"
  orderId: string
  amountInr: number
  currency: "INR"
  keyId?: string
}

export async function createEscrowOrder(input: {
  campaignId: string
  amountInr: number
}): Promise<EscrowOrderResult> {
  if (!isRazorpayConfigured()) {
    return {
      provider: "dev",
      orderId: `dev_escrow_${input.campaignId}`,
      amountInr: input.amountInr,
      currency: "INR",
    }
  }

  const env = getEnv()
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountInr * 100,
      currency: "INR",
      receipt: `escrow_${input.campaignId}`,
      notes: { campaignId: input.campaignId },
    }),
  })

  if (!response.ok) {
    throw badRequest("Unable to create Razorpay order.", "razorpay_order_failed")
  }

  const data = (await response.json()) as { id: string }

  return {
    provider: "razorpay",
    orderId: data.id,
    amountInr: input.amountInr,
    currency: "INR",
    keyId: env.RAZORPAY_KEY_ID,
  }
}

export function verifyEscrowPayment(input: {
  orderId: string
  paymentId: string
  signature?: string
}) {
  if (!isRazorpayConfigured()) {
    const env = getEnv()
    if (env.NODE_ENV !== "development" && env.NODE_ENV !== "test") {
      return { ok: false as const, reason: "gateway_not_configured" as const }
    }

    return {
      ok: true as const,
      paymentId: input.paymentId || `dev_payment_${Date.now()}`,
    }
  }

  if (!input.signature) {
    return { ok: false as const, reason: "missing_signature" as const }
  }

  const env = getEnv()
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex")

  const valid = timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature))
  if (!valid) {
    return { ok: false as const, reason: "invalid_signature" as const }
  }

  return { ok: true as const, paymentId: input.paymentId }
}

export function createPayoutReference(submissionId: string) {
  if (!isRazorpayConfigured()) {
    return `dev_payout_${submissionId}`
  }
  return `payout_${submissionId}`
}
