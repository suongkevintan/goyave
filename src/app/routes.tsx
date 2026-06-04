import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import Landing from './Landing'
import { TripProvider } from '@/lib/store'
import DashboardPage from '@/modules/dashboard/DashboardPage'
import CastingPage from '@/modules/casting/CastingPage'
import ActivitiesPage from '@/modules/activities/ActivitiesPage'
import ItineraryPage from '@/modules/itinerary/ItineraryPage'
import AvailabilityPage from '@/modules/availability/AvailabilityPage'
import BudgetPage from '@/modules/budget/BudgetPage'
import BeaconPage from '@/modules/beacon/BeaconPage'
import DocumentsPage from '@/modules/documents/DocumentsPage'

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
