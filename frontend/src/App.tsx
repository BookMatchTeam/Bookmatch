import { ConnectivityBanner } from '@/app/pwa/connectivity-banner'
import { PwaUpdatePrompt } from '@/app/pwa/pwa-update-prompt'

function App() {
  return (
    <>
      <ConnectivityBanner />
      <main />
      <PwaUpdatePrompt />
    </>
  )
}

export default App
