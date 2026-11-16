import { Outlet } from 'react-router'

import { AuthThemeProvider } from '@/features/auth/hooks/auth-theme-provider'
import { useAuthTheme } from '@/features/auth/hooks/use-auth-theme'

export function AuthLayout() {
  return (
    <AuthThemeProvider>
      <AuthScreen />
    </AuthThemeProvider>
  )
}

function AuthScreen() {
  const { isDark } = useAuthTheme()

  return (
    <main
      className={`auth-screen ${isDark ? 'auth-dark' : 'auth-light'} min-h-svh bg-auth-page text-auth-ink [font-family:Arial,sans-serif]`}
    >
      <Outlet />
    </main>
  )
}
