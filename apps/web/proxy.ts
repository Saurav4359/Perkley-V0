import type { NextRequest } from "next/server"

import { updateSupabaseSession } from "@/lib/supabase/proxy"

/**
 * Next.js 16 Proxy (the renamed Middleware). Runs before requests are handled
 * and refreshes the Supabase session cookie so it never goes stale.
 */
export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request)
}

export const config = {
  // Run on all routes except static assets and image optimization. Excluding
  // these prevents auth/cookie logic from blocking CSS, JS, and images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
