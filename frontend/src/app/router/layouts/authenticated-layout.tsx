import { Link, NavLink, Outlet } from 'react-router'

import { paths } from '@/app/router/paths'
import { cn } from '@/lib/utils'

const navigationItems = [
  { label: 'Descobrir', to: paths.discovery },
  { label: 'Matches', to: paths.matches },
  { label: 'Mensagens', to: paths.messages },
  { label: 'Perfil', to: paths.profile },
]

export function AuthenticatedLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            className="inline-flex items-center gap-2 font-heading font-semibold"
            to={paths.discovery}
          >
            <img
              src="/icons/bookmatch-sidebar.svg"
              width="32"
              height="32"
              alt=""
            />
            BookMatch
          </Link>

          <nav
            className="flex gap-1 overflow-x-auto pb-1 sm:pb-0"
            aria-label="Navegação principal"
          >
            {navigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-muted text-foreground',
                  )
                }
                end
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl justify-center px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}
