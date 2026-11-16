import { useState, type FormEvent } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

import { paths } from '@/app/router/paths'

export function RecoverPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) return

    setSubmitted(true)
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#03223f] text-[#081c34] [font-family:Arial,sans-serif]">
      <div className="relative mx-auto min-h-[876px] w-full max-w-[375px] overflow-hidden bg-[#03223f] px-4 pt-[97px] sm:px-6">
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

        <section className="relative z-10 mx-auto min-h-[724px] w-full max-w-[327px] rounded-[36px] bg-white px-[27px] pt-[54px] pb-10 shadow-[0_13px_30px_rgba(0,0,0,0.12)]">
          <p className="m-0 text-[12px] font-semibold tracking-[0.04em] text-[#087e93] uppercase">
            Vamos recuperar seu acesso
          </p>
          <h1 className="mt-[18px] mb-0 text-[35px] leading-[1.13] font-semibold tracking-[-1px] text-[#081c34]">
            Esqueceu sua
            <br />
            senha?
          </h1>
          <p className="mt-4 mb-0 text-[13px] leading-[1.65] text-[#607482]">
            Sem problemas! Informe o e-mail cadastrado e enviaremos as
            instruções para recuperar sua conta.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#eef7f8] p-3.5 text-[12px] leading-[1.5] text-[#35536e]">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#087e93] shadow-sm">
              <KeyRound aria-hidden="true" className="size-5" />
            </span>
            <span>
              <strong className="mb-0.5 block text-[13px] text-[#17364d]">
                Estamos aqui para ajudar!
              </strong>
              É rápido e seguro voltar à sua estante.
            </span>
          </div>

          <form className="mt-7" onSubmit={handleSubmit}>
            <label
              className="mb-2 block text-xs font-medium text-[#35536e]"
              htmlFor="recover-email"
            >
              Seu e-mail
            </label>
            <input
              className="h-14 w-full rounded-xl border border-[#9fcaca] bg-[#fbfefd] px-[15px] text-base text-[#071f34] outline-none transition placeholder:text-[#708195] focus:border-[#078fa7] focus:ring-[3px] focus:ring-[#0498ab]/12"
              id="recover-email"
              name="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              required
            />

            <button
              className="mt-5 h-[54px] w-full rounded-[10px] border-0 bg-[#03223f] text-sm font-semibold text-white shadow-[0_4px_13px_rgba(6,38,55,0.18)] transition hover:bg-[#073152] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#38acb8] active:translate-y-px"
              type="submit"
            >
              Enviar link de recuperação
            </button>
          </form>

          <div
            className="mt-4 flex gap-2.5 rounded-lg bg-[#e9f7f2] p-3 text-[11px] leading-[1.55] text-[#224d50]"
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

          <div className="mt-7 border-t border-[#e4ecee] pt-5 text-center">
            <Link
              className="text-xs font-semibold text-[#087e98] no-underline hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#078fa7]"
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
