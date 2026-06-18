/**
 * Safe internal redirect target from ?next= (blocks open redirects).
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null
  if (!next.startsWith("/") || next.startsWith("//")) return null
  if (next.startsWith("/login") || next.startsWith("/signup")) return null
  return next
}

export function dashboardPathForRole(
  role: "creator" | "brand" | "admin",
  next: string | null | undefined
): string {
  const safeNext = safeNextPath(next)
  if (safeNext) return safeNext

  if (role === "brand") return "/dashboard/brand"
  if (role === "admin") return "/dashboard/admin"
  return "/dashboard"
}
