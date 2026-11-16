import { useContext } from 'react'

import { AuthThemeContext } from '@/features/auth/hooks/auth-theme-context'

export function useAuthTheme() {
  const context = useContext(AuthThemeContext)

  if (!context) {
    throw new Error('useAuthTheme must be used within an AuthThemeProvider')
  }

  return context
}
