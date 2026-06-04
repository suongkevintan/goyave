/**
 * Identifiants de démonstration (seed Supabase `supabase/seed.sql`).
 */
export const DEMO_TRIP_ID = '11111111-1111-1111-1111-111111111111'
export const DEMO_SHARE_TOKEN = 'demo-share-token'

/**
 * share_token du voyage courant, résolu depuis l'URL (accès par lien).
 * Ordre : chemin `/t/:token` → query `?token=` → voyage de démo.
 * Envoyé à Supabase via le header `x-share-token` (lu par la RLS).
 */
export function getShareToken(): string {
  if (typeof window !== 'undefined') {
    const m = window.location.pathname.match(/^\/t\/([^/]+)/)
    if (m) return decodeURIComponent(m[1])
    const q = new URLSearchParams(window.location.search).get('token')
    if (q) return q
  }
  return DEMO_SHARE_TOKEN
}

/** Construit le chemin d'un voyage. */
export const tripPath = (token: string, sub = '') =>
  `/t/${encodeURIComponent(token)}${sub ? `/${sub}` : ''}`
