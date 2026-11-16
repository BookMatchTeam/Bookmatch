import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'

import { paths } from '@/app/router/paths'
import { AuthButton } from '@/features/auth/components/auth-button'
import { AuthField } from '@/features/auth/components/auth-field'
import { AuthThemeToggle } from '@/features/auth/components/auth-theme-toggle'
import { AvatarUploadField } from '@/features/auth/components/avatar-upload-field'
import { PasswordField } from '@/features/auth/components/password-field'
import { SignUpFooter } from '@/features/auth/components/sign-up/sign-up-footer'
import { SignUpHeader } from '@/features/auth/components/sign-up/sign-up-header'
import { SignUpIntro } from '@/features/auth/components/sign-up/sign-up-intro'
import { StateSelectField } from '@/features/auth/components/state-select-field'

const passwordRequirements =
  'Use pelo menos 8 caracteres, com letras e números.'

export function SignUpPage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) return

    navigate(paths.signIn)
  }

  return (
    <>
      <title>Criar conta · BookMatch</title>
      <div className="mx-auto w-full max-w-[390px] overflow-hidden bg-auth-page-surface px-[18px] text-auth-ink shadow-[var(--auth-page-shadow)]">
        <SignUpHeader />
        <SignUpIntro />

        <form
          className="relative rounded-[13px] border border-auth-divider bg-auth-card px-3.5 py-[18px] text-auth-ink shadow-[var(--auth-form-shadow)]"
          onSubmit={handleSubmit}
        >
          <AuthThemeToggle />
          <h2 className="mt-[7px] mb-3 text-[23px] font-bold tracking-[-0.6px]">
            Crie sua conta
          </h2>
          <p className="my-2.5 text-[13px] leading-[1.6] text-auth-muted">
            Seu próximo capítulo começa aqui.
          </p>

          <AvatarUploadField />
          <AuthField
            className="mt-[19px]"
            id="signup-name"
            label="Nome completo *"
            name="name"
            placeholder="Como você se chama?"
            autoComplete="name"
            size="md"
            required
          />
          <AuthField
            className="mt-[19px]"
            id="signup-email"
            label="E-mail *"
            name="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            size="md"
            required
          />
          <PasswordField
            className="mt-[19px]"
            id="signup-password"
            label="Senha *"
            name="password"
            placeholder="Crie uma senha"
            autoComplete="new-password"
            hint={passwordRequirements}
            minLength={8}
            pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
            title={passwordRequirements}
            size="md"
            required
          />
          <AuthField
            className="mt-[19px]"
            id="signup-city"
            label="Cidade *"
            name="city"
            placeholder="São Paulo"
            autoComplete="address-level2"
            size="md"
            required
          />
          <StateSelectField />

          <label className="mt-3.5 flex items-start gap-2 text-[11px] leading-[1.6] text-auth-muted">
            <input
              className="mt-[3px] size-4 shrink-0 accent-auth-accent"
              type="checkbox"
              name="terms"
              required
            />
            <span>
              Li e concordo com os{' '}
              <a
                className="text-auth-link underline underline-offset-2"
                href="#termos-de-uso"
              >
                termos de uso
              </a>{' '}
              e a{' '}
              <a
                className="text-auth-link underline underline-offset-2"
                href="#politica-de-privacidade"
              >
                política de privacidade
              </a>
              .
            </span>
          </label>

          <AuthButton className="mt-[18px]" size="md" type="submit">
            Criar conta
          </AuthButton>

          <p className="mt-[17px] mb-0 text-center text-[11px] text-auth-muted">
            Já tem uma conta?{' '}
            <Link
              className="font-semibold text-auth-link underline underline-offset-2"
              to={paths.signIn}
            >
              Entrar
            </Link>
          </p>
        </form>

        <SignUpFooter />
      </div>
    </>
  )
}
