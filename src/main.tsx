import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Agentation } from 'agentation'
import './index.css'
import { router } from './app/routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    {/* Toolbar d'annotation visuelle — dev uniquement (équivalent Vite du NODE_ENV check) */}
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
