/**
 * Public Supabase configuration shared by the browser and server clients.
 *
 * Both values are read from `NEXT_PUBLIC_*` environment variables so they are
 * inlined into the client bundle. The publishable (anon) key is safe to expose;
 * the service-role key must never live in the web app.
 *
 * - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL.
 * - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the publishable/anon API key.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export function getSupabaseConfig(): { url: string; key: string } {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    )
  }
  return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
}
