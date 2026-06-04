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
 *  - **Casting** (participants), **Activités** (+ votes + commentaires), **trip**
 *    et **identité courante** sont branchés sur Supabase (lecture + écriture +
 *    realtime), avec fallback local si Supabase n'est pas configuré.
 *  - **Budget** et **Dispo** restent locaux pour l'instant et référencent les UUID
 *    Supabase (cf. data/seed.ts) — migration à suivre.
 *
 * Toute l'UI passe par `useTrip()` : la signature ne change pas quand un module
 * bascule du local vers Supabase.
 */

const usingSupabase = Boolean(supabase)

// Partie encore locale (persistée dans localStorage).
interface LocalState {
  budgetItems: BudgetItem[]
  availabilities: Availability[]
}

const STORAGE_KEY = 'voyage:state:v3'
const IDENTITY_KEY = 'voyage:identity'

const id = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

function initialLocal(): LocalState {
  return { budgetItems: seedBudgetItems, availabilities: seedAvailabilities }
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

// ── Mapping lignes Supabase (snake_case) → modèle app (camelCase) ─────────────
type ParticipantRow = {
  id: string; trip_id: string; name: string; avatar_url: string | null
  phone: string | null; allergies: string | null; notes: string | null
  status: ParticipantStatus; created_at: string
}
function mapParticipant(r: ParticipantRow): Participant {
  return {
    id: r.id, tripId: r.trip_id, name: r.name, avatarUrl: r.avatar_url,
    phone: r.phone, allergies: r.allergies, notes: r.notes, status: r.status, createdAt: r.created_at,
  }
}

type ActivityRow = {
  id: string; trip_id: string; title: string; description: string | null
  location: string | null; lat: number | null; lng: number | null
  duration_min: number | null; cost_per_person: number | null
  status: ActivityStatus; proposed_by: string | null; created_at: string
}
function mapActivity(r: ActivityRow): Activity {
  return {
    id: r.id, tripId: r.trip_id, title: r.title, description: r.description,
    location: r.location, lat: r.lat, lng: r.lng, durationMin: r.duration_min,
    costPerPerson: r.cost_per_person, status: r.status, proposedBy: r.proposed_by, createdAt: r.created_at,
  }
}

type VoteRow = { id: string; activity_id: string; participant_id: string; type: VoteType }
function mapVote(r: VoteRow): ActivityVote {
  return { id: r.id, activityId: r.activity_id, participantId: r.participant_id, type: r.type }
}

type CommentRow = {
  id: string; activity_id: string; participant_id: string | null; content: string; created_at: string
}
function mapComment(r: CommentRow): ActivityComment {
  return {
    id: r.id, activityId: r.activity_id, participantId: r.participant_id,
    content: r.content, createdAt: r.created_at,
  }
}

interface TripActions {
  // Casting (Supabase)
  addParticipant: (p: Pick<Participant, 'name'> & Partial<Participant>) => void
  updateParticipant: (id: string, patch: Partial<Participant>) => void
  removeParticipant: (id: string) => void
  setCurrentParticipant: (id: string) => void
  // Activités (Supabase)
  addActivity: (a: Pick<Activity, 'title'> & Partial<Activity>) => void
  updateActivity: (id: string, patch: Partial<Activity>) => void
  removeActivity: (id: string) => void
  setActivityStatus: (id: string, status: ActivityStatus) => void
  // Votes & commentaires (Supabase)
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
  activities: Activity[]
  votes: ActivityVote[]
  comments: ActivityComment[]
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
  const [activities, setActivities] = useState<Activity[]>(usingSupabase ? [] : seedActivities)
  const [votes, setVotes] = useState<ActivityVote[]>(usingSupabase ? [] : seedVotes)
  const [comments, setComments] = useState<ActivityComment[]>(usingSupabase ? [] : seedComments)
  const [currentParticipantId, setCurrentId] = useState<string>(
    () => localStorage.getItem(IDENTITY_KEY) ?? '',
  )

  // Persistance de la partie locale + identité
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
    } catch {
      // ignore
    }
  }, [local])
  useEffect(() => {
    if (currentParticipantId) localStorage.setItem(IDENTITY_KEY, currentParticipantId)
  }, [currentParticipantId])

  // ── Rechargements Supabase ──────────────────────────────────────────────────
  const reloadParticipants = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('participants').select('*').eq('trip_id', DEMO_TRIP_ID).order('created_at')
    if (data) setParticipants((data as ParticipantRow[]).map(mapParticipant))
  }, [])

  const reloadActivities = useCallback(async () => {
    if (!supabase) return
    const { data: acts } = await supabase
      .from('activities').select('*').eq('trip_id', DEMO_TRIP_ID).order('created_at', { ascending: false })
    const list = (acts ?? []) as ActivityRow[]
    setActivities(list.map(mapActivity))
    const ids = list.map((a) => a.id)
    if (ids.length === 0) {
      setVotes([])
      setComments([])
      return
    }
    const [{ data: vts }, { data: cmts }] = await Promise.all([
      supabase.from('activity_votes').select('*').in('activity_id', ids),
      supabase.from('activity_comments').select('*').in('activity_id', ids).order('created_at'),
    ])
    if (vts) setVotes((vts as VoteRow[]).map(mapVote))
    if (cmts) setComments((cmts as CommentRow[]).map(mapComment))
  }, [])

  // Chargement initial (trip + participants + activités)
  useEffect(() => {
    if (!supabase) return
    let active = true
    ;(async () => {
      const { data: t } = await supabase!
        .from('trips').select('*').eq('id', DEMO_TRIP_ID).maybeSingle()
      if (active && t) {
        setTrip({
          id: t.id, name: t.name, destination: t.destination, description: t.description,
          coverImageUrl: t.cover_image_url, startDate: t.start_date, endDate: t.end_date,
          shareToken: t.share_token, createdAt: t.created_at,
        })
      }
      await Promise.all([reloadParticipants(), reloadActivities()])
    })()
    return () => {
      active = false
    }
  }, [reloadParticipants, reloadActivities])

  // Realtime : participants + activités/votes/commentaires
  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client
      .channel(`trip:${DEMO_TRIP_ID}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `trip_id=eq.${DEMO_TRIP_ID}` }, () => void reloadParticipants())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `trip_id=eq.${DEMO_TRIP_ID}` }, () => void reloadActivities())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_votes' }, () => void reloadActivities())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_comments' }, () => void reloadActivities())
      .subscribe()
    return () => {
      void client.removeChannel(channel)
    }
  }, [reloadParticipants, reloadActivities])

  // Identité par défaut / réajustement
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
          void supabase.from('participants').insert({
            trip_id: DEMO_TRIP_ID, name: p.name, avatar_url: p.avatarUrl ?? null,
            phone: p.phone ?? null, allergies: p.allergies ?? null, notes: p.notes ?? null,
            status: p.status ?? 'confirmed',
          }).then(() => reloadParticipants())
        } else {
          setParticipants((prev) => [
            ...prev,
            {
              id: id(), tripId: DEMO_TRIP_ID, name: p.name, avatarUrl: p.avatarUrl ?? null,
              phone: p.phone ?? null, allergies: p.allergies ?? null, notes: p.notes ?? null,
              status: p.status ?? 'confirmed', createdAt: new Date().toISOString(),
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

      // ── Activités (Supabase, fallback local) ──────────────────────────────
      addActivity: (a) => {
        if (supabase) {
          void supabase.from('activities').insert({
            trip_id: DEMO_TRIP_ID, title: a.title, description: a.description ?? null,
            location: a.location ?? null, lat: a.lat ?? null, lng: a.lng ?? null,
            duration_min: a.durationMin ?? null, cost_per_person: a.costPerPerson ?? null,
            status: a.status ?? 'idea', proposed_by: a.proposedBy ?? (currentParticipantId || null),
          }).then(() => reloadActivities())
        } else {
          setActivities((prev) => [
            {
              id: id(), tripId: DEMO_TRIP_ID, title: a.title, description: a.description ?? null,
              location: a.location ?? null, lat: a.lat ?? null, lng: a.lng ?? null,
              durationMin: a.durationMin ?? null, costPerPerson: a.costPerPerson ?? null,
              status: a.status ?? 'idea', proposedBy: a.proposedBy ?? currentParticipantId,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ])
        }
      },
      updateActivity: (aid, patch) => {
        if (supabase) {
          const row: Record<string, unknown> = {}
          if ('title' in patch) row.title = patch.title
          if ('description' in patch) row.description = patch.description
          if ('location' in patch) row.location = patch.location
          if ('lat' in patch) row.lat = patch.lat
          if ('lng' in patch) row.lng = patch.lng
          if ('durationMin' in patch) row.duration_min = patch.durationMin
          if ('costPerPerson' in patch) row.cost_per_person = patch.costPerPerson
          if ('status' in patch) row.status = patch.status
          void supabase.from('activities').update(row).eq('id', aid).then(() => reloadActivities())
        } else {
          setActivities((prev) => prev.map((a) => (a.id === aid ? { ...a, ...patch } : a)))
        }
      },
      removeActivity: (aid) => {
        if (supabase) {
          void supabase.from('activities').delete().eq('id', aid).then(() => reloadActivities())
        } else {
          setActivities((prev) => prev.filter((a) => a.id !== aid))
          setVotes((prev) => prev.filter((v) => v.activityId !== aid))
          setComments((prev) => prev.filter((c) => c.activityId !== aid))
        }
      },
      setActivityStatus: (aid, status) => {
        if (supabase) {
          void supabase.from('activities').update({ status }).eq('id', aid).then(() => reloadActivities())
        } else {
          setActivities((prev) => prev.map((a) => (a.id === aid ? { ...a, status } : a)))
        }
      },
      toggleVote: (activityId, type) => {
        const me = currentParticipantId
        const existing = votes.find((v) => v.activityId === activityId && v.participantId === me)
        if (supabase) {
          if (existing && existing.type === type) {
            void supabase.from('activity_votes').delete().eq('id', existing.id).then(() => reloadActivities())
          } else if (existing) {
            void supabase.from('activity_votes').update({ type }).eq('id', existing.id).then(() => reloadActivities())
          } else {
            void supabase.from('activity_votes').insert({ activity_id: activityId, participant_id: me, type }).then(() => reloadActivities())
          }
        } else {
          setVotes((prev) => {
            if (existing && existing.type === type) return prev.filter((v) => v !== existing)
            if (existing) return prev.map((v) => (v === existing ? { ...v, type } : v))
            return [...prev, { id: id(), activityId, participantId: me, type }]
          })
        }
      },
      addComment: (activityId, content) => {
        const me = currentParticipantId || null
        if (supabase) {
          void supabase.from('activity_comments').insert({ activity_id: activityId, participant_id: me, content }).then(() => reloadActivities())
        } else {
          setComments((prev) => [
            ...prev,
            { id: id(), activityId, participantId: me, content, createdAt: new Date().toISOString() },
          ])
        }
      },

      // ── Budget (local) ────────────────────────────────────────────────────
      addBudgetItem: (b) =>
        setLocal((s) => ({
          ...s,
          budgetItems: [
            ...s.budgetItems,
            {
              id: id(), tripId: DEMO_TRIP_ID, category: b.category ?? 'misc', description: b.description,
              totalCost: b.totalCost ?? null, status: b.status ?? 'to_book', linkUrl: b.linkUrl ?? null,
              createdBy: b.createdBy ?? currentParticipantId, createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateBudgetItem: (bid, patch) =>
        setLocal((s) => ({
          ...s,
          budgetItems: s.budgetItems.map((b) => (b.id === bid ? { ...b, ...patch } : b)),
        })),
      removeBudgetItem: (bid) =>
        setLocal((s) => ({ ...s, budgetItems: s.budgetItems.filter((b) => b.id !== bid) })),

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
  }, [currentParticipantId, votes, reloadParticipants, reloadActivities])

  const value = useMemo<TripContextValue>(
    () => ({
      ...local,
      trip,
      participants,
      activities,
      votes,
      comments,
      currentParticipantId,
      currentParticipant: participants.find((p) => p.id === currentParticipantId),
      actions,
    }),
    [local, trip, participants, activities, votes, comments, currentParticipantId, actions],
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
