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
      className="absolute top-[13px] right-[13px] z-30 grid size-[34px] place-items-center rounded-full border border-auth-border bg-auth-surface p-0 text-auth-ink shadow-[var(--auth-toggle-shadow)] transition hover:bg-auth-soft-surface [&_svg]:size-[17px]"
      type="button"
      onClick={onToggle}
      aria-label={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
      title={`Ativar modo ${isDark ? 'claro' : 'escuro'}`}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  )
}
