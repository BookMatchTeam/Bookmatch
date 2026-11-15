import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Moon, Sun, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'

import { forgotPasswordSchema, type ForgotPasswordForm } from '@/schemas/auth'
import logo from '@/assets/logo.svg'
import estantes from '@/assets/estantes.svg'

export default function ForgotPasswordPage() {
  const { theme, toggle } = useTheme()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    // Simula envio de e-mail de recuperação
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmittedEmail(data.email)
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-hero dark:bg-navy-950 lg:bg-[#f4f9fd] lg:dark:bg-navy-950">
      <title>Recuperar senha | BookMatch</title>
      <meta
        name="description"
        content="Recupere seu acesso ao BookMatch e continue emprestando e lendo livros."
      />

      {/* Faixa superior (desktop) */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-hero dark:bg-gradient-to-b dark:from-navy-950 dark:to-navy/50 max-lg:hidden" />

      {/* Alternador de tema */}
      <button
        id="theme-toggle"
        onClick={toggle}
        aria-label="Alternar tema"
        className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-surface/70 text-fg shadow backdrop-blur transition hover:rotate-12 dark:border dark:border-line/30"
      >
        {theme === 'dark' ? <Sun className="size-5 text-yellow" /> : <Moon className="size-5 text-navy" />}
      </button>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col items-center px-4 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 2xl:max-w-[1440px]">
        {/* Lado esquerdo — acolhimento (Figma: Acolhimento) */}
        <section className="hidden flex-1 flex-col pr-8 lg:flex xl:pr-16">
          <Link to="/" className="inline-block">
            <img src={logo} alt="Logo BookMatch" className="w-36 xl:w-44" />
          </Link>
          <div className="mt-8">
            <span className="inline-block rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold tracking-wider text-navy uppercase dark:bg-yellow/15 dark:text-yellow">
              Vamos retomar a leitura?
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-950 xl:text-4xl dark:text-white">
              Sua próxima história continua por aqui.
            </h2>
            <p className="mt-3 max-w-md text-sm text-navy-800 leading-relaxed dark:text-cyan-100/90">
              Esquecer a senha acontece. Vamos ajudar você a voltar para seus livros e suas boas conversas.
            </p>
          </div>

          <img
            src={estantes}
            alt=""
            className="mt-8 h-auto max-h-[300px] w-full max-w-[460px] object-contain object-left-bottom select-none xl:max-w-[540px]"
          />
        </section>

        {/* Logo mobile */}
        <div className="mb-4 lg:hidden">
          <Link to="/">
            <img src={logo} alt="Logo BookMatch" className="w-24" />
          </Link>
        </div>

        {/* Card (Figma: Recuperar senha — desktop escuro #117:19350) */}
        <section className="relative w-full max-w-md shrink-0 rounded-[28px] bg-white p-6 text-navy-950 shadow-2xl shadow-navy-950/20 sm:p-8 lg:rounded-card dark:bg-navy/85 dark:text-cyan-50 dark:shadow-navy-950/60 dark:border dark:border-line/30 dark:backdrop-blur-md">
          <div className="mb-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-navy/10 text-navy dark:bg-turquoise/15 dark:text-turquoise">
              <KeyRound className="size-6 text-navy dark:text-turquoise" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl dark:text-white">
              Esqueceu sua senha?
            </h1>
            <p className="text-xs text-muted-fg mt-1 leading-relaxed dark:text-cyan-100/60">
              Digite seu e-mail cadastrado e enviaremos um link de confirmação para você criar uma nova senha.
            </p>
          </div>

          {submittedEmail ? (
            <div className="space-y-4 py-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold">E-mail de recuperação enviado!</p>
                </div>
                <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-300">
                  Enviamos as instruções para <strong>{submittedEmail}</strong>. Verifique também sua caixa de spam.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button fullWidth variant="secondary">
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="E-mail de cadastro"
                type="email"
                placeholder="seuemail@exemplo.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" fullWidth disabled={isSubmitting} className="mt-2 flex items-center justify-center gap-2">
                <Mail className="size-4" />
                {isSubmitting ? 'Enviando link...' : 'Enviar link de recuperação'}
              </Button>

              <div className="rounded-xl border border-line/40 bg-surface/40 p-3 text-xs text-muted-fg leading-relaxed dark:border-line/30 dark:bg-navy-950/40 dark:text-cyan-100/60">
                Por segurança, apenas quem tem acesso ao endereço de e-mail registrado poderá redefinir a senha.
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-link hover:underline hover:text-turquoise transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
