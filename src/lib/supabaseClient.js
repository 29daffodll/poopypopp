import { createClient } from '@supabase/supabase-js'

/** Normalize Vite env strings (BOM, CRLF, accidental quotes). */
function envStr(value) {
  if (value === undefined || value === null) return ''
  let s = String(value).trim()
  if (s.startsWith('\ufeff')) s = s.slice(1).trim()
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '').trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }
  return s
}

function readEnv() {
  const url =
    envStr(import.meta.env.VITE_SUPABASE_URL) ||
    envStr(import.meta.env.NEXT_PUBLIC_SUPABASE_URL) ||
    ''
  const anonKey =
    envStr(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    envStr(import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    envStr(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    envStr(import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    envStr(import.meta.env.VITE_SUPABASE_KEY) ||
    envStr(import.meta.env.NEXT_PUBLIC_SUPABASE_KEY) ||
    ''
  return { url, anonKey }
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
