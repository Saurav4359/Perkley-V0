import type { Niche } from "@/lib/dashboard/types"

const MIN_BIO_LENGTH = 20

export function validateBrandName(name: string): string | null {
  if (!name.trim()) return "Enter your brand or company name."
  return null
}

export function validateBrandBio(bio: string): string | null {
  const trimmed = bio.trim()
  if (trimmed.length < MIN_BIO_LENGTH) {
    return `Tell creators a bit more about your brand (at least ${MIN_BIO_LENGTH} characters).`
  }
  return null
}

export function validateBrandLocation(location: string): string | null {
  if (!location.trim()) return "Add your brand's primary location."
  return null
}

export function validateBrandIndustry(industry: Niche | ""): string | null {
  if (!industry) return "Select an industry."
  return null
}

export function validateWorkEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return "Enter your work email."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid work email address."
  }
  return null
}

export function validateBrandWebsite(website: string): string | null {
  const trimmed = website.trim()
  if (!trimmed) return "Add your company website."
  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    new URL(normalized)
    return null
  } catch {
    return "Enter a valid website URL."
  }
}

export function validateBrandSocial(social: {
  instagram?: string
  linkedin?: string
  twitter?: string
}): string | null {
  const hasLink = [social.instagram, social.linkedin, social.twitter].some(
    (value) => value?.trim()
  )
  if (!hasLink) return "Add at least one social profile so creators can learn about your brand."
  return null
}

export function validateBrandIdentity(
  name: string,
  bio: string,
  industry: Niche | "",
  location: string
): string | null {
  return (
    validateBrandName(name) ??
    validateBrandIndustry(industry) ??
    validateBrandLocation(location) ??
    validateBrandBio(bio)
  )
}

export function validateBrandVerification(
  workEmail: string,
  website: string,
  workEmailVerified: boolean
): string | null {
  const emailError = validateWorkEmail(workEmail)
  if (emailError) return emailError
  const websiteError = validateBrandWebsite(website)
  if (websiteError) return websiteError
  if (!workEmailVerified) return "Verify your work email to continue."
  return null
}
