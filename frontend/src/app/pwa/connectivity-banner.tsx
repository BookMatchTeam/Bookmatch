import { useSyncExternalStore } from 'react'

function subscribeToConnectivity(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)

  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getConnectivitySnapshot() {
  return navigator.onLine
}

function getServerConnectivitySnapshot() {
  return true
}

export function ConnectivityBanner() {
  const isOnline = useSyncExternalStore(
    subscribeToConnectivity,
    getConnectivitySnapshot,
    getServerConnectivitySnapshot,
  )

  if (isOnline) {
    return null
  }

  return (
    <aside
      className="sticky inset-x-0 top-0 z-50 bg-foreground px-4 py-2 text-center text-sm text-background"
      role="status"
      aria-live="polite"
    >
      Sem conexão. O BookMatch precisa de internet para carregar seus dados.
    </aside>
  )
}
