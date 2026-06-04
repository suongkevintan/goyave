import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Activity,
  ActivityComment,
  ActivityStatus,
  ActivityVote,
  Availability,
  AvailabilityPeriod,
  BudgetItem,
  Participant,
  ParticipantStatus,
  Trip,
  VoteType,
} from '@/types'
import {
  seedActivities,
  seedAvailabilities,
  seedBudgetItems,
  seedComments,
  seedParticipants,
  seedTrip,
  seedVotes,
} from '@/data/seed'
import { supabase } from '@/lib/supabase'
import { DEMO_TRIP_ID } from '@/config/demo'

/**
 * Store de Voyage.
 *
 * Migration progressive vers Supabase (phase 2) :
 *  - **Casting** (participants), **trip** et **identité courante** sont branchés
 *    sur Supabase (lecture + écriture + realtime), avec fallback local si
 *    Supabase n'est pas configuré.
 *  - Les autres modules (Activités, Budget, Dispo) restent en local pour l'instant
 *    et référencent les UUID Supabase (cf. data/seed.ts) — migration à suivre.
 *
 * Toute l'UI passe par `useTrip()` : la signature ne change pas quand un module
 * bascule du local vers Supabase.
 */

const usingSupabase = Boolean(supabase)

// Partie encore locale (persistée dans localStorage).
interface LocalState {
  activities: Activity[]
  votes: ActivityVote[]
  comments: ActivityComment[]
  budgetItems: BudgetItem[]
  availabilities: Availability[]
}

const STORAGE_KEY = 'voyage:state:v2'
const IDENTITY_KEY = 'voyage:identity'

const id = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

function initialLocal(): LocalState {
  return {
    activities: seedActivities,
    votes: seedVotes,
    comments: seedComments,
    budgetItems: seedBudgetItems,
    availabilities: seedAvailabilities,
  }
}

function loadLocal(): LocalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialLocal(), ...(JSON.parse(raw) as LocalState) }
  } catch {
    // localStorage indisponible ou JSON corrompu → on repart du seed
  }
  return initialLocal()
}

// Mapping lignes Supabase (snake_case) → modèle app (camelCase).
type ParticipantRow = {
  id: string
  trip_id: string
  name: string
  avatar_url: string | null
  phone: string | null
  allergies: string | null
  notes: string | null
  status: ParticipantStatus
  created_at: string
}
function mapParticipant(r: ParticipantRow): Participant {
  return {
    id: r.id,
    tripId: r.trip_id,
    name: r.name,
    avatarUrl: r.avatar_url,
    phone: r.phone,
    allergies: r.allergies,
    notes: r.notes,
    status: r.status,
    createdAt: r.created_at,
  }
}

interface TripActions {
  // Casting (Supabase)
  addParticipant: (p: Pick<Participant, 'name'> & Partial<Participant>) => void
  updateParticipant: (id: string, patch: Partial<Participant>) => void
  removeParticipant: (id: string) => void
  setCurrentParticipant: (id: string) => void
  // Activités (local)
  addActivity: (a: Pick<Activity, 'title'> & Partial<Activity>) => void
  updateActivity: (id: string, patch: Partial<Activity>) => void
  removeActivity: (id: string) => void
  setActivityStatus: (id: string, status: ActivityStatus) => void
  // Votes & commentaires (local)
  toggleVote: (activityId: string, type: VoteType) => void
  addComment: (activityId: string, content: string) => void
  // Budget (local)
  addBudgetItem: (b: Pick<BudgetItem, 'description'> & Partial<BudgetItem>) => void
  updateBudgetItem: (id: string, patch: Partial<BudgetItem>) => void
  removeBudgetItem: (id: string) => void
  // Disponibilités (local)
  toggleAvailability: (date: string, period: AvailabilityPeriod) => void
}

interface TripContextValue extends LocalState {
  trip: Trip
  participants: Participant[]
  currentParticipantId: string
  currentParticipant: Participant | undefined
  actions: TripActions
}

const TripContext = createContext<TripContextValue | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const [local, setLocal] = useState<LocalState>(loadLocal)
  const [trip, setTrip] = useState<Trip>(seedTrip)
  const [participants, setParticipants] = useState<Participant[]>(
    usingSupabase ? [] : seedParticipants,
  )
  const [currentParticipantId, setCurrentId] = useState<string>(
    () => localStorage.getItem(IDENTITY_KEY) ?? '',
  )

  // Persistance de la partie locale
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
    } catch {
      // quota plein / mode privé : on ignore
    }
  }, [local])

  // Persistance de l'identité
  useEffect(() => {
    if (currentParticipantId) localStorage.setItem(IDENTITY_KEY, currentParticipantId)
  }, [currentParticipantId])

  // Rechargement des participants depuis Supabase
  const reloadParticipants = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('trip_id', DEMO_TRIP_ID)
      .order('created_at')
    if (data) setParticipants((data as ParticipantRow[]).map(mapParticipant))
  }, [])

  // Chargement initial (trip + participants)
  useEffect(() => {
    if (!supabase) return
    let active = true
    ;(async () => {
      const { data: t } = await supabase!
        .from('trips')
        .select('*')
        .eq('id', DEMO_TRIP_ID)
        .maybeSingle()
      if (active && t) {
        setTrip({
          id: t.id,
          name: t.name,
          destination: t.destination,
          description: t.description,
          coverImageUrl: t.cover_image_url,
          startDate: t.start_date,
          endDate: t.end_date,
          shareToken: t.share_token,
          createdAt: t.created_at,
        })
      }
      await reloadParticipants()
    })()
    return () => {
      active = false
    }
  }, [reloadParticipants])

  // Realtime sur les participants (nécessite la table dans la publication realtime)
  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client
      .channel(`participants:${DEMO_TRIP_ID}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `trip_id=eq.${DEMO_TRIP_ID}` },
        () => {
          void reloadParticipants()
        },
      )
      .subscribe()
    return () => {
      void client.removeChannel(channel)
    }
  }, [reloadParticipants])

  // Identité par défaut / réajustement si le participant courant disparaît
  useEffect(() => {
    if (participants.length === 0) return
    if (!currentParticipantId || !participants.some((p) => p.id === currentParticipantId)) {
      setCurrentId(participants[0].id)
    }
  }, [participants, currentParticipantId])

  const actions = useMemo<TripActions>(() => {
    return {
      // ── Casting (Supabase, fallback local) ────────────────────────────────
      addParticipant: (p) => {
        if (supabase) {
          void supabase
            .from('participants')
            .insert({
              trip_id: DEMO_TRIP_ID,
              name: p.name,
              avatar_url: p.avatarUrl ?? null,
              phone: p.phone ?? null,
              allergies: p.allergies ?? null,
              notes: p.notes ?? null,
              status: p.status ?? 'confirmed',
            })
            .then(() => reloadParticipants())
        } else {
          setParticipants((prev) => [
            ...prev,
            {
              id: id(),
              tripId: DEMO_TRIP_ID,
              name: p.name,
              avatarUrl: p.avatarUrl ?? null,
              phone: p.phone ?? null,
              allergies: p.allergies ?? null,
              notes: p.notes ?? null,
              status: p.status ?? 'confirmed',
              createdAt: new Date().toISOString(),
            },
          ])
        }
      },

      updateParticipant: (pid, patch) => {
        if (supabase) {
          const row: Record<string, unknown> = {}
          if ('name' in patch) row.name = patch.name
          if ('phone' in patch) row.phone = patch.phone
          if ('allergies' in patch) row.allergies = patch.allergies
          if ('notes' in patch) row.notes = patch.notes
          if ('status' in patch) row.status = patch.status
          if ('avatarUrl' in patch) row.avatar_url = patch.avatarUrl
          void supabase.from('participants').update(row).eq('id', pid).then(() => reloadParticipants())
        } else {
          setParticipants((prev) => prev.map((p) => (p.id === pid ? { ...p, ...patch } : p)))
        }
      },

      removeParticipant: (pid) => {
        if (supabase) {
          void supabase.from('participants').delete().eq('id', pid).then(() => reloadParticipants())
        } else {
          setParticipants((prev) => prev.filter((p) => p.id !== pid))
        }
      },

      setCurrentParticipant: (pid) => setCurrentId(pid),

      // ── Activités (local) ─────────────────────────────────────────────────
      addActivity: (a) =>
        setLocal((s) => ({
          ...s,
          activities: [
            {
              id: id(),
              tripId: DEMO_TRIP_ID,
              title: a.title,
              description: a.description ?? null,
              location: a.location ?? null,
              lat: a.lat ?? null,
              lng: a.lng ?? null,
              durationMin: a.durationMin ?? null,
              costPerPerson: a.costPerPerson ?? null,
              status: a.status ?? 'idea',
              proposedBy: a.proposedBy ?? currentParticipantId,
              createdAt: new Date().toISOString(),
            },
            ...s.activities,
          ],
        })),

      updateActivity: (aid, patch) =>
        setLocal((s) => ({
          ...s,
          activities: s.activities.map((a) => (a.id === aid ? { ...a, ...patch } : a)),
        })),

      removeActivity: (aid) =>
        setLocal((s) => ({
          ...s,
          activities: s.activities.filter((a) => a.id !== aid),
          votes: s.votes.filter((v) => v.activityId !== aid),
          comments: s.comments.filter((c) => c.activityId !== aid),
        })),

      setActivityStatus: (aid, status) =>
        setLocal((s) => ({
          ...s,
          activities: s.activities.map((a) => (a.id === aid ? { ...a, status } : a)),
        })),

      toggleVote: (activityId, type) =>
        setLocal((s) => {
          const me = currentParticipantId
          const existing = s.votes.find((v) => v.activityId === activityId && v.participantId === me)
          if (existing && existing.type === type) {
            return { ...s, votes: s.votes.filter((v) => v !== existing) }
          }
          if (existing) {
            return { ...s, votes: s.votes.map((v) => (v === existing ? { ...v, type } : v)) }
          }
          return { ...s, votes: [...s.votes, { id: id(), activityId, participantId: me, type }] }
        }),

      addComment: (activityId, content) =>
        setLocal((s) => ({
          ...s,
          comments: [
            ...s.comments,
            {
              id: id(),
              activityId,
              participantId: currentParticipantId || null,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      // ── Budget (local) ────────────────────────────────────────────────────
      addBudgetItem: (b) =>
        setLocal((s) => ({
          ...s,
          budgetItems: [
            ...s.budgetItems,
            {
              id: id(),
              tripId: DEMO_TRIP_ID,
              category: b.category ?? 'misc',
              description: b.description,
              totalCost: b.totalCost ?? null,
              status: b.status ?? 'to_book',
              linkUrl: b.linkUrl ?? null,
              createdBy: b.createdBy ?? currentParticipantId,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateBudgetItem: (bid, patch) =>
        setLocal((s) => ({
          ...s,
          budgetItems: s.budgetItems.map((b) => (b.id === bid ? { ...b, ...patch } : b)),
        })),

      removeBudgetItem: (bid) =>
        setLocal((s) => ({
          ...s,
          budgetItems: s.budgetItems.filter((b) => b.id !== bid),
        })),

      // ── Disponibilités (local) ────────────────────────────────────────────
      toggleAvailability: (date, period) =>
        setLocal((s) => {
          const me = currentParticipantId
          const existing = s.availabilities.find(
            (a) => a.participantId === me && a.availDate === date && a.period === period,
          )
          if (existing) {
            return { ...s, availabilities: s.availabilities.filter((a) => a !== existing) }
          }
          return {
            ...s,
            availabilities: [
              ...s.availabilities,
              { id: id(), tripId: DEMO_TRIP_ID, participantId: me, availDate: date, period, available: true },
            ],
          }
        }),
    }
  }, [currentParticipantId, reloadParticipants])

  const value = useMemo<TripContextValue>(
    () => ({
      ...local,
      trip,
      participants,
      currentParticipantId,
      currentParticipant: participants.find((p) => p.id === currentParticipantId),
      actions,
    }),
    [local, trip, participants, currentParticipantId, actions],
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip doit être utilisé dans <TripProvider>')
  return ctx
}

// ── Sélecteurs utilitaires ──────────────────────────────────────────────────
export const PARTICIPANT_STATUS_LABEL: Record<ParticipantStatus, string> = {
  confirmed: 'Confirmé',
  uncertain: 'Incertain',
  withdrawn: 'Retiré',
}

export const ACTIVITY_STATUS_LABEL: Record<ActivityStatus, string> = {
  idea: '💡 Idée',
  validated: '✅ Validée',
  scheduled: '📅 Au programme',
  done: '✔️ Faite',
}

export const BUDGET_CATEGORY_LABEL: Record<BudgetItem['category'], string> = {
  transport: '✈️ Transport',
  accommodation: '🏠 Hébergement',
  rental: '🚗 Location',
  activities: '🎟️ Activités',
  food: '🍽️ Repas',
  misc: '📦 Divers',
}

export const BUDGET_STATUS_LABEL: Record<BudgetItem['status'], string> = {
  to_book: 'À réserver',
  booked: 'Réservé',
  paid: 'Payé',
}
