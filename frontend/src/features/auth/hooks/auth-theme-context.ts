import { createContext } from 'react'

export type AuthTheme = 'light' | 'dark'

export type AuthThemeContextValue = {
  theme: AuthTheme
  isDark: boolean
  toggleTheme: () => void
}

export const AuthThemeContext = createContext<AuthThemeContextValue | null>(
  null,
)
