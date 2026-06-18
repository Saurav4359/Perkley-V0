import type { NextRequest } from "next/server"

import { applyAuthProxyRouting } from "@/lib/auth/proxy"
import { updateSupabaseSession } from "@/lib/supabase/proxy"

/**
 * Next.js 16 Proxy — runs before every matched request.
 * 1. Perkley session routing (instant redirect for auth)
 * 2. Supabase OAuth session refresh
 */
export async function proxy(request: NextRequest) {
  const authRedirect = await applyAuthProxyRouting(request)
  if (authRedirect) {
    return authRedirect
  }

  return updateSupabaseSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
