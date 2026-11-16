import type { ReactNode } from 'react'

import { AuthThemeToggle } from '@/features/auth/components/auth-theme-toggle'

const panelVariants = {
  soft: 'pt-[57px] shadow-[var(--auth-panel-shadow-soft)]',
  strong: 'pt-[54px] shadow-[var(--auth-panel-shadow-strong)]',
} as const

export function AuthCardShell({
  children,
  variant = 'soft',
}: {
  children: ReactNode
  variant?: keyof typeof panelVariants
}) {
  return (
    <div className="mx-auto w-full max-w-[375px] px-4 pt-[97px] pb-16 sm:px-6">
      <section
        className={`relative mx-auto min-h-[724px] w-full max-w-[327px] rounded-[36px] bg-auth-card px-[27px] pb-10 text-auth-ink ${panelVariants[variant]}`}
      >
        <img
          className="pointer-events-none absolute -top-[88px] left-1/2 z-20 h-[119px] w-[146px] -translate-x-1/2 select-none"
          src="/brand/bookmatch-full-logo.svg"
          width="146"
          height="119"
          alt="BookMatch"
        />
        <img
          className="pointer-events-none absolute -top-[31px] right-6 z-20 h-[45px] w-[66px] select-none"
          src="/brand/bookmatch-login-top.svg"
          width="66"
          height="45"
          alt=""
          aria-hidden="true"
        />

        <AuthThemeToggle />
        {children}

        <img
          className="pointer-events-none absolute -bottom-[9px] left-[35px] z-20 h-10 w-[65px] select-none"
          src="/brand/bookmatch-login-bottom.svg"
          width="65"
          height="40"
          alt=""
          aria-hidden="true"
        />
      </section>
    </div>
  )
}
