import { apiFetch } from "@/lib/api/client"

export type EscrowStatus =
  | "pending"
  | "funded"
  | "partially_released"
  | "released"
  | "refunded"
  | "failed"

export type Escrow = {
  id: string
  campaignId: string
  amountInr: number
  releasedAmountInr: number
  remainingAmountInr: number
  status: EscrowStatus
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  fundedAt: string | null
  releasedAt: string | null
  refundedAt: string | null
  failureReason: string | null
  createdAt: string
}

export type EscrowOrder = {
  provider: "razorpay" | "dev"
  orderId: string
  amountInr: number
  currency: "INR"
  keyId?: string
}

export type PayoutStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "on_hold"

export type Payout = {
  id: string
  campaignId: string
  campaignTitle?: string
  submissionId: string
  amountInr: number
  status: PayoutStatus
  razorpayPayoutId: string | null
  failureReason: string | null
  paidAt: string | null
  createdAt: string
}

export type BrandEscrowHistory = Escrow & {
  campaignTitle: string
  recentPayouts: Payout[]
}

export async function fetchCampaignEscrow(
  campaignId: string
): Promise<Escrow | null> {
  const { escrow } = await apiFetch<{ escrow: Escrow | null }>(
    `/api/campaigns/${campaignId}/escrow`
  )
  return escrow
}

export async function fundCampaignEscrow(
  campaignId: string
): Promise<{ escrow: Escrow; order: EscrowOrder }> {
  return apiFetch<{ escrow: Escrow; order: EscrowOrder }>(
    `/api/campaigns/${campaignId}/escrow/fund`,
    { method: "POST" }
  )
}

export async function confirmCampaignEscrow(
  campaignId: string,
  input: { orderId: string; paymentId: string; signature?: string }
): Promise<Escrow> {
  const { escrow } = await apiFetch<{ escrow: Escrow }>(
    `/api/campaigns/${campaignId}/escrow/confirm`,
    { method: "POST", body: input }
  )
  return escrow
}

export async function refundCampaignEscrow(
  campaignId: string
): Promise<{ escrow: Escrow; refundedAmountInr: number }> {
  return apiFetch<{ escrow: Escrow; refundedAmountInr: number }>(
    `/api/campaigns/${campaignId}/escrow/refund`,
    { method: "POST" }
  )
}

export async function releaseCampaignPayments(
  campaignId: string,
  submissionIds?: string[]
): Promise<{ releasedAmountInr: number; payouts: Payout[] }> {
  return apiFetch<{ releasedAmountInr: number; payouts: Payout[] }>(
    `/api/campaigns/${campaignId}/payments/release`,
    { method: "POST", body: submissionIds ? { submissionIds } : {} }
  )
}

/**
 * Funds and confirms a campaign escrow in one step. Works end-to-end against
 * the dev payment provider (no Razorpay checkout). When a real Razorpay order
 * is returned, confirmation is skipped — the caller must complete checkout.
 */
export async function fundAndConfirmEscrow(
  campaignId: string
): Promise<{ escrow: Escrow; requiresCheckout: boolean; order: EscrowOrder }> {
  const { order } = await fundCampaignEscrow(campaignId)

  if (order.provider !== "dev") {
    const escrow = await fetchCampaignEscrow(campaignId)
    return { escrow: escrow!, requiresCheckout: true, order }
  }

  const escrow = await confirmCampaignEscrow(campaignId, {
    orderId: order.orderId,
    paymentId: `dev_payment_${Date.now()}`,
  })
  return { escrow, requiresCheckout: false, order }
}

export async function fetchCreatorPayments(options?: {
  limit?: number
  status?: PayoutStatus
}): Promise<Payout[]> {
  const params = new URLSearchParams()
  if (options?.limit) params.set("limit", String(options.limit))
  if (options?.status) params.set("status", options.status)
  const query = params.toString() ? `?${params.toString()}` : ""

  const { payments } = await apiFetch<{ payments: Payout[] }>(
    `/api/creator/payments${query}`
  )
  return payments
}

export async function fetchBrandPayments(options?: {
  limit?: number
}): Promise<BrandEscrowHistory[]> {
  const query = options?.limit ? `?limit=${options.limit}` : ""
  const { payments } = await apiFetch<{ payments: BrandEscrowHistory[] }>(
    `/api/brand/payments${query}`
  )
  return payments
}
