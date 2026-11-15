import { Moon, Sun } from 'lucide-react'
import type { AuthTheme } from '@/features/auth/hooks/use-auth-theme'

export function AuthThemeToggle({
  theme,
  onToggle,
}: {
  theme: AuthTheme
  onToggle: () => void
}) {
  const isDark = theme === 'dark'

  return (
    <button
      className="auth-theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
      title={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  )
}
