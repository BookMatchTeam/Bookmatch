import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { paths } from '@/app/router/paths'
import { buttonVariants } from '@/components/ui/button'
import { PagePlaceholder } from '@/shared/components/page-placeholder'

export function SignInPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) return

    navigate(paths.discovery)
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#e8f7f0] text-[#081c34] [font-family:Arial,sans-serif]">
      <div className="relative mx-auto min-h-[876px] w-full max-w-[375px] overflow-hidden bg-[#e8f7f0] px-4 pt-[97px] sm:px-6">
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

        <section className="relative z-10 mx-auto min-h-[724px] w-full max-w-[327px] rounded-[36px] bg-white px-[27px] pt-[57px] pb-10 shadow-[0_13px_30px_rgba(0,22,35,0.05)]">
          <p className="m-0 whitespace-nowrap text-[14.5px] tracking-[-0.25px] max-[350px]:text-[13px]">
            Olá, seja bem vindo ao{' '}
            <strong className="font-extrabold text-[#936218] italic">
              Book<span className="text-[#007fa1]">Match</span>
            </strong>
          </p>

          <h1 className="mt-[22px] mb-0 text-[36px] leading-[1.23] font-semibold tracking-[-1.05px]">
            Vamos
            <br />
            Começar?
          </h1>

          <form className="mt-[27px]" onSubmit={handleSubmit}>
            <label
              className="block text-xs leading-[18px] font-medium text-[#35536e]"
              htmlFor="signin-identity"
            >
              Entre com seu nome de Usuário ou seu E-mail
            </label>
            <input
              className="mt-[13px] h-14 w-full rounded-xl border-[1.2px] border-[#9fcaca] bg-[#fbfefd] px-[15px] text-base text-[#071f34] outline-none transition placeholder:text-[#708195] focus:border-[#078fa7] focus:ring-[3px] focus:ring-[#0498ab]/12"
              id="signin-identity"
              name="identity"
              type="text"
              placeholder="Usuário ou E-mail"
              autoComplete="username"
              required
            />

            <label
              className="mt-[23px] block text-xs leading-[18px] font-medium text-[#35536e]"
              htmlFor="signin-password"
            >
              Insira sua senha
            </label>
            <div className="relative mt-[14px]">
              <input
                className="h-14 w-full rounded-xl border-[1.2px] border-[#9fcaca] bg-[#fbfefd] px-[15px] pr-12 text-base text-[#071f34] outline-none transition placeholder:text-[#708195] focus:border-[#078fa7] focus:ring-[3px] focus:ring-[#0498ab]/12"
                id="signin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                autoComplete="current-password"
                required
              />
              <button
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#55758a] transition hover:text-[#087e98] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#078fa7]"
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
                className="text-xs font-semibold text-[#087e98] no-underline hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#078fa7]"
                to={paths.recoverPassword}
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              className="mt-[21px] h-[55px] w-full rounded-xl border-0 bg-[#03223f] text-base font-semibold text-white shadow-[0_6px_14px_rgba(3,34,63,0.16)] transition hover:bg-[#073152] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#38acb8] active:translate-y-px"
              type="submit"
            >
              Entrar
            </button>

            <p className="mt-[15px] mb-0 whitespace-nowrap text-center text-[12.5px] text-[#60758a] max-[350px]:text-[11px]">
              Não possui uma conta?{' '}
              <Link
                className="font-bold text-[#05718f] underline underline-offset-2"
                to={paths.signUp}
              >
                Faça seu cadastro
              </Link>
            </p>

            <p className="mt-[26px] mb-0 text-[13.5px] font-semibold text-[#35536e]">
              Ou continue com:
            </p>

            <button
              className="mt-[15px] flex h-[55px] w-full items-center justify-center gap-[11px] rounded-[11px] border-0 bg-[#e8f2fc] px-[17px] text-[13px] font-medium text-[#061b2f] transition hover:-translate-y-px hover:bg-[#dfeefa] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#38acb8]"
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
  return (
    <PagePlaceholder
      eyebrow="Acesso"
      title="Recuperar senha"
      description="A recuperação de acesso será implementada junto à autenticação."
    >
      <Link className={buttonVariants({ variant: 'outline' })} to={paths.signIn}>
        Voltar para entrar
      </Link>
    </PagePlaceholder>
  )
}
