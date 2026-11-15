export type ApiErrorKind =
  | 'bad-request'
  | 'cancelled'
  | 'conflict'
  | 'forbidden'
  | 'invalid-response'
  | 'network'
  | 'not-found'
  | 'rate-limit'
  | 'server'
  | 'timeout'
  | 'unauthorized'
  | 'unknown'
  | 'validation'

export type ApiFieldErrors = Record<string, string[]>

type ApiErrorOptions = {
  kind: ApiErrorKind
  message: string
  status?: number
  code?: string
  fieldErrors?: ApiFieldErrors
  requestId?: string
  details?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly code?: string
  readonly fieldErrors?: ApiFieldErrors
  readonly requestId?: string
  readonly details?: unknown

  constructor(options: ApiErrorOptions) {
    super(options.message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = options.kind
    this.status = options.status
    this.code = options.code
    this.fieldErrors = options.fieldErrors
    this.requestId = options.requestId
    this.details = options.details
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toStringArray(value: unknown): string[] | undefined {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    const messages = value.filter(
      (item): item is string => typeof item === 'string',
    )

    return messages.length ? messages : undefined
  }

  return undefined
}

function getFieldErrors(payload: unknown): ApiFieldErrors | undefined {
  if (!isRecord(payload)) {
    return undefined
  }

  const source = isRecord(payload.fieldErrors)
    ? payload.fieldErrors
    : isRecord(payload.errors)
      ? payload.errors
      : undefined

  if (!source) {
    return undefined
  }

  const entries = Object.entries(source).flatMap(([field, value]) => {
    const messages = toStringArray(value)
    return messages ? [[field, messages] as const] : []
  })

  return entries.length ? Object.fromEntries(entries) : undefined
}

function getPayloadValue(payload: unknown, key: string) {
  return isRecord(payload) ? payload[key] : undefined
}

function getMessage(payload: unknown, fallback: string) {
  const messages = toStringArray(getPayloadValue(payload, 'message'))
  return messages?.join(' ') ?? fallback
}

function getKind(status: number): ApiErrorKind {
  if (status === 400) return 'bad-request'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not-found'
  if (status === 409) return 'conflict'
  if (status === 422) return 'validation'
  if (status === 429) return 'rate-limit'
  if (status >= 500) return 'server'
  return 'unknown'
}

function getFallbackMessage(status: number) {
  if (status === 401) return 'Sua sessão expirou ou não é válida.'
  if (status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (status === 404) return 'O recurso solicitado não foi encontrado.'
  if (status === 409) return 'A solicitação conflita com o estado atual.'
  if (status === 422) return 'Revise os dados informados.'
  if (status === 429) return 'Muitas tentativas. Aguarde antes de tentar novamente.'
  if (status >= 500) return 'O servidor não conseguiu concluir a solicitação.'
  return 'Não foi possível concluir a solicitação.'
}

export function createResponseError(
  response: Response,
  payload: unknown,
): ApiError {
  const code = getPayloadValue(payload, 'code')
  const requestId =
    getPayloadValue(payload, 'requestId') ?? response.headers.get('x-request-id')

  return new ApiError({
    kind: getKind(response.status),
    message: getMessage(payload, getFallbackMessage(response.status)),
    status: response.status,
    code: typeof code === 'string' ? code : undefined,
    fieldErrors: getFieldErrors(payload),
    requestId: typeof requestId === 'string' ? requestId : undefined,
    details: payload,
  })
}

export function createRequestError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new ApiError({
      kind: 'timeout',
      message: 'A solicitação demorou mais do que o esperado.',
      cause: error,
    })
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError({
      kind: 'cancelled',
      message: 'A solicitação foi cancelada.',
      cause: error,
    })
  }

  return new ApiError({
    kind: 'network',
    message: 'Não foi possível conectar ao servidor.',
    cause: error,
  })
}

export function createInvalidResponseError(
  response: Response,
  cause: unknown,
): ApiError {
  return new ApiError({
    kind: 'invalid-response',
    message: 'O servidor retornou uma resposta inválida.',
    status: response.status,
    cause,
  })
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
