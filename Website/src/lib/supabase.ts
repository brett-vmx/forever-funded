import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True only when both env vars are present. The marketing page must stand on
 * its own even if auth is mid-wire, so callers check this before invoking auth
 * and show a friendly "not configured yet" message instead of crashing.
 */
export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  // Surfaced in the console during dev; the UI degrades gracefully.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — auth disabled. Copy .env.example to .env.',
  )
}

/**
 * Supabase browser client. Uses the ANON key only (public, RLS-gated).
 * `detectSessionInUrl` lets /auth/callback pick up the magic-link session.
 */
export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
