import { RouterProvider } from 'react-router/dom'

import { ConnectivityBanner } from '@/app/pwa/connectivity-banner'
import { PwaUpdatePrompt } from '@/app/pwa/pwa-update-prompt'
import { AppProviders } from '@/app/providers/app-providers'
import { appRouter } from '@/app/router/app-router'

function App() {
  return (
    <AppProviders>
      <ConnectivityBanner />
      <RouterProvider router={appRouter} />
      <PwaUpdatePrompt />
    </AppProviders>
  )
}

export default App
