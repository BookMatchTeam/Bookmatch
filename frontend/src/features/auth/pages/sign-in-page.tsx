import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'

import { paths } from '@/app/router/paths'
import { AuthButton } from '@/features/auth/components/auth-button'
import { AuthCardShell } from '@/features/auth/components/auth-card-shell'
import { AuthField } from '@/features/auth/components/auth-field'
import { AuthTextLink } from '@/features/auth/components/auth-text-link'
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button'
import { PasswordField } from '@/features/auth/components/password-field'

export function SignInPage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) return

    navigate(paths.discovery)
  }

  return (
    <>
      <title>Entrar · BookMatch</title>
      <AuthCardShell>
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
          <AuthField
            id="signin-identity"
            label="Entre com seu nome de Usuário ou seu E-mail"
            name="identity"
            type="text"
            placeholder="Usuário ou E-mail"
            autoComplete="username"
            required
          />

          <PasswordField
            className="mt-[23px]"
            id="signin-password"
            label="Insira sua senha"
            name="password"
            placeholder="Senha"
            autoComplete="current-password"
            required
          />

          <div className="mt-[7px] flex justify-end">
            <AuthTextLink to={paths.recoverPassword}>
              Esqueci minha senha
            </AuthTextLink>
          </div>

          <AuthButton className="mt-[21px]" type="submit">
            Entrar
          </AuthButton>

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

          <GoogleSignInButton onClick={() => navigate(paths.discovery)} />
        </form>
      </AuthCardShell>
    </>
  )
}
