import { supabase } from '@/lib/supabase'

export interface NewTripInput {
  name: string
  destination?: string | null
  startDate?: string | null
  endDate?: string | null
}

/**
 * Crée un voyage et renvoie son `share_token` (généré côté client pour pouvoir
 * y accéder immédiatement — la RLS scope la lecture de trips au token).
 * Renvoie null si Supabase n'est pas configuré ou en cas d'échec.
 */
export async function createTrip(input: NewTripInput): Promise<string | null> {
  if (!supabase) return null
  const shareToken = crypto.randomUUID()
  const { error } = await supabase.from('trips').insert({
    name: input.name,
    destination: input.destination ?? null,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    share_token: shareToken,
  })
  if (error) {
    console.error('createTrip error', error.message)
    return null
  }
  return shareToken
}
