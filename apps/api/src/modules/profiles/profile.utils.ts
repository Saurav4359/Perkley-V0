type CreatorCompletionInput = {
  displayName?: string | null
  instagramHandle?: string | null
  niches?: string[] | null
  contentTypes?: string[] | null
  location?: string | null
  payoutMethodCount?: number
  portfolioItemCount?: number
}

type BrandCompletionInput = {
  brandName?: string | null
  bio?: string | null
  industry?: string | null
  website?: string | null
  workEmail?: string | null
  logoUrl?: string | null
  socialLinks?: Record<string, unknown> | null
}

function hasText(value?: string | null) {
  return Boolean(value?.trim())
}

function score(completed: boolean[]) {
  const done = completed.filter(Boolean).length
  return Math.round((done / completed.length) * 100)
}

export function normalizeInstagramHandle(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return trimmed.replace(/^@+/, "").toLowerCase()
}

export function calculateCreatorProfileCompletion(input: CreatorCompletionInput) {
  return score([
    hasText(input.displayName),
    hasText(input.instagramHandle),
    Boolean(input.niches?.length),
    Boolean(input.contentTypes?.length),
    hasText(input.location),
    (input.payoutMethodCount ?? 0) > 0,
    (input.portfolioItemCount ?? 0) > 0,
  ])
}

export function calculateBrandProfileCompletion(input: BrandCompletionInput) {
  return score([
    hasText(input.brandName),
    hasText(input.bio),
    hasText(input.industry),
    hasText(input.website),
    hasText(input.workEmail),
    hasText(input.logoUrl),
    Boolean(input.socialLinks && Object.values(input.socialLinks).some((value) => hasText(String(value)))),
  ])
}

export function maskUpiId(value?: string | null) {
  if (!value) return null
  const [name, bank] = value.split("@")
  if (!name || !bank) return "****"
  const visible = name.slice(0, 2)
  return `${visible}${"*".repeat(Math.max(name.length - 2, 3))}@${bank}`
}

export function maskAccountNumber(last4?: string | null) {
  if (!last4) return null
  return `********${last4}`
}

export function accountLast4(accountNumber: string) {
  return accountNumber.slice(-4)
}
