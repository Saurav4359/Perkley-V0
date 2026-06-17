import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Supabase OAuth callback. Google redirects here (via Supabase) with a `?code`.
 * We exchange it for a Supabase session (cookies are set on this web origin),
 * then hand off to the client `/auth/complete` step which bridges the Supabase
 * identity into the app's `perkley_session` and routes the user by role.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const role = searchParams.get("role") === "brand" ? "brand" : "creator"

  // `next` must be an in-app relative path to avoid open redirects.
  const nextParam = searchParams.get("next")
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : ""

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_cancelled`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  const complete = new URL("/auth/complete", origin)
  complete.searchParams.set("role", role)
  if (next) complete.searchParams.set("next", next)

  return NextResponse.redirect(complete)
}
