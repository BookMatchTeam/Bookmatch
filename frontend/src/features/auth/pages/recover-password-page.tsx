import { useState, type FormEvent } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

import { paths } from '@/app/router/paths'
import { AuthThemeToggle } from '@/features/auth/components/auth-theme-toggle'
import { useAuthTheme } from '@/features/auth/hooks/use-auth-theme'

export function RecoverPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const { theme, setTheme } = useAuthTheme()
  const isDark = theme === 'dark'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) return

    setSubmitted(true)
  }

  return (
    <div className={`auth-screen ${isDark ? 'auth-dark' : 'auth-light'} relative min-h-svh overflow-hidden bg-auth-page text-auth-ink [font-family:Arial,sans-serif]`}>
      <div className="relative mx-auto min-h-[876px] w-full max-w-[375px] overflow-hidden px-4 pt-[97px] sm:px-6">
        <img
          className="pointer-events-none absolute top-[9px] left-1/2 z-20 h-[119px] w-[146px] -translate-x-1/2 select-none"
          src="/brand/bookmatch-full-logo.svg"
          width="146"
          height="119"
          alt="BookMatch"
        />
        <img
          className="pointer-events-none absolute top-[66px] right-[48px] z-20 h-[45px] w-[66px] select-none max-[350px]:right-7"
          src="/brand/bookmatch-login-top.svg"
          width="66"
          height="45"
          alt=""
          aria-hidden="true"
        />

        <section className="relative z-10 mx-auto min-h-[724px] w-full max-w-[327px] rounded-[36px] bg-auth-card px-[27px] pt-[54px] pb-10 text-auth-ink shadow-[var(--auth-panel-shadow-strong)]">
          <AuthThemeToggle theme={theme} onToggle={() => setTheme(isDark ? 'light' : 'dark')} />
          <p className="m-0 text-[12px] font-semibold text-auth-accent tracking-[0.04em] uppercase">
            Vamos recuperar seu acesso
          </p>
          <h1 className="mt-[18px] mb-0 text-[35px] leading-[1.13] font-semibold text-auth-ink tracking-[-1px]">
            Esqueceu sua
            <br />
            senha?
          </h1>
          <p className="mt-4 mb-0 text-[13px] leading-[1.65] text-auth-muted">
            Sem problemas! Informe o e-mail cadastrado e enviaremos as
            instruções para recuperar sua conta.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-auth-soft-surface p-3.5 text-[12px] leading-[1.5] text-auth-label">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-auth-card text-auth-accent shadow-sm">
              <KeyRound aria-hidden="true" className="size-5" />
            </span>
            <span>
              <strong className="mb-0.5 block text-[13px] text-auth-ink">
                Estamos aqui para ajudar!
              </strong>
              É rápido e seguro voltar à sua estante.
            </span>
          </div>

          <form className="mt-7" onSubmit={handleSubmit}>
            <label
              className="mb-2 block text-xs font-medium text-auth-label"
              htmlFor="recover-email"
            >
              Seu e-mail
            </label>
            <input
              className="h-14 w-full rounded-xl border border-auth-border bg-auth-surface px-[15px] text-base text-auth-ink outline-none transition placeholder:text-auth-subtle focus:border-auth-focus focus:ring-[3px] focus:ring-auth-focus-ring/12"
              id="recover-email"
              name="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              required
            />

            <button
              className="mt-5 h-[54px] w-full rounded-[10px] border-0 bg-auth-primary text-sm font-semibold text-white shadow-[var(--auth-button-shadow)] transition hover:bg-auth-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-auth-focus-outline active:translate-y-px"
              type="submit"
            >
              Enviar link de recuperação
            </button>
          </form>

          <div
            className="mt-4 flex gap-2.5 rounded-lg bg-auth-success-surface p-3 text-[11px] leading-[1.55] text-auth-success-ink"
            role={submitted ? 'status' : undefined}
            aria-live="polite"
          >
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-[18px] shrink-0"
            />
            <span>
              {submitted
                ? 'Se existir uma conta para esse endereço, você receberá um e-mail com os próximos passos.'
                : 'Por segurança, só quem tem acesso ao seu e-mail poderá redefinir sua senha.'}
            </span>
          </div>

          <div className="mt-7 border-t border-auth-divider pt-5 text-center">
            <Link
              className="text-xs font-semibold text-auth-link no-underline hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-focus"
              to={paths.signIn}
            >
              ← Voltar para o login
            </Link>
          </div>
        </section>

        <img
          className="pointer-events-none absolute top-[790px] left-[59px] z-20 h-10 w-[65px] select-none max-[350px]:left-10"
          src="/brand/bookmatch-login-bottom.svg"
          width="65"
          height="40"
          alt=""
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
