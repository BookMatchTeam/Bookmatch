import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Users, UserCheck, Shuffle, MessageSquare, Sun, Moon, LogOut } from 'lucide-react'
import logo from '@/assets/logo.svg'
import { useTheme } from '@/hooks/useTheme'
import { useCurrentUser } from '@/hooks/useCurrentUser'


interface NavbarProps {
  onAddBookClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { theme, toggle } = useTheme()
  const { user, initials, firstName } = useCurrentUser()
  const location = useLocation()

  const navLinks = [
    { label: 'Matches', href: '/matches', icon: Shuffle },
    { label: 'Explorar', href: '/home', icon: BookOpen },
    { label: 'Minha biblioteca', href: '/biblioteca', icon: BookOpen },
    { label: 'Leitores', href: '/leitores', icon: UserCheck },
    { label: 'Grupos', href: '/grupos', icon: Users },
    { label: 'Mensagens', href: '/mensagens', icon: MessageSquare },
  ]


  const handleLogout = () => {
    localStorage.removeItem('bm_token')
    localStorage.removeItem('bm_user')
    localStorage.removeItem('bm_onboarding_completed')
    localStorage.removeItem('bm_account_setup_completed')
    localStorage.removeItem('bm_first_book_registered')
    localStorage.removeItem('bm_is_veteran_user')
    localStorage.removeItem('bm_match_prefs_configured')
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/20 bg-surface/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/matches" className="flex items-center gap-2">
          <img src={logo} alt="BookMatch" className="h-10 w-auto" />
        </Link>

        {/* Destinos */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-turquoise/15 font-semibold text-link dark:text-turquoise'
                    : 'text-fg-2 hover:bg-canvas hover:text-fg'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Perfil & Ações */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Alternar tema"
            className="grid size-9 place-items-center rounded-full bg-canvas text-fg transition hover:bg-turquoise/15"
          >
            {theme === 'dark' ? <Sun className="size-4 text-yellow" /> : <Moon className="size-4 text-navy" />}
          </button>

          {/* Avatar com Link para o Perfil */}
          <Link
            to="/perfil"
            className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition hover:bg-turquoise/10"
            title="Ver meu perfil"
          >
            <div className="grid size-9 place-items-center rounded-full bg-turquoise text-xs font-bold text-white shadow-sm ring-2 ring-turquoise/30 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="hidden text-sm font-semibold text-fg sm:inline-block">{firstName}</span>
          </Link>


          <button
            onClick={handleLogout}
            title="Sair"
            className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-error/10 hover:text-error"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
