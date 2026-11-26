import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './app/router'
import Providers from './providers.js'
import { Toaster } from "sonner";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </Providers>
  </StrictMode>
)