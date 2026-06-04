import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import DashboardPage from '@/modules/dashboard/DashboardPage'
import CastingPage from '@/modules/casting/CastingPage'
import ActivitiesPage from '@/modules/activities/ActivitiesPage'
import ItineraryPage from '@/modules/itinerary/ItineraryPage'
import AvailabilityPage from '@/modules/availability/AvailabilityPage'
import BudgetPage from '@/modules/budget/BudgetPage'
import BeaconPage from '@/modules/beacon/BeaconPage'
import DocumentsPage from '@/modules/documents/DocumentsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
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
])
