import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { paths } from '@/app/router/paths'
import {
  AuthThemeToggle,
} from '@/features/auth/components/auth-theme-toggle'
import { useAuthTheme } from '@/features/auth/hooks/use-auth-theme'

export function SignInPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { theme, setTheme } = useAuthTheme()
  const isDark = theme === 'dark'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) return

    navigate(paths.discovery)
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

        <section className="relative z-10 mx-auto min-h-[724px] w-full max-w-[327px] rounded-[36px] bg-auth-card px-[27px] pt-[57px] pb-10 text-auth-ink shadow-[var(--auth-panel-shadow-soft)]">
          <AuthThemeToggle theme={theme} onToggle={() => setTheme(isDark ? 'light' : 'dark')} />
          <p className="m-0 whitespace-nowrap text-[14.5px] text-auth-ink tracking-[-0.25px] max-[350px]:text-[13px]">
            Olá, seja bem vindo ao{' '}
            <strong className="font-extrabold text-auth-brand-gold italic">
              Book<span className="text-auth-brand-match">Match</span>
            </strong>
          </p>

          <h1 className="mt-[22px] mb-0 text-[36px] leading-[1.23] font-semibold tracking-[-1.05px]">
            Vamos
            <br />
            Começar?
          </h1>

          <form className="mt-[27px]" onSubmit={handleSubmit}>
            <label
              className="block text-xs leading-[18px] font-medium text-auth-label"
              htmlFor="signin-identity"
            >
              Entre com seu nome de Usuário ou seu E-mail
            </label>
            <input
              className="mt-[13px] h-14 w-full rounded-xl border-[1.2px] border-auth-border bg-auth-surface px-[15px] text-base text-auth-ink outline-none transition placeholder:text-auth-subtle focus:border-auth-focus focus:ring-[3px] focus:ring-auth-focus-ring/12"
              id="signin-identity"
              name="identity"
              type="text"
              placeholder="Usuário ou E-mail"
              autoComplete="username"
              required
            />

            <label
              className="mt-[23px] block text-xs leading-[18px] font-medium text-auth-label"
              htmlFor="signin-password"
            >
              Insira sua senha
            </label>
            <div className="relative mt-[14px]">
              <input
                className="h-14 w-full rounded-xl border-[1.2px] border-auth-border bg-auth-surface px-[15px] pr-12 text-base text-auth-ink outline-none transition placeholder:text-auth-subtle focus:border-auth-focus focus:ring-[3px] focus:ring-auth-focus-ring/12"
                id="signin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                autoComplete="current-password"
                required
              />
              <button
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-auth-muted transition hover:text-auth-accent focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-auth-focus"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-[18px]" />
                ) : (
                  <Eye aria-hidden="true" className="size-[18px]" />
                )}
              </button>
            </div>

            <div className="mt-[7px] flex justify-end">
              <Link
                className="text-xs font-semibold text-auth-link no-underline hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-focus"
                to={paths.recoverPassword}
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              className="mt-[21px] h-[55px] w-full rounded-xl border-0 bg-auth-primary text-base font-semibold text-white shadow-[var(--auth-button-shadow)] transition hover:bg-auth-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-auth-focus-outline active:translate-y-px"
              type="submit"
            >
              Entrar
            </button>

            <p className="mt-[15px] mb-0 whitespace-nowrap text-center text-[12.5px] text-auth-muted max-[350px]:text-[11px]">
              Não possui uma conta?{' '}
              <Link
                className="font-bold text-auth-link underline underline-offset-2"
                to={paths.signUp}
              >
                Faça seu cadastro
              </Link>
            </p>

            <p className="mt-[26px] mb-0 text-[13.5px] font-semibold text-auth-label">
              Ou continue com:
            </p>

            <button
              className="mt-[15px] flex h-[55px] w-full items-center justify-center gap-[11px] rounded-[11px] border-0 bg-auth-social-surface px-[17px] text-[13px] font-medium text-auth-ink transition hover:-translate-y-px hover:bg-auth-social-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-auth-focus-outline"
              type="button"
              onClick={() => navigate(paths.discovery)}
            >
              <GoogleIcon />
              <span>Faça login com Google</span>
            </button>
          </form>
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

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.76 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.99 0 5.49-.99 7.32-2.68l-3.57-2.77c-.99.66-2.25 1.05-3.75 1.05-2.88 0-5.32-1.95-6.19-4.57H2.12v2.85A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.81 14.04A6.62 6.62 0 0 1 5.47 12c0-.71.12-1.4.34-2.04V7.11H2.12A11 11 0 0 0 1 12c0 1.78.43 3.46 1.19 4.89l3.62-2.85Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1a11 11 0 0 0-9.88 6.11l3.69 2.85C6.68 7.33 9.12 5.38 12 5.38Z"
      />
    </svg>
  )
}

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
