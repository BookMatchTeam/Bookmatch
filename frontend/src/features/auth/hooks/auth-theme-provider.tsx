import { useEffect, useState, type ReactNode } from 'react'

import {
  AuthThemeContext,
  type AuthTheme,
} from '@/features/auth/hooks/auth-theme-context'

const storageKey = 'bookmatch-auth-theme'

function readStoredTheme(): AuthTheme {
  try {
    return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function AuthThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AuthTheme>(readStoredTheme)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // Theme still works when storage is unavailable.
    }
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <AuthThemeContext.Provider
      value={{ theme, isDark: theme === 'dark', toggleTheme }}
    >
      {children}
    </AuthThemeContext.Provider>
  )
}
