import {
  createContext,
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
  Participant,
  ParticipantStatus,
  Trip,
  VoteType,
} from '@/types'
import {
  seedActivities,
  seedComments,
  seedParticipants,
  seedTrip,
  seedVotes,
} from '@/data/seed'

/**
 * Store local de Voyage (phase 1).
 *
 * État unique persisté dans localStorage. Toute l'UI lit/écrit via le hook
 * `useTrip()`. En phase 2, on remplacera l'implémentation par des appels
 * Supabase + realtime, sans changer la signature exposée à l'UI.
 */

interface TripState {
  trip: Trip
  participants: Participant[]
  activities: Activity[]
  votes: ActivityVote[]
  comments: ActivityComment[]
  /** identité légère du visiteur courant (phase 1 : choisie localement) */
  currentParticipantId: string
}

const STORAGE_KEY = 'voyage:state:v1'

const id = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

function initialState(): TripState {
  return {
    trip: seedTrip,
    participants: seedParticipants,
    activities: seedActivities,
    votes: seedVotes,
    comments: seedComments,
    currentParticipantId: seedParticipants[0].id,
  }
}

function loadState(): TripState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState(), ...(JSON.parse(raw) as TripState) }
  } catch {
    // localStorage indisponible ou JSON corrompu → on repart du seed
  }
  return initialState()
}

interface TripActions {
  // Casting
  addParticipant: (p: Pick<Participant, 'name'> & Partial<Participant>) => void
  updateParticipant: (id: string, patch: Partial<Participant>) => void
  removeParticipant: (id: string) => void
  setCurrentParticipant: (id: string) => void
  // Activités
  addActivity: (a: Pick<Activity, 'title'> & Partial<Activity>) => void
  updateActivity: (id: string, patch: Partial<Activity>) => void
  removeActivity: (id: string) => void
  setActivityStatus: (id: string, status: ActivityStatus) => void
  // Votes & commentaires
  toggleVote: (activityId: string, type: VoteType) => void
  addComment: (activityId: string, content: string) => void
}

type TripContextValue = TripState & {
  currentParticipant: Participant | undefined
  actions: TripActions
}

const TripContext = createContext<TripContextValue | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TripState>(loadState)

  // Persistance à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // quota plein / mode privé : on ignore silencieusement
    }
  }, [state])

  const actions = useMemo<TripActions>(() => {
    return {
      addParticipant: (p) =>
        setState((s) => ({
          ...s,
          participants: [
            ...s.participants,
            {
              id: id(),
              tripId: s.trip.id,
              name: p.name,
              avatarUrl: p.avatarUrl ?? null,
              phone: p.phone ?? null,
              allergies: p.allergies ?? null,
              notes: p.notes ?? null,
              status: p.status ?? 'confirmed',
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateParticipant: (pid, patch) =>
        setState((s) => ({
          ...s,
          participants: s.participants.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
        })),

      removeParticipant: (pid) =>
        setState((s) => ({
          ...s,
          participants: s.participants.filter((p) => p.id !== pid),
          currentParticipantId:
            s.currentParticipantId === pid
              ? (s.participants.find((p) => p.id !== pid)?.id ?? '')
              : s.currentParticipantId,
        })),

      setCurrentParticipant: (pid) =>
        setState((s) => ({ ...s, currentParticipantId: pid })),

      addActivity: (a) =>
        setState((s) => ({
          ...s,
          activities: [
            {
              id: id(),
              tripId: s.trip.id,
              title: a.title,
              description: a.description ?? null,
              location: a.location ?? null,
              lat: a.lat ?? null,
              lng: a.lng ?? null,
              durationMin: a.durationMin ?? null,
              costPerPerson: a.costPerPerson ?? null,
              status: a.status ?? 'idea',
              proposedBy: a.proposedBy ?? s.currentParticipantId,
              createdAt: new Date().toISOString(),
            },
            ...s.activities,
          ],
        })),

      updateActivity: (aid, patch) =>
        setState((s) => ({
          ...s,
          activities: s.activities.map((a) => (a.id === aid ? { ...a, ...patch } : a)),
        })),

      removeActivity: (aid) =>
        setState((s) => ({
          ...s,
          activities: s.activities.filter((a) => a.id !== aid),
          votes: s.votes.filter((v) => v.activityId !== aid),
          comments: s.comments.filter((c) => c.activityId !== aid),
        })),

      setActivityStatus: (aid, status) =>
        setState((s) => ({
          ...s,
          activities: s.activities.map((a) => (a.id === aid ? { ...a, status } : a)),
        })),

      toggleVote: (activityId, type) =>
        setState((s) => {
          const me = s.currentParticipantId
          const existing = s.votes.find(
            (v) => v.activityId === activityId && v.participantId === me,
          )
          // Re-cliquer le même type retire le vote ; un autre type le change.
          if (existing && existing.type === type) {
            return { ...s, votes: s.votes.filter((v) => v !== existing) }
          }
          if (existing) {
            return {
              ...s,
              votes: s.votes.map((v) => (v === existing ? { ...v, type } : v)),
            }
          }
          return {
            ...s,
            votes: [...s.votes, { id: id(), activityId, participantId: me, type }],
          }
        }),

      addComment: (activityId, content) =>
        setState((s) => ({
          ...s,
          comments: [
            ...s.comments,
            {
              id: id(),
              activityId,
              participantId: s.currentParticipantId || null,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
    }
  }, [])

  const value = useMemo<TripContextValue>(
    () => ({
      ...state,
      currentParticipant: state.participants.find((p) => p.id === state.currentParticipantId),
      actions,
    }),
    [state, actions],
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
