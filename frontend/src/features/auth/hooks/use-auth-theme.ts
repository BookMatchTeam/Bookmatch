import { useEffect, useState } from 'react'

export type AuthTheme = 'light' | 'dark'

export function useAuthTheme() {
  const [theme, setTheme] = useState<AuthTheme>(() => {
    try {
      return localStorage.getItem('bookmatch-auth-theme') === 'dark'
        ? 'dark'
        : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('bookmatch-auth-theme', theme)
    } catch {
      // Theme still works for the current page when storage is unavailable.
    }
  }, [theme])

  return { theme, setTheme }
}
