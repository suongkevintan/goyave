import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Agentation } from 'agentation'
import './index.css'
import { router } from './app/routes'
import { TripProvider } from './lib/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TripProvider>
      <RouterProvider router={router} />
    </TripProvider>
    {/* Toolbar d'annotation visuelle — dev uniquement (équivalent Vite du NODE_ENV check) */}
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
