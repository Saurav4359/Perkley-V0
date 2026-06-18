import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { applyAuthProxyRouting } from "@/lib/auth/proxy"
import { updateSupabaseSession } from "@/lib/supabase/proxy"

function shouldRefreshSupabaseSession(pathname: string) {
  return (
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/signup"
  )
}

/**
 * Next.js 16 Proxy — runs before matched page requests (not /api rewrites).
 * 1. Perkley session routing (instant redirect for auth)
 * 2. Supabase OAuth session refresh (auth pages only)
 */
export async function proxy(request: NextRequest) {
  const authRedirect = await applyAuthProxyRouting(request)
  if (authRedirect) {
    return authRedirect
  }

  if (shouldRefreshSupabaseSession(request.nextUrl.pathname)) {
    return updateSupabaseSession(request)
  }

  return NextResponse.next()
}

export const config = {
  // Skip /api/* — those rewrite straight to Render and must not run Supabase/auth proxy work.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
