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

const publishableKey =
  envStr(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) ||
  envStr(import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) ||
  envStr(import.meta.env.VITE_STRIPE_PUBLIC_KEY) ||
  envStr(import.meta.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) ||
  ''

export function getStripePublishableKey() {
  return publishableKey
}

export function isStripeConfigured() {
  return Boolean(publishableKey)
}
