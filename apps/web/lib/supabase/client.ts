"use client"

import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseConfig } from "./env"

/**
 * Browser-side Supabase client. Used in Client Components to start Google
 * Sign-In (`signInWithOAuth`) and read the current Supabase session. `@supabase/ssr`
 * persists the session in cookies so the server clients can read it too.
 */
export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseConfig()
  return createBrowserClient(url, key)
}
