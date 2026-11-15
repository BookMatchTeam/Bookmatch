import { useRegisterSW } from 'virtual:pwa-register/react'

import { Button } from '@/components/ui/button'

const updateIntervalMs = 60 * 60 * 1000
let updateIntervalId: number | undefined

function reportRegistrationError(error: unknown) {
  console.error('Não foi possível registrar o service worker.', error)
}

function schedulePeriodicUpdate(
  serviceWorkerUrl: string,
  registration: ServiceWorkerRegistration | undefined,
) {
  if (!registration) {
    return
  }

  if (updateIntervalId) {
    window.clearInterval(updateIntervalId)
  }

  updateIntervalId = window.setInterval(async () => {
    if (registration.installing || !navigator.onLine) {
      return
    }

    try {
      const response = await fetch(serviceWorkerUrl, {
        cache: 'no-store',
        headers: {
          'cache-control': 'no-cache',
        },
      })

      if (response.ok) {
        await registration.update()
      }
    } catch (error) {
      console.error('Não foi possível procurar atualizações do aplicativo.', error)
    }
  }, updateIntervalMs)
}

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: schedulePeriodicUpdate,
    onRegisterError: reportRegistrationError,
  })

  if (!needRefresh) {
    return null
  }

  return (
    <aside
      className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-xl border bg-card p-4 text-card-foreground shadow-lg"
      role="status"
      aria-live="polite"
    >
      <p className="font-medium">Uma nova versão do BookMatch está disponível.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Atualize quando puder interromper o que está fazendo.
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setNeedRefresh(false)}>
          Agora não
        </Button>
        <Button onClick={() => void updateServiceWorker(true)}>Atualizar</Button>
      </div>
    </aside>
  )
}
