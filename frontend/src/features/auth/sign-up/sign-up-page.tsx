import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { paths } from '@/app/router/paths'
import { FormField, useZodForm } from '@/components/form'
import { AuthButton } from '@/features/auth/components/auth-button'
import { AuthCardShell } from '@/features/auth/components/auth-card-shell'
import { authInputVariants } from '@/features/auth/components/auth-input-variants'
import { AvatarUploadField } from '@/features/auth/components/avatar-upload-field'
import { SignUpFooter } from '@/features/auth/components/sign-up/sign-up-footer'
import { SignUpIntro } from '@/features/auth/components/sign-up/sign-up-intro'
import { isApiError } from '@/services/api'
import { brazilianStates } from '@/shared/constants/brazilian-states'

import { useSignUpMutation } from './sign-up.queries'
import {
  signUpSchema,
  type SignUpFormData,
  type SignUpFormInput,
} from './sign-up.schema'

const passwordRequirements =
  'Use no mínimo 8 caracteres, incluindo uma letra maiúscula, um caractere especial e um número.'

const stateOptions = brazilianStates.map(({ uf, name }) => ({
  value: uf,
  label: name,
}))

const apiErrorFields = {
  INVALID_NAME: 'name',
  INVALID_EMAIL: 'email',
  INVALID_PASSWORD: 'password',
  INVALID_CITY: 'city',
  INVALID_STATE: 'state',
  TERMS_NOT_ACCEPTED: 'acceptedTerms',
  EMAIL_ALREADY_REGISTERED: 'email',
} as const satisfies Record<string, keyof SignUpFormInput>

const fieldLabelClassName = 'block text-[11px] font-normal text-auth-label'
const fieldErrorClassName = 'text-[11px] text-auth-danger'
const fieldClassName = authInputVariants({ size: 'md' })

export function SignUpPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const signUpMutation = useSignUpMutation()
  const form = useZodForm(signUpSchema, {
    defaultValues: {
      name: '',
      email: '',
      password: '',
      city: '',
      state: '',
      acceptedTerms: false,
    },
  })

  const handleSubmit = form.handleSubmit(async (data: SignUpFormData) => {
    form.clearErrors()

    try {
      const response = await signUpMutation.mutateAsync(data)
      const search = new URLSearchParams({ email: response.email })

      navigate(`${paths.emailVerification}?${search.toString()}`, {
        state: { codeWasJustSent: true },
      })
    } catch (error) {
      if (!isApiError(error)) {
        form.setError('root', {
          message: 'Não foi possível criar sua conta. Tente novamente.',
        })
        return
      }

      const field = error.code
        ? apiErrorFields[error.code as keyof typeof apiErrorFields]
        : undefined

      if (field) {
        form.setError(field, { message: error.message }, { shouldFocus: true })
        return
      }

      form.setError('root', { message: error.message })
    }
  })

  const submitting = form.formState.isSubmitting || signUpMutation.isPending

  return (
    <>
      <title>Criar conta · BookMatch</title>
      <AuthCardShell>
        <SignUpIntro />

        <form
          className="relative rounded-[13px] border border-auth-divider bg-auth-card px-3.5 py-[18px] text-auth-ink shadow-[var(--auth-form-shadow)]"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="mt-[7px] mb-3 text-[23px] font-bold tracking-[-0.6px]">
            Crie sua conta
          </h2>
          <p className="my-2.5 text-[13px] leading-[1.6] text-auth-muted">
            Seu próximo capítulo começa aqui.
          </p>

          <AvatarUploadField />
          <FormField
            control={form.control}
            name="name"
            className="mt-[19px]"
            id="signup-name"
            label="Nome completo *"
            placeholder="Como você se chama?"
            autoComplete="name"
            maxLength={100}
            disabled={submitting}
            labelClassName={fieldLabelClassName}
            fieldClassName={fieldClassName}
            errorClassName={fieldErrorClassName}
          />
          <FormField
            control={form.control}
            name="email"
            className="mt-[19px]"
            id="signup-email"
            label="E-mail *"
            type="email"
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            maxLength={254}
            disabled={submitting}
            labelClassName={fieldLabelClassName}
            fieldClassName={fieldClassName}
            errorClassName={fieldErrorClassName}
          />
          <FormField
            control={form.control}
            name="password"
            className="mt-[19px]"
            id="signup-password"
            label="Senha *"
            type={showPassword ? 'text' : 'password'}
            placeholder="Crie uma senha"
            autoComplete="new-password"
            maxLength={128}
            description={passwordRequirements}
            disabled={submitting}
            labelClassName={fieldLabelClassName}
            fieldClassName={`${fieldClassName} pr-12`}
            descriptionClassName="text-[10px] leading-[1.6] text-auth-subtle"
            errorClassName={fieldErrorClassName}
            endAdornment={
              <button
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-[7px] text-auth-muted transition hover:text-auth-accent focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-auth-focus"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                disabled={submitting}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-[18px]" />
                ) : (
                  <Eye aria-hidden="true" className="size-[18px]" />
                )}
              </button>
            }
          />
          <FormField
            control={form.control}
            name="city"
            className="mt-[19px]"
            id="signup-city"
            label="Cidade *"
            placeholder="São Paulo"
            autoComplete="address-level2"
            maxLength={100}
            disabled={submitting}
            labelClassName={fieldLabelClassName}
            fieldClassName={fieldClassName}
            errorClassName={fieldErrorClassName}
          />
          <FormField
            control={form.control}
            name="state"
            as="select"
            className="mt-[19px]"
            id="signup-state"
            label="Estado *"
            placeholder="Selecione"
            options={stateOptions}
            autoComplete="address-level1"
            description="Apenas bairro e cidade ficam públicos. Não pedimos seu endereço residencial."
            disabled={submitting}
            labelClassName={fieldLabelClassName}
            fieldClassName={`${fieldClassName} [&_svg]:text-auth-subtle`}
            contentClassName="max-h-56 touch-pan-y overscroll-contain border border-auth-divider bg-auth-card p-1.5 text-auth-ink shadow-[var(--auth-panel-shadow-strong)] ring-1 ring-auth-border/30 [-webkit-overflow-scrolling:touch] [scrollbar-color:var(--auth-border)_transparent] [scrollbar-width:thin]"
            itemClassName="min-h-11 rounded-lg px-3 py-2 text-[13px] text-auth-ink focus:bg-auth-soft-hover focus:text-auth-ink data-selected:bg-auth-soft-surface data-selected:font-semibold data-selected:text-auth-accent [&_svg]:text-auth-accent"
            descriptionClassName="text-[10px] leading-[1.6] text-auth-subtle"
            errorClassName={fieldErrorClassName}
          />

          <FormField
            control={form.control}
            name="acceptedTerms"
            id="signup-terms"
            type="checkbox"
            className="mt-3.5 grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1"
            labelClassName="col-start-2 block text-[11px] leading-[1.6] font-normal text-auth-muted"
            fieldClassName="col-start-1 row-start-1 mt-[3px] size-4 min-w-4 rounded accent-auth-accent"
            errorClassName="col-span-2 text-[11px] text-auth-danger"
            disabled={submitting}
            label={
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
            }
          />

          {form.formState.errors.root?.message ? (
            <p
              className="mt-4 rounded-lg bg-auth-soft-surface p-3 text-[11px] leading-[1.5] text-auth-danger"
              role="alert"
            >
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <AuthButton
            className="mt-[18px]"
            size="md"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Criando conta…' : 'Criar conta'}
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
      </AuthCardShell>
    </>
  )
}
