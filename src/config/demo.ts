/**
 * Identifiants de démonstration (phase 2).
 * Correspondent au seed Supabase (`supabase/seed.sql`).
 */
export const DEMO_TRIP_ID = '11111111-1111-1111-1111-111111111111'

/** share_token du voyage de démo (cf. RLS scopée aux écritures). */
export const DEMO_SHARE_TOKEN = 'demo-share-token'

/**
 * share_token du voyage courant.
 * Phase 2 : lu depuis `?token=` dans l'URL si présent, sinon le voyage de démo.
 * (Fondation de l'« accès par lien » — le routing complet viendra plus tard.)
 * Envoyé à Supabase via le header `x-share-token` → la RLS autorise les écritures
 * uniquement sur le voyage correspondant.
 */
export function getShareToken(): string {
  if (typeof window !== 'undefined') {
    const t = new URLSearchParams(window.location.search).get('token')
    if (t) return t
  }
  return DEMO_SHARE_TOKEN
}
