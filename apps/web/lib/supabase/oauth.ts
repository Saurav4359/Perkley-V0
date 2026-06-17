"use client"

import { createSupabaseBrowserClient } from "./client"

export type SignInRole = "creator" | "brand"

/**
 * Starts the Supabase Google OAuth flow from the browser. Supabase handles the
 * Google handshake and redirects back to `/auth/callback`, preserving the
 * selected role so the bridge can create the right kind of Perkley account.
 *
 * `redirectTo` is built from the current origin, so the same code works on
 * localhost and in production. The origin's `/auth/callback` path must be added
 * to the Supabase Dashboard → Authentication → URL Configuration redirect list.
 */
export async function signInWithGoogle(role: SignInRole): Promise<void> {
  const supabase = createSupabaseBrowserClient()
  const redirectTo = new URL("/auth/callback", window.location.origin)
  redirectTo.searchParams.set("role", role)

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectTo.toString() },
  })

  if (error) {
    throw error
  }
}
