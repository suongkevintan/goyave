import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import Landing from './Landing'
import { TripProvider } from '@/lib/store'

// Pages de modules chargées à la demande (code-splitting → bundle initial allégé,
// la carte Leaflet n'est téléchargée qu'en visitant l'Itinéraire).
const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage'))
const CastingPage = lazy(() => import('@/modules/casting/CastingPage'))
const ActivitiesPage = lazy(() => import('@/modules/activities/ActivitiesPage'))
const ItineraryPage = lazy(() => import('@/modules/itinerary/ItineraryPage'))
const AvailabilityPage = lazy(() => import('@/modules/availability/AvailabilityPage'))
const BudgetPage = lazy(() => import('@/modules/budget/BudgetPage'))
const BeaconPage = lazy(() => import('@/modules/beacon/BeaconPage'))
const DocumentsPage = lazy(() => import('@/modules/documents/DocumentsPage'))

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    // Accès par lien : un voyage = un share_token dans l'URL.
    path: '/t/:token',
    element: (
      <TripProvider>
        <AppLayout />
      </TripProvider>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'casting', element: <CastingPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'itinerary', element: <ItineraryPage /> },
      { path: 'availability', element: <AvailabilityPage /> },
      { path: 'budget', element: <BudgetPage /> },
      { path: 'beacon', element: <BeaconPage /> },
      { path: 'documents', element: <DocumentsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
