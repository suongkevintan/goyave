/**
 * Types domaine de Voyage — alignés sur le schéma Supabase de la note de cadrage.
 * Phase 1 : utilisés avec des données locales/mock. Phase 2 : générables depuis
 * Supabase (`supabase gen types typescript`).
 */

export type ParticipantStatus = 'confirmed' | 'uncertain' | 'withdrawn'
export type ActivityStatus = 'idea' | 'validated' | 'scheduled' | 'done'
export type ItineraryPeriod = 'morning' | 'afternoon' | 'evening'
export type AvailabilityPeriod = 'morning' | 'evening'
export type BudgetCategory =
  | 'transport'
  | 'accommodation'
  | 'rental'
  | 'activities'
  | 'food'
  | 'misc'
export type BudgetStatus = 'to_book' | 'booked' | 'paid'
export type DocumentCategory = 'bookings' | 'finance' | 'photos' | 'misc'

export interface Trip {
  id: string
  name: string
  destination: string | null
  description: string | null
  coverImageUrl: string | null
  startDate: string | null
  endDate: string | null
  shareToken: string
  createdAt: string
}

export interface Participant {
  id: string
  tripId: string
  name: string
  avatarUrl: string | null
  phone: string | null
  allergies: string | null
  notes: string | null
  status: ParticipantStatus
  createdAt: string
}

export interface Activity {
  id: string
  tripId: string
  title: string
  description: string | null
  location: string | null
  lat: number | null
  lng: number | null
  durationMin: number | null
  costPerPerson: number | null
  status: ActivityStatus
  proposedBy: string | null
  createdAt: string
}

export type VoteType = 'like' | 'love'

export interface ActivityVote {
  id: string
  activityId: string
  participantId: string
  type: VoteType
}

export interface ActivityComment {
  id: string
  activityId: string
  participantId: string | null
  content: string
  createdAt: string
}

export interface ItinerarySlot {
  id: string
  tripId: string
  activityId: string | null
  slotDate: string
  period: ItineraryPeriod
  orderIndex: number
}

export interface Availability {
  id: string
  tripId: string
  participantId: string
  availDate: string
  period: AvailabilityPeriod
  available: boolean
}

export interface BudgetItem {
  id: string
  tripId: string
  category: BudgetCategory
  description: string
  totalCost: number | null
  status: BudgetStatus
  linkUrl: string | null
  createdBy: string | null
  createdAt: string
}

export interface Beacon {
  id: string
  tripId: string
  participantId: string | null
  message: string
  emoji: string | null
  createdAt: string
}

export interface DocumentItem {
  id: string
  tripId: string
  category: DocumentCategory
  label: string
  url: string | null
  filePath: string | null
  uploadedBy: string | null
  createdAt: string
}
