import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { getSupabaseConfig } from "./env"

/**
 * Server-side Supabase client for Server Components, Route Handlers, and Server
 * Actions. Reads/writes the Supabase session via Next.js cookies. `cookies()` is
 * async in Next.js 16, so this helper is async too.
 *
 * The `setAll` try/catch is required: cookies can only be written from a Route
 * Handler or Server Action. When called from a Server Component the write is a
 * no-op (the session is refreshed by `proxy.ts` instead).
 */
export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseConfig()
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
    },
  })
}
