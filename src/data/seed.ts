import type {
  Activity,
  ActivityComment,
  ActivityVote,
  Participant,
  Trip,
} from '@/types'

/**
 * Données de démonstration (phase 1).
 * Servent à amorcer le store local au premier lancement. En phase 2, elles
 * seront remplacées par les données réelles de Supabase.
 */

export const seedTrip: Trip = {
  id: 'trip-1',
  name: 'Road trip en Écosse',
  destination: 'Highlands, Écosse',
  description: 'Une semaine entre lochs, châteaux et whisky.',
  coverImageUrl: null,
  startDate: '2026-07-18',
  endDate: '2026-07-25',
  shareToken: 'demo-share-token',
  createdAt: '2026-06-01T09:00:00.000Z',
}

export const seedParticipants: Participant[] = [
  {
    id: 'p-kevin',
    tripId: 'trip-1',
    name: 'Kevin',
    avatarUrl: null,
    phone: '+33 6 12 34 56 78',
    allergies: null,
    notes: 'Organisateur',
    status: 'confirmed',
    createdAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'p-lea',
    tripId: 'trip-1',
    name: 'Léa',
    avatarUrl: null,
    phone: null,
    allergies: 'Fruits à coque',
    notes: null,
    status: 'confirmed',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'p-tom',
    tripId: 'trip-1',
    name: 'Tom',
    avatarUrl: null,
    phone: null,
    allergies: null,
    notes: 'Conduit la voiture de location',
    status: 'uncertain',
    createdAt: '2026-06-02T08:30:00.000Z',
  },
  {
    id: 'p-nina',
    tripId: 'trip-1',
    name: 'Nina',
    avatarUrl: null,
    phone: null,
    allergies: 'Lactose',
    notes: null,
    status: 'confirmed',
    createdAt: '2026-06-02T14:00:00.000Z',
  },
]

export const seedActivities: Activity[] = [
  {
    id: 'a-loch-ness',
    tripId: 'trip-1',
    title: 'Croisière sur le Loch Ness',
    description: 'Balade en bateau et chasse au monstre (optionnelle).',
    location: 'Loch Ness',
    lat: 57.3229,
    lng: -4.4244,
    durationMin: 120,
    costPerPerson: 25,
    status: 'validated',
    proposedBy: 'p-lea',
    createdAt: '2026-06-03T11:00:00.000Z',
  },
  {
    id: 'a-edinburgh',
    tripId: 'trip-1',
    title: "Château d'Édimbourg",
    description: 'Visite du château et de la vieille ville.',
    location: 'Édimbourg',
    lat: 55.9486,
    lng: -3.1999,
    durationMin: 180,
    costPerPerson: 19,
    status: 'idea',
    proposedBy: 'p-kevin',
    createdAt: '2026-06-03T12:30:00.000Z',
  },
  {
    id: 'a-glenfinnan',
    tripId: 'trip-1',
    title: 'Viaduc de Glenfinnan',
    description: 'Le viaduc du Poudlard Express. Prévoir les horaires du train à vapeur.',
    location: 'Glenfinnan',
    lat: 56.8721,
    lng: -5.4331,
    durationMin: 90,
    costPerPerson: 0,
    status: 'idea',
    proposedBy: 'p-nina',
    createdAt: '2026-06-04T09:15:00.000Z',
  },
]

export const seedVotes: ActivityVote[] = [
  { id: 'v-1', activityId: 'a-loch-ness', participantId: 'p-kevin', type: 'love' },
  { id: 'v-2', activityId: 'a-loch-ness', participantId: 'p-nina', type: 'like' },
  { id: 'v-3', activityId: 'a-glenfinnan', participantId: 'p-lea', type: 'love' },
]

export const seedComments: ActivityComment[] = [
  {
    id: 'c-1',
    activityId: 'a-loch-ness',
    participantId: 'p-nina',
    content: 'Hâte ! On réserve tôt le matin pour éviter la foule ?',
    createdAt: '2026-06-03T15:00:00.000Z',
  },
]
