import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BrandName } from '@/components/BrandName'
import { Typewriter } from '@/components/Typewriter'
import { useTheme } from '@/hooks/useTheme'
import { loginSchema, type LoginForm } from '@/schemas/auth'
import logo from '@/assets/logo.svg'
import estantes from '@/assets/estantes.svg'

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4 18.3 4.3 18.3 4.3c.6 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
  </svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="#0A66C2" aria-hidden>
    <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.3a1.8 1.8 0 1 1 0-3.5 1.8 1.8 0 0 1 0 3.5zM19 19h-3v-4.7c0-1.1 0-2.5-1.5-2.5S12.7 13 12.7 14.2V19h-3v-9h2.9v1.2a3.2 3.2 0 0 1 2.8-1.5c3 0 3.6 2 3.6 4.6z" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: '',
      senha: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    localStorage.setItem('bm_token', 'mock_jwt_token_bookmatch_2026')
    const loginLower = data.login.trim().toLowerCase()
    const isNewTestUser = loginLower.includes('novoleitor')
    const isVeteranTestUser = loginLower === 'leitor@bookmatch.com' || loginLower === 'leitor'

    const defaultName = isNewTestUser ? 'Usuário Teste' : 'Paulo Leitor'
    localStorage.setItem('bm_user', JSON.stringify({ name: defaultName, email: data.login }))
    window.dispatchEvent(new Event('bm_user_updated'))

    if (isNewTestUser) {
      localStorage.removeItem('bm_is_veteran_user')
      localStorage.removeItem('bm_onboarding_completed')
      localStorage.removeItem('bm_account_setup_completed')
      localStorage.removeItem('bm_user_books')
      localStorage.removeItem('bm_first_book_registered')
      localStorage.removeItem('bm_match_preferences')
      localStorage.removeItem('bm_user_wishlist')
      navigate('/onboarding')
      return
    }

    if (isVeteranTestUser) {
      localStorage.setItem('bm_is_veteran_user', 'true')
      localStorage.setItem('bm_onboarding_completed', 'true')
      localStorage.setItem('bm_account_setup_completed', 'true')
      localStorage.setItem('bm_first_book_registered', 'true')
      navigate('/matches')
      return
    }

    const onboardingCompleted = localStorage.getItem('bm_onboarding_completed')
    const accountSetupCompleted = localStorage.getItem('bm_account_setup_completed')

    if (!onboardingCompleted) {
      navigate('/onboarding')
    } else if (!accountSetupCompleted) {
      navigate('/configurar-perfil')
    } else {
      navigate('/matches')
    }
  }

  const social =
    'rounded-lg bg-turquoise/10 transition hover:bg-turquoise/20 hover:-translate-y-0.5 dark:bg-white/5 dark:hover:bg-white/10 dark:border dark:border-white/10 text-fg'

  return (
    <main className="relative min-h-dvh overflow-hidden bg-hero dark:bg-navy-950 lg:bg-[#f4f9fd] lg:dark:bg-navy-950">
      <title>Entrar | BookMatch</title>
      <meta name="description" content="Entre no BookMatch e faça seus livros circularem entre amigos e grupos de leitura." />

      {/* Faixa superior (desktop) com leve gradiente no escuro */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-hero dark:bg-gradient-to-b dark:from-navy-950 dark:to-navy/50 max-lg:hidden" />

      <button
        id="theme-toggle"
        onClick={toggle}
        aria-label="Alternar tema"
        className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-surface/70 text-fg shadow backdrop-blur transition hover:rotate-12 dark:border dark:border-line/30"
      >
        {theme === 'dark' ? <Sun className="size-5 text-yellow" /> : <Moon className="size-5 text-navy" />}
      </button>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col items-center px-4 py-6 lg:flex-row lg:items-stretch lg:justify-between lg:px-12 2xl:max-w-[1440px]">
        {/* Lado esquerdo — apresentação (desktop) */}
        <section className="hidden flex-1 flex-col pr-8 lg:flex xl:pr-16">
          <img src={logo} alt="Logo BookMatch" className="w-36 xl:w-44" />
          <Typewriter
            title="Olá,"
            text="O BookMatch faz seus livros circularem: empreste, doe ou troque com amigos, grupos de leitores e a comunidade."
          />
          <img
            src={estantes}
            alt=""
            className="mt-auto h-auto max-h-[calc(50dvh-2.5rem)] w-full max-w-[460px] object-contain object-left-bottom select-none xl:max-w-[560px] 2xl:max-w-[680px]"
          />
        </section>

        {/* Logo mobile */}
        <img src={logo} alt="Logo BookMatch" className="w-20 lg:hidden mb-2" />

        {/* Card */}
        <section className="relative -mt-2 w-full max-w-md shrink-0 self-center rounded-[28px] bg-white p-6 text-navy-950 shadow-2xl shadow-navy-950/20 sm:p-8 lg:mt-0 lg:rounded-card dark:bg-navy/85 dark:text-cyan-50 dark:shadow-navy-950/60 dark:border dark:border-line/30 dark:backdrop-blur-md">
          <p className="text-sm text-navy-800 dark:text-cyan-100/70">
            Olá, seja bem vindo ao <BrandName />
          </p>
          <h1 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl text-navy-950 dark:text-white">
            Vamos
            <br />
            Começar?
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
            <Input
              id="login"
              label="Entre com seu nome de Usuário ou seu E-mail"
              placeholder="Usuário ou E-mail"
              autoComplete="username"
              error={errors.login?.message}
              {...register('login')}
            />
            <div className="flex flex-col gap-1">
              <Input
                id="senha"
                type="password"
                label="Insira sua senha"
                placeholder="Senha"
                autoComplete="current-password"
                error={errors.senha?.message}
                {...register('senha')}
              />
              <Link id="forgot-password" to="/recuperar-senha" className="self-end text-xs font-semibold text-link underline hover:text-turquoise transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <Button id="login-submit" type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-3 text-center text-xs text-muted dark:text-cyan-100/60">
            Não possui uma conta?{' '}
            <Link id="signup-link" to="/cadastro" className="font-semibold text-link underline hover:text-turquoise transition-colors">
              Faça seu cadastro
            </Link>
          </p>

          <p className="mt-6 text-sm font-medium text-navy-900 dark:text-cyan-50">Outros métodos de login:</p>
          <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-3">
            <button id="login-google" className={`${social} flex h-11 min-w-0 shrink-0 items-center justify-center gap-2 px-3 text-xs whitespace-nowrap sm:text-sm`}>
              <GoogleIcon /> <span className="max-[359px]:hidden">Faça login com Google</span>
              <span className="min-[360px]:hidden">Google</span>
            </button>
            <button id="login-github" aria-label="Entrar com GitHub" className={`${social} grid size-11 place-items-center`}>
              <GithubIcon />
            </button>
            <button id="login-linkedin" aria-label="Entrar com LinkedIn" className={`${social} grid size-11 place-items-center`}>
              <LinkedinIcon />
            </button>
          </div>
        </section>
      </div>
    </main>

  )
}
