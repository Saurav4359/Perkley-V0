import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

import { getSupabaseConfig, isSupabaseConfigured } from "./env"

/**
 * Keeps the Supabase session fresh on every request, following the canonical
 * `@supabase/ssr` pattern adapted for Next.js 16's Proxy (formerly Middleware).
 *
 * It reads the request cookies, lets Supabase rotate the access/refresh tokens
 * if needed, and writes any updated cookies back onto the response so both the
 * browser and downstream Server Components see the latest session.
 *
 * Perkley dashboard auth is enforced in `proxy.ts` via the session cookie.
 * Supabase cookies are refreshed here for Google OAuth only.
 */
export async function updateSupabaseSession(
  request: NextRequest
): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  if (!isSupabaseConfigured()) {
    return response
  }

  const { url, key } = getSupabaseConfig()

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Touch the auth state so Supabase refreshes expiring tokens. Do not remove.
  await supabase.auth.getUser()

  return response
}
