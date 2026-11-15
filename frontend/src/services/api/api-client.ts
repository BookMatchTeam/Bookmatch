import { env } from '@/config/env'
import {
  createInvalidResponseError,
  createRequestError,
  createResponseError,
} from '@/services/api/api-error'

const defaultTimeoutMs = 15_000

export type ApiRequestOptions = Omit<
  RequestInit,
  'body' | 'credentials'
> & {
  json?: unknown
  timeoutMs?: number
}

function buildApiUrl(path: string) {
  if (/^[a-z][a-z\d+.-]*:/i.test(path)) {
    throw new Error('O cliente da API aceita apenas caminhos relativos.')
  }

  return new URL(path.replace(/^\/+/, ''), env.apiUrl)
}

function createRequestSignal(
  externalSignal: AbortSignal | null | undefined,
  timeoutMs: number,
) {
  const controller = new AbortController()

  const abortFromExternalSignal = () => {
    controller.abort(externalSignal?.reason)
  }

  if (externalSignal?.aborted) {
    abortFromExternalSignal()
  } else {
    externalSignal?.addEventListener('abort', abortFromExternalSignal, {
      once: true,
    })
  }

  const timeoutId = window.setTimeout(() => {
    controller.abort(
      new DOMException('Tempo limite da solicitação excedido.', 'TimeoutError'),
    )
  }, timeoutMs)

  return {
    signal: controller.signal,
    cleanup() {
      window.clearTimeout(timeoutId)
      externalSignal?.removeEventListener('abort', abortFromExternalSignal)
    },
  }
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()

  if (!text) {
    return undefined
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return text
  }

  try {
    return JSON.parse(text) as unknown
  } catch (error) {
    throw createInvalidResponseError(response, error)
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const {
    headers: initialHeaders,
    json,
    signal: externalSignal,
    timeoutMs = defaultTimeoutMs,
    ...requestOptions
  } = options
  const headers = new Headers(initialHeaders)
  const method = (requestOptions.method ?? 'GET').toUpperCase()

  headers.set('accept', 'application/json')

  if (json !== undefined) {
    headers.set('content-type', 'application/json')
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('x-bookmatch-client', 'web')
  }

  const { signal, cleanup } = createRequestSignal(
    externalSignal,
    timeoutMs,
  )
  const url = buildApiUrl(path)

  try {
    const response = await fetch(url, {
      ...requestOptions,
      body: json === undefined ? undefined : JSON.stringify(json),
      cache: requestOptions.cache ?? 'no-store',
      credentials: 'include',
      headers,
      method,
      signal,
    })
    const payload = await parseResponse(response)

    if (!response.ok) {
      throw createResponseError(response, payload)
    }

    return payload as TResponse
  } catch (error) {
    throw createRequestError(error)
  } finally {
    cleanup()
  }
}

type ApiMethodOptions = Omit<ApiRequestOptions, 'json' | 'method'>

export const apiClient = {
  get<TResponse>(path: string, options?: ApiMethodOptions) {
    return apiRequest<TResponse>(path, { ...options, method: 'GET' })
  },
  post<TResponse>(path: string, json?: unknown, options?: ApiMethodOptions) {
    return apiRequest<TResponse>(path, { ...options, json, method: 'POST' })
  },
  put<TResponse>(path: string, json?: unknown, options?: ApiMethodOptions) {
    return apiRequest<TResponse>(path, { ...options, json, method: 'PUT' })
  },
  patch<TResponse>(path: string, json?: unknown, options?: ApiMethodOptions) {
    return apiRequest<TResponse>(path, { ...options, json, method: 'PATCH' })
  },
  delete<TResponse>(path: string, options?: ApiMethodOptions) {
    return apiRequest<TResponse>(path, { ...options, method: 'DELETE' })
  },
}
