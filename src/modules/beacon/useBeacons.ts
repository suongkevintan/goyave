import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Beacon } from '@/types'

/**
 * Hook de données du module Balise — **branché sur Supabase** (module pilote phase 2).
 * Démontre lecture + écriture + realtime. Les autres modules suivront le même pattern.
 */

// Ligne renvoyée par PostgREST avec le nom de l'auteur embarqué.
interface BeaconRow {
  id: string
  trip_id: string
  participant_id: string | null
  message: string
  emoji: string | null
  created_at: string
  participant: { name: string } | null
}

export interface BeaconView extends Beacon {
  authorName: string
}

function toView(row: BeaconRow): BeaconView {
  return {
    id: row.id,
    tripId: row.trip_id,
    participantId: row.participant_id,
    message: row.message,
    emoji: row.emoji,
    createdAt: row.created_at,
    authorName: row.participant?.name ?? 'Inconnu',
  }
}

export function useBeacons(tripId: string) {
  const [beacons, setBeacons] = useState<BeaconView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ready = Boolean(supabase)

  const refetch = useCallback(async () => {
    if (!supabase || !tripId) return
    const { data, error } = await supabase
      .from('beacons')
      .select('*, participant:participants(name)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setBeacons((data as BeaconRow[]).map(toView))
  }, [tripId])

  // Chargement initial
  useEffect(() => {
    if (!supabase || !tripId) {
      setLoading(false)
      return
    }
    let active = true
    ;(async () => {
      setLoading(true)
      const { data: bs, error: be } = await supabase
        .from('beacons')
        .select('*, participant:participants(name)')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
      if (!active) return
      if (be) setError(be.message)
      else if (bs) setBeacons((bs as BeaconRow[]).map(toView))
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [tripId])

  // Realtime : toute insertion/suppression de balise du voyage rafraîchit la liste
  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client
      .channel(`beacons:${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'beacons', filter: `trip_id=eq.${tripId}` },
        () => {
          void refetch()
        },
      )
      .subscribe()
    return () => {
      void client.removeChannel(channel)
    }
  }, [tripId, refetch])

  const addBeacon = useCallback(
    async (participantId: string | null, message: string, emoji: string | null) => {
      if (!supabase || !tripId) return
      const { error } = await supabase
        .from('beacons')
        .insert({ trip_id: tripId, participant_id: participantId, message, emoji })
      if (error) setError(error.message)
      // pas de refetch manuel : le realtime s'en charge
    },
    [tripId],
  )

  return { ready, loading, error, beacons, addBeacon }
}
