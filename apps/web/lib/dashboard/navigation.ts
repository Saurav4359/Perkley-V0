export const CREATOR_NAV = [
  { label: "Listings", href: "/dashboard" },
  { label: "My Work", href: "/dashboard/work" },
  { label: "Earnings", href: "/dashboard/earnings" },
  { label: "Leaderboard", href: "/dashboard/leaderboard" },
  { label: "Discover", href: "/dashboard/discover" },
] as const

export const BRAND_NAV = [
  { label: "Listings", href: "/dashboard/brand" },
  { label: "My Brand", href: "/dashboard/brand/campaigns" },
  { label: "Analytics", href: "/dashboard/brand/analytics" },
] as const

export const ADMIN_NAV = [{ label: "Submissions", href: "/dashboard/admin" }] as const

export function getBrandNav(pathname: string) {
  return BRAND_NAV.map((item) => {
    let active = false

    if (item.href === "/dashboard/brand") {
      active =
        pathname === item.href || pathname.startsWith("/dashboard/brand/listings")
    } else if (item.href === "/dashboard/brand/campaigns") {
      active =
        pathname.startsWith("/dashboard/brand/campaigns") ||
        pathname.startsWith("/dashboard/brand/profile")
    } else if (item.href === "/dashboard/brand/analytics") {
      active = pathname.startsWith("/dashboard/brand/analytics")
    }

    return { ...item, active }
  })
}

export function getCreatorNav(pathname: string) {
  return CREATOR_NAV.map((item) => ({
    ...item,
    active:
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href),
  }))
}
