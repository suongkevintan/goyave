import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getShareToken } from '@/config/demo'

/**
 * Client Supabase.
 *
 * Phase 1 : pas de backend → l'app tourne sur le store local (lib/store).
 * Phase 2 : dès que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis
 * (cf. .env.example), le client réel est instancié. Tant qu'ils sont absents,
 * `supabase` vaut `null` et l'app reste en mode local — aucun crash.
 *
 * Schéma SQL de référence : supabase/schema.sql
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string, {
      // Envoyé sur chaque requête REST → lu par la RLS (current_share_token()).
      // Le realtime (lectures) n'en a pas besoin : les SELECT restent ouverts.
      global: { headers: { 'x-share-token': getShareToken() } },
    })
  : null
