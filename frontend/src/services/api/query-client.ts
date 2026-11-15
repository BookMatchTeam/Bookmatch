import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '@/services/api/api-error'

const defaultStaleTimeMs = 30_000
const maximumRetryCount = 1

function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= maximumRetryCount || !isApiError(error)) {
    return false
  }

  return ['network', 'server', 'timeout'].includes(error.kind)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'online',
      retry: shouldRetry,
      staleTime: defaultStaleTimeMs,
    },
    mutations: {
      networkMode: 'online',
      retry: false,
    },
  },
})
