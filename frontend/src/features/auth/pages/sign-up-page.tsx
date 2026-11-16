import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { paths } from '@/app/router/paths'
import { AuthThemeToggle } from '@/features/auth/components/auth-theme-toggle'
import { useAuthTheme } from '@/features/auth/hooks/use-auth-theme'

const brazilianStates = [
  ['AC', 'Acre'],
  ['AL', 'Alagoas'],
  ['AP', 'Amapá'],
  ['AM', 'Amazonas'],
  ['BA', 'Bahia'],
  ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'],
  ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'],
  ['MA', 'Maranhão'],
  ['MT', 'Mato Grosso'],
  ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'],
  ['PA', 'Pará'],
  ['PB', 'Paraíba'],
  ['PR', 'Paraná'],
  ['PE', 'Pernambuco'],
  ['PI', 'Piauí'],
  ['RJ', 'Rio de Janeiro'],
  ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'],
  ['RO', 'Rondônia'],
  ['RR', 'Roraima'],
  ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'],
  ['SE', 'Sergipe'],
  ['TO', 'Tocantins'],
] as const

const fieldClassName =
  'h-[49px] w-full rounded-[7px] border border-auth-border bg-auth-surface px-3.5 text-base text-auth-ink outline-none transition placeholder:text-auth-subtle focus:border-auth-focus focus:ring-2 focus:ring-auth-focus/20'

export function SignUpPage() {
  const navigate = useNavigate()
  const [photoName, setPhotoName] = useState('')
  const [photoError, setPhotoError] = useState('')
  const { theme, setTheme } = useAuthTheme()
  const isDark = theme === 'dark'

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    setPhotoName('')
    setPhotoError('')

    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      event.target.value = ''
      setPhotoError('Escolha uma imagem JPG ou PNG.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = ''
      setPhotoError('A imagem deve ter no máximo 5 MB.')
      return
    }

    setPhotoName(file.name)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) return

    navigate(paths.signIn)
  }

  return (
    <div className={`auth-screen ${isDark ? 'auth-dark' : 'auth-light'} min-h-svh bg-auth-page text-auth-ink [font-family:Arial,sans-serif]`}>
      <div className="mx-auto min-h-[1638px] w-full max-w-[390px] overflow-hidden bg-auth-page-surface px-[18px] text-auth-ink shadow-[var(--auth-page-shadow)]">
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

        <section className="px-[7px] pt-[25px] pb-5">
          <p className="m-0 text-[10px] text-auth-accent tracking-[0.03em]">
            HISTÓRIAS BOAS MERECEM CIRCULAR
          </p>
          <h1 className="mt-[15px] mb-3 text-[27px] leading-[1.27] font-bold tracking-[-0.8px]">
            Sua estante encontra
            <br />
            novas companhias.
          </h1>
          <p className="my-2.5 text-[13px] leading-[1.6] text-auth-muted">
            Compartilhe livros físicos, descubra leitores por perto e faça parte
            de uma comunidade que lê junto.
          </p>
        </section>

        <img
          className="mx-auto my-3 block h-[140px] w-[270px] object-contain"
          src="/brand/bookmatch-login-top.svg"
          width="270"
          height="140"
          alt="Ilustração BookMatch: gato azul e livros"
        />

        <form
          className="relative rounded-[13px] border border-auth-divider bg-auth-card px-3.5 py-[18px] text-auth-ink shadow-[var(--auth-form-shadow)]"
          onSubmit={handleSubmit}
        >
          <AuthThemeToggle theme={theme} onToggle={() => setTheme(isDark ? 'light' : 'dark')} />
          <h2 className="mt-[7px] mb-3 text-[23px] font-bold tracking-[-0.6px]">
            Crie sua conta
          </h2>
          <p className="my-2.5 text-[13px] leading-[1.6] text-auth-muted">
            Seu próximo capítulo começa aqui.
          </p>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-auth-soft-surface p-3 text-xs text-auth-label transition hover:bg-auth-soft-hover focus-within:ring-2 focus-within:ring-auth-focus/30">
            <Camera aria-hidden="true" className="size-7 shrink-0" />
            <span className="min-w-0">
              Adicionar foto · opcional
              <small className="mt-1 block text-[10px] text-auth-subtle">
                JPG ou PNG, até 5 MB. Pode ser depois.
              </small>
              {photoName ? (
                <small className="mt-1 block truncate text-[10px] font-semibold text-auth-accent">
                  {photoName}
                </small>
              ) : null}
            </span>
            <input
              className="sr-only"
              type="file"
              name="photo"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
              aria-describedby={photoError ? 'photo-error' : undefined}
            />
          </label>
          {photoError ? (
            <p
              className="mt-2 mb-0 text-[11px] text-auth-danger"
              id="photo-error"
              role="alert"
            >
              {photoError}
            </p>
          ) : null}

          <FormField
            id="signup-name"
            label="Nome completo *"
            name="name"
            placeholder="Como você se chama?"
            autoComplete="name"
          />

          <FormField
            id="signup-email"
            label="E-mail *"
            name="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
          />

          <FormField
            id="signup-password"
            label="Senha *"
            name="password"
            type="password"
            placeholder="Crie uma senha"
            autoComplete="new-password"
            minLength={8}
          />
          <p className="my-2 text-[10px] leading-[1.6] text-auth-subtle">
            Use pelo menos 8 caracteres, com letras e números.
          </p>

          <FormField
            id="signup-city"
            label="Cidade *"
            name="city"
            placeholder="São Paulo"
            autoComplete="address-level2"
          />

          <label
            className="mt-[19px] mb-2 block text-[11px] text-auth-label"
            htmlFor="signup-state"
          >
            Estado *
          </label>
          <select
            className={`${fieldClassName} appearance-none [background-image:linear-gradient(45deg,transparent_50%,var(--auth-select-arrow)_50%),linear-gradient(135deg,var(--auth-select-arrow)_50%,transparent_50%)] bg-[position:calc(100%-18px)_21px,calc(100%-13px)_21px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-10`}
            id="signup-state"
            name="state"
            autoComplete="address-level1"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Selecione
            </option>
            {brazilianStates.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="my-2 text-[10px] leading-[1.6] text-auth-subtle">
            Apenas bairro e cidade ficam públicos. Não pedimos seu endereço
            residencial.
          </p>

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

          <button
            className="mt-[18px] h-[45px] w-full rounded-[7px] border-0 bg-auth-primary text-xs font-semibold text-white transition hover:bg-auth-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-focus active:translate-y-px"
            type="submit"
          >
            Criar conta
          </button>

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

        <section className="mt-6 flex gap-[13px] border-t border-auth-divider py-6">
          <img
            className="h-[95px] w-[100px] shrink-0 object-contain"
            src="/brand/bookmatch-login-bottom.svg"
            width="100"
            height="95"
            alt="Gato amarelo e livros"
          />
          <div>
            <h2 className="m-0 text-sm font-bold">
              Mais leituras. Mais encontros.
            </h2>
            <p className="my-2.5 text-[11px] leading-[1.6] text-auth-muted">
              Empréstimos, doações e trocas. Cada livro, uma nova história.
            </p>
          </div>
        </section>

        <footer className="px-2.5 py-3 text-[10px] leading-[1.7] text-auth-subtle">
          <ShieldCheck
            aria-hidden="true"
            className="size-[29px] text-auth-accent"
            strokeWidth={1.6}
          />
          <p className="my-2.5 text-[10px] leading-[1.7] text-auth-subtle">
            Livros físicos, sem pagamentos. Combine entregas em locais públicos e
            pelo chat.
          </p>
          <span>Acesso à plataforma BookMatch.</span>
        </footer>
      </div>
    </div>
  )
}

type FormFieldProps = {
  id: string
  label: string
  name: string
  type?: 'text' | 'email' | 'password'
  placeholder: string
  autoComplete: string
  minLength?: number
}

function FormField({
  id,
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  minLength,
}: FormFieldProps) {
  return (
    <>
      <label
        className="mt-[19px] mb-2 block text-[11px] text-auth-label"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className={fieldClassName}
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
    </>
  )
}
