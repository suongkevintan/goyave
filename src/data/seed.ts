import type {
  Activity,
  ActivityComment,
  ActivityVote,
  Availability,
  BudgetItem,
  Participant,
  Trip,
} from '@/types'
import { DEMO_TRIP_ID } from '@/config/demo'

/**
 * Données de démonstration.
 *
 * Les identifiants (trip + participants) sont alignés sur le seed Supabase
 * (`supabase/seed.sql`) → mêmes UUID. Ainsi les modules encore en local
 * (Activités, Budget, Dispo) résolvent correctement les noms des participants,
 * qu'ils viennent du store local (fallback) ou de Supabase.
 */

/** UUID fixes des participants (cf. supabase/seed.sql). */
export const PID = {
  kevin: '22222222-0000-0000-0000-000000000001',
  lea: '22222222-0000-0000-0000-000000000002',
  tom: '22222222-0000-0000-0000-000000000003',
  nina: '22222222-0000-0000-0000-000000000004',
} as const

export const seedTrip: Trip = {
  id: DEMO_TRIP_ID,
  name: 'Road trip en Écosse',
  destination: 'Highlands, Écosse',
  description: 'Une semaine entre lochs, châteaux et whisky.',
  coverImageUrl: null,
  startDate: '2026-07-18',
  endDate: '2026-07-25',
  shareToken: 'demo-share-token',
  createdAt: '2026-06-01T09:00:00.000Z',
}

/** Fallback participants utilisé uniquement si Supabase n'est pas configuré. */
export const seedParticipants: Participant[] = [
  { id: PID.kevin, tripId: DEMO_TRIP_ID, name: 'Kevin', avatarUrl: null, phone: '+33 6 12 34 56 78', allergies: null, notes: 'Organisateur', status: 'confirmed', createdAt: '2026-06-01T09:00:00.000Z' },
  { id: PID.lea, tripId: DEMO_TRIP_ID, name: 'Léa', avatarUrl: null, phone: null, allergies: 'Fruits à coque', notes: null, status: 'confirmed', createdAt: '2026-06-01T10:00:00.000Z' },
  { id: PID.tom, tripId: DEMO_TRIP_ID, name: 'Tom', avatarUrl: null, phone: null, allergies: null, notes: 'Conduit la voiture de location', status: 'uncertain', createdAt: '2026-06-02T08:30:00.000Z' },
  { id: PID.nina, tripId: DEMO_TRIP_ID, name: 'Nina', avatarUrl: null, phone: null, allergies: 'Lactose', notes: null, status: 'confirmed', createdAt: '2026-06-02T14:00:00.000Z' },
]

export const seedActivities: Activity[] = [
  {
    id: 'a-loch-ness',
    tripId: DEMO_TRIP_ID,
    title: 'Croisière sur le Loch Ness',
    description: 'Balade en bateau et chasse au monstre (optionnelle).',
    location: 'Loch Ness',
    lat: 57.3229,
    lng: -4.4244,
    durationMin: 120,
    costPerPerson: 25,
    status: 'validated',
    proposedBy: PID.lea,
    createdAt: '2026-06-03T11:00:00.000Z',
  },
  {
    id: 'a-edinburgh',
    tripId: DEMO_TRIP_ID,
    title: "Château d'Édimbourg",
    description: 'Visite du château et de la vieille ville.',
    location: 'Édimbourg',
    lat: 55.9486,
    lng: -3.1999,
    durationMin: 180,
    costPerPerson: 19,
    status: 'idea',
    proposedBy: PID.kevin,
    createdAt: '2026-06-03T12:30:00.000Z',
  },
  {
    id: 'a-glenfinnan',
    tripId: DEMO_TRIP_ID,
    title: 'Viaduc de Glenfinnan',
    description: 'Le viaduc du Poudlard Express. Prévoir les horaires du train à vapeur.',
    location: 'Glenfinnan',
    lat: 56.8721,
    lng: -5.4331,
    durationMin: 90,
    costPerPerson: 0,
    status: 'idea',
    proposedBy: PID.nina,
    createdAt: '2026-06-04T09:15:00.000Z',
  },
]

export const seedVotes: ActivityVote[] = [
  { id: 'v-1', activityId: 'a-loch-ness', participantId: PID.kevin, type: 'love' },
  { id: 'v-2', activityId: 'a-loch-ness', participantId: PID.nina, type: 'like' },
  { id: 'v-3', activityId: 'a-glenfinnan', participantId: PID.lea, type: 'love' },
]

export const seedComments: ActivityComment[] = [
  {
    id: 'c-1',
    activityId: 'a-loch-ness',
    participantId: PID.nina,
    content: 'Hâte ! On réserve tôt le matin pour éviter la foule ?',
    createdAt: '2026-06-03T15:00:00.000Z',
  },
]

export const seedBudgetItems: BudgetItem[] = [
  { id: 'b-flights', tripId: DEMO_TRIP_ID, category: 'transport', description: 'Vols A/R Paris → Édimbourg', totalCost: 720, status: 'booked', linkUrl: null, createdBy: PID.kevin, createdAt: '2026-06-02T09:00:00.000Z' },
  { id: 'b-cottage', tripId: DEMO_TRIP_ID, category: 'accommodation', description: 'Cottage 7 nuits (Highlands)', totalCost: 1400, status: 'to_book', linkUrl: null, createdBy: PID.lea, createdAt: '2026-06-03T09:00:00.000Z' },
  { id: 'b-car', tripId: DEMO_TRIP_ID, category: 'rental', description: 'Location voiture 7 jours', totalCost: 360, status: 'to_book', linkUrl: null, createdBy: PID.tom, createdAt: '2026-06-03T10:00:00.000Z' },
]

/** Fenêtre de dates explorée par le module Dispo (10 jours en juillet 2026). */
export const AVAILABILITY_WINDOW = { start: '2026-07-15', days: 10 }

export const seedAvailabilities: Availability[] = [
  { id: 'av-1', tripId: DEMO_TRIP_ID, participantId: PID.kevin, availDate: '2026-07-18', period: 'morning', available: true },
  { id: 'av-2', tripId: DEMO_TRIP_ID, participantId: PID.kevin, availDate: '2026-07-18', period: 'evening', available: true },
  { id: 'av-3', tripId: DEMO_TRIP_ID, participantId: PID.lea, availDate: '2026-07-18', period: 'morning', available: true },
  { id: 'av-4', tripId: DEMO_TRIP_ID, participantId: PID.nina, availDate: '2026-07-18', period: 'evening', available: true },
]
