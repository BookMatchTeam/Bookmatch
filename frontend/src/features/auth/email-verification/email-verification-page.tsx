import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router'

import { paths } from '@/app/router/paths'
import { FormField, useZodForm } from '@/components/form'
import { AuthButton } from '@/features/auth/components/auth-button'
import { AuthCardShell } from '@/features/auth/components/auth-card-shell'
import { authInputVariants } from '@/features/auth/components/auth-input-variants'
import { isApiError } from '@/services/api'

import {
  useResendVerificationCodeMutation,
  useVerifyEmailMutation,
} from './email-verification.queries'
import {
  emailVerificationSchema,
  type EmailVerificationFormData,
} from './email-verification.schema'

type VerificationLocationState = {
  codeWasJustSent?: boolean
}

const codeErrorCodes = new Set([
  'VALIDATION_ERROR',
  'INVALID_VERIFICATION_CODE',
  'VERIFICATION_CODE_EXPIRED',
  'VERIFICATION_CODE_ATTEMPTS_EXCEEDED',
])

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')?.trim() ?? ''
  const locationState = location.state as VerificationLocationState | null
  const [secondsRemaining, setSecondsRemaining] = useState(
    locationState?.codeWasJustSent ? 60 : 0,
  )
  const [resendFeedback, setResendFeedback] = useState<{
    kind: 'success' | 'error'
    message: string
  }>()
  const verifyMutation = useVerifyEmailMutation()
  const resendMutation = useResendVerificationCodeMutation()
  const form = useZodForm(emailVerificationSchema, {
    defaultValues: { code: '' },
  })

  useEffect(() => {
    if (!locationState?.codeWasJustSent) return

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    })
  }, [location.pathname, location.search, locationState, navigate])

  useEffect(() => {
    if (secondsRemaining <= 0) return

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1))
    }, 1_000)

    return () => window.clearInterval(intervalId)
  }, [secondsRemaining])

  const handleSubmit = form.handleSubmit(
    async ({ code }: EmailVerificationFormData) => {
      form.clearErrors()

      try {
        await verifyMutation.mutateAsync({ email, code })
        navigate(paths.signIn, {
          replace: true,
          state: {
            notice: 'E-mail confirmado. Sua conta está pronta para entrar.',
          },
        })
      } catch (error) {
        if (isApiError(error) && error.code === 'EMAIL_ALREADY_VERIFIED') {
          navigate(paths.signIn, {
            replace: true,
            state: { notice: 'Este e-mail já foi confirmado. Faça seu login.' },
          })
          return
        }

        if (
          isApiError(error) &&
          error.code &&
          codeErrorCodes.has(error.code)
        ) {
          form.setError(
            'code',
            { message: error.message },
            { shouldFocus: true },
          )
          return
        }

        form.setError('root', {
          message: isApiError(error)
            ? error.message
            : 'Não foi possível confirmar o código. Tente novamente.',
        })
      }
    },
  )

  async function handleResend() {
    setResendFeedback(undefined)

    try {
      await resendMutation.mutateAsync({ email })
      form.resetField('code')
      setSecondsRemaining(60)
      setResendFeedback({
        kind: 'success',
        message: 'Se a conta estiver pendente, um novo código foi enviado.',
      })
    } catch (error) {
      if (
        isApiError(error) &&
        error.code === 'VERIFICATION_CODE_RESEND_TOO_SOON'
      ) {
        setSecondsRemaining(60)
      }

      setResendFeedback({
        kind: 'error',
        message: isApiError(error)
          ? error.message
          : 'Não foi possível reenviar o código. Tente novamente.',
      })
    }
  }

  if (!email) {
    return (
      <>
        <title>Confirmar e-mail · BookMatch</title>
        <AuthCardShell variant="strong">
          <h1 className="mt-5 text-[30px] leading-tight font-semibold tracking-[-0.8px]">
            Confirme seu e-mail
          </h1>
          <p className="mt-5 text-sm leading-6 text-auth-muted">
            Não encontramos o e-mail que deve ser confirmado. Volte ao
            cadastro para solicitar um novo código.
          </p>
          <Link
            className="mt-8 inline-flex text-sm font-semibold text-auth-link underline underline-offset-2"
            to={paths.signUp}
          >
            Voltar para criar conta
          </Link>
        </AuthCardShell>
      </>
    )
  }

  const submitting = form.formState.isSubmitting || verifyMutation.isPending
  const resendDisabled = resendMutation.isPending || secondsRemaining > 0

  return (
    <>
      <title>Confirmar e-mail · BookMatch</title>
      <AuthCardShell variant="strong">
        <p className="m-0 text-sm text-auth-muted">Só falta um passo</p>
        <h1 className="mt-3 mb-0 text-[32px] leading-tight font-semibold tracking-[-0.9px]">
          Confirme seu e-mail
        </h1>
        <p className="mt-5 mb-0 text-[13px] leading-6 text-auth-muted">
          Digite o código de 6 dígitos enviado para{' '}
          <strong className="break-all font-semibold text-auth-ink">
            {email}
          </strong>
          . Ele vale por 15 minutos.
        </p>

        <form className="mt-7" onSubmit={handleSubmit} noValidate>
          <FormField
            control={form.control}
            name="code"
            id="email-verification-code"
            label="Código de verificação"
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            disabled={submitting}
            labelClassName="block text-xs font-medium text-auth-label"
            fieldClassName={`${authInputVariants({ size: 'lg' })} text-center text-xl tracking-[0.35em]`}
            errorClassName="text-[11px] leading-5 text-auth-danger"
          />

          {form.formState.errors.root?.message ? (
            <p
              className="mt-4 rounded-lg bg-auth-soft-surface p-3 text-xs leading-5 text-auth-danger"
              role="alert"
            >
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <AuthButton className="mt-6" type="submit" disabled={submitting}>
            {submitting ? 'Confirmando…' : 'Confirmar e-mail'}
          </AuthButton>
        </form>

        <div className="mt-6 border-t border-auth-divider pt-5 text-center">
          <p className="m-0 text-xs text-auth-muted">
            Não recebeu o código?
          </p>
          <button
            className="mt-2 text-xs font-semibold text-auth-link underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleResend}
            disabled={resendDisabled}
          >
            {resendMutation.isPending
              ? 'Reenviando…'
              : secondsRemaining > 0
                ? `Reenviar em ${secondsRemaining}s`
                : 'Reenviar código'}
          </button>

          {resendFeedback ? (
            <p
              className={`mt-3 mb-0 text-[11px] leading-5 ${
                resendFeedback.kind === 'error'
                  ? 'text-auth-danger'
                  : 'text-auth-success-ink'
              }`}
              role={resendFeedback.kind === 'error' ? 'alert' : 'status'}
            >
              {resendFeedback.message}
            </p>
          ) : null}
        </div>

        <Link
          className="mt-7 block text-center text-xs font-semibold text-auth-link underline underline-offset-2"
          to={paths.signUp}
        >
          Usar outro e-mail
        </Link>
      </AuthCardShell>
    </>
  )
}
