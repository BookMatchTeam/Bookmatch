function parseApiUrl(value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(
      'VITE_API_URL não foi definida. Configure a URL pública da API antes de iniciar o frontend.',
    )
  }

  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('VITE_API_URL deve ser uma URL absoluta válida.')
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('VITE_API_URL deve usar o protocolo HTTP ou HTTPS.')
  }

  if (url.username || url.password) {
    throw new Error('VITE_API_URL não deve conter credenciais.')
  }

  url.hash = ''
  url.search = ''
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`

  return url.toString()
}

export const env = Object.freeze({
  apiUrl: parseApiUrl(import.meta.env.VITE_API_URL),
})
