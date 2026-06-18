import { NextResponse, type NextRequest } from "next/server"

import {
  getDashboardPathForRole,
  isAuthenticatedSession,
  readProxySession,
} from "@/lib/auth/session"

const GUEST_ONLY_PATHS = new Set(["/", "/login", "/signup"])

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/")
}

/**
 * Next.js 16 Proxy auth routing — runs before RSC render so logged-in users
 * never see the marketing page or a loading spinner.
 */
export async function applyAuthProxyRouting(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  const session = await readProxySession(request.cookies)
  const authenticated = isAuthenticatedSession(session)

  if (authenticated && GUEST_ONLY_PATHS.has(pathname)) {
    const destination = session.claims
      ? getDashboardPathForRole(session.claims.role)
      : "/dashboard"
    return NextResponse.redirect(new URL(destination, request.url))
  }

  if (!authenticated && isDashboardPath(pathname)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return null
}
