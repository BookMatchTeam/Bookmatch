import { Link, Outlet } from 'react-router'

import { paths } from '@/app/router/paths'

export function PublicLayout() {
  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link
            className="inline-flex items-center gap-2 font-heading font-semibold"
            to={paths.signIn}
          >
            <img
              src="/icons/bookmatch-sidebar.svg"
              width="32"
              height="32"
              alt=""
            />
            BookMatch
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl justify-center px-4 py-12 sm:px-6 sm:py-16">
        <Outlet />
      </main>
    </div>
  )
}
