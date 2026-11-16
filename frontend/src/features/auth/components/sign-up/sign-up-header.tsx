import { Link } from 'react-router'

import { paths } from '@/app/router/paths'

export function SignUpHeader() {
  return (
    <header className="mx-[-18px] flex h-[87px] items-center justify-between border-b border-auth-divider bg-auth-header px-5 py-2">
      <Link
        className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-focus"
        to={paths.signIn}
        aria-label="BookMatch — ir para o login"
      >
        <img
          className="h-16 w-[62px] object-contain"
          src="/brand/bookmatch-full-logo.svg"
          width="62"
          height="64"
          alt="BookMatch"
        />
      </Link>

      <span className="text-[11px] text-auth-muted">
        Já faz parte?{' '}
        <Link
          className="ml-2 inline-block rounded-md border border-auth-divider bg-auth-card p-2.5 text-auth-ink no-underline transition hover:border-auth-border-hover hover:bg-auth-soft-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-focus"
          to={paths.signIn}
        >
          Entrar
        </Link>
      </span>
    </header>
  )
}
