import { createClient } from '@supabase/supabase-js'

function readEnv() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_KEY ||
    ''
  return { url: url.trim(), anonKey: anonKey.trim() }
}

let client

/**
 * Returns a Supabase browser client when URL and anon/publishable key are set; otherwise null.
 */
export function getSupabase() {
  const { url, anonKey } = readEnv()
  if (!url || !anonKey) return null
  if (!client) {
    client = createClient(url, anonKey)
  }
  return client
}

export function isSupabaseConfigured() {
  const { url, anonKey } = readEnv()
  return Boolean(url && anonKey)
}

/** Which env pieces are present (for UI hints; never returns secret values). */
export function getSupabaseEnvFlags() {
  const { url, anonKey } = readEnv()
  return {
    hasUrl: Boolean(url),
    hasKey: Boolean(anonKey),
    configured: Boolean(url && anonKey)
  }
}
