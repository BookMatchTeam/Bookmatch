import { useState, useEffect } from 'react'

export interface CurrentUser {
  name: string
  username: string
  email: string
  phone: string
  city: string
  neighborhood: string
  bio: string
  avatarUrl?: string
}

const DEFAULT_USER: CurrentUser = {
  name: 'Usuário Teste',
  username: '@usuario.teste',
  email: 'novoleitor@bookmatch.com',
  phone: '(91) 98765-4321',
  city: 'Belém',
  neighborhood: 'Nazaré',
  bio: 'Leitor iniciante no BookMatch. Pronto para descobrir novas leituras e participar da comunidade!',
}

export function getCurrentUser(): CurrentUser {
  const raw = localStorage.getItem('bm_user')
  if (!raw) return DEFAULT_USER
  try {
    const parsed = JSON.parse(raw)
    return {
      name: parsed.name || DEFAULT_USER.name,
      username: parsed.username || (parsed.email ? `@${parsed.email.split('@')[0]}` : DEFAULT_USER.username),
      email: parsed.email || DEFAULT_USER.email,
      phone: parsed.phone || DEFAULT_USER.phone,
      city: parsed.city || DEFAULT_USER.city,
      neighborhood: parsed.neighborhood || DEFAULT_USER.neighborhood,
      bio: parsed.bio || DEFAULT_USER.bio,
      avatarUrl: parsed.avatarUrl,
    }
  } catch {
    return DEFAULT_USER
  }
}

export function isNewUser(): boolean {
  // Se estiver explícito como veterano, retorna false; caso contrário, é conta nova/em construção
  return localStorage.getItem('bm_is_veteran_user') !== 'true'
}

export function setCurrentUser(user: Partial<CurrentUser>): CurrentUser {
  const current = getCurrentUser()
  const updated = { ...current, ...user }
  localStorage.setItem('bm_user', JSON.stringify(updated))
  window.dispatchEvent(new Event('bm_user_updated'))
  return updated
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(getCurrentUser())

  useEffect(() => {
    const handleUpdate = () => {
      setUser(getCurrentUser())
    }
    window.addEventListener('bm_user_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('bm_user_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'UT'

  const firstName = user.name.split(' ')[0] || 'Usuário'

  return { user, initials, firstName, update: setCurrentUser, isNew: isNewUser() }
}
