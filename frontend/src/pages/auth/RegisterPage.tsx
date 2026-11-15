import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Moon, Sun, Camera, MapPin, CheckCircle2 } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BrandName } from '@/components/BrandName'
import { useTheme } from '@/hooks/useTheme'

import { registerSchema, type RegisterForm } from '@/schemas/auth'
import logo from '@/assets/logo.svg'
import estantes from '@/assets/estantes.svg'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      cidade: 'Belém',
      bairro: '',
      termos: true,
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
    }
  }

  const onSubmit = async (data: RegisterForm) => {
    // Simula cadastro e login imediato
    localStorage.setItem('bm_token', 'mock_jwt_token_bookmatch_2026')
    localStorage.setItem(
      'bm_user',
      JSON.stringify({
        name: data.nome,
        email: data.email,
        city: data.cidade,
        neighborhood: data.bairro,
      })
    )
    // Novo cadastro: sempre passa pelo onboarding de preferências e configuração
    localStorage.removeItem('bm_is_veteran_user')
    localStorage.removeItem('bm_onboarding_completed')
    localStorage.removeItem('bm_account_setup_completed')
    localStorage.removeItem('bm_user_books')
    localStorage.removeItem('bm_first_book_registered')
    localStorage.removeItem('bm_match_preferences')
    localStorage.removeItem('bm_user_wishlist')
    window.dispatchEvent(new Event('bm_user_updated'))
    setIsSuccess(true)
    setTimeout(() => {
      navigate('/onboarding')
    }, 1200)
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-hero dark:bg-navy-950 lg:bg-[#f4f9fd] lg:dark:bg-navy-950">
      <title>Criar conta | BookMatch</title>
      <meta
        name="description"
        content="Crie sua conta no BookMatch. Compartilhe livros físicos, descubra leitores por perto e faça parte da comunidade."
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
        {/* Lado esquerdo — convite à comunidade (Figma: Convite à comunidade) */}
        <section className="hidden flex-1 flex-col pr-8 lg:flex xl:pr-16">
          <Link to="/" className="inline-block">
            <img src={logo} alt="Logo BookMatch" className="w-36 xl:w-44" />
          </Link>
          <div className="mt-8">
            <span className="inline-block rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold tracking-wider text-navy uppercase dark:bg-yellow/15 dark:text-yellow">
              Histórias boas merecem circular
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-950 xl:text-4xl dark:text-white">
              Sua estante encontra novas companhias.
            </h2>
            <p className="mt-3 max-w-md text-sm text-navy-800 leading-relaxed dark:text-cyan-100/90">
              Compartilhe livros físicos, descubra leitores por perto e faça parte de uma comunidade que lê junto.
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

        {/* Card de Formulário (Figma: Cadastro de conta — desktop escuro) */}
        <section className="relative w-full max-w-lg shrink-0 rounded-[28px] bg-white p-6 text-navy-950 shadow-2xl shadow-navy-950/20 sm:p-8 lg:rounded-card dark:bg-navy/85 dark:text-cyan-50 dark:shadow-navy-950/60 dark:border dark:border-line/30 dark:backdrop-blur-md">
          <div className="mb-6">
            <p className="text-xs font-medium text-navy-600 dark:text-cyan-100/70">
              Faça parte do <BrandName />
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl dark:text-white">
              Crie sua conta
            </h1>
            <p className="text-xs text-muted-fg mt-1 dark:text-cyan-100/60">Seu próximo capítulo começa aqui.</p>
          </div>

          {isSuccess ? (
            <div className="py-12 text-center flex flex-col items-center">
              <CheckCircle2 className="size-16 text-emerald-500 animate-bounce" />
              <h3 className="mt-4 text-xl font-bold text-navy-950 dark:text-white">Conta criada com sucesso!</h3>
              <p className="text-sm text-muted-fg mt-2 dark:text-cyan-100/70">Preparando sua estante virtual...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Foto opcional */}
              <div className="flex items-center gap-4 rounded-xl border border-line/30 bg-surface/40 p-3 dark:bg-navy-950/50 dark:border-line/40">
                <label className="relative flex size-14 cursor-pointer items-center justify-center rounded-full bg-navy/10 text-navy transition hover:bg-navy/20 overflow-hidden shrink-0 dark:bg-turquoise/15 dark:text-turquoise dark:hover:bg-turquoise/25">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto de perfil" className="size-full object-cover" />
                  ) : (
                    <Camera className="size-6 text-navy-600 dark:text-turquoise" />
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handlePhotoChange}
                    className="sr-only"
                    aria-label="Upload de foto de perfil"
                  />
                </label>
                <div>
                  <p className="text-xs font-semibold text-navy-950 dark:text-cyan-50">Foto de perfil (opcional)</p>
                  <p className="text-[11px] text-muted-fg dark:text-cyan-100/60">JPG ou PNG, até 5 MB. Você pode adicionar depois.</p>
                </div>
              </div>

              {/* Nome */}
              <Input
                label="Nome completo ou de exibição"
                placeholder="Como você se chama?"
                error={errors.nome?.message}
                {...register('nome')}
              />

              {/* E-mail */}
              <Input
                label="Seu melhor e-mail"
                type="email"
                placeholder="seuemail@exemplo.com"
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Senha */}
              <div>
                <Input
                  label="Crie uma senha"
                  type="password"
                  placeholder="No mínimo 8 caracteres"
                  error={errors.senha?.message}
                  {...register('senha')}
                />
                <p className="mt-1 text-[11px] text-muted-fg dark:text-cyan-100/60">Use pelo menos 8 caracteres, com letras e números.</p>
              </div>

              {/* Localização pública */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Cidade"
                  placeholder="Ex: Belém"
                  error={errors.cidade?.message}
                  {...register('cidade')}
                />
                <Input
                  label="Bairro"
                  placeholder="Ex: Nazaré"
                  error={errors.bairro?.message}
                  {...register('bairro')}
                />
              </div>
              <p className="flex items-center gap-1 text-[11px] text-muted-fg dark:text-cyan-100/60">
                <MapPin className="size-3.5 shrink-0 text-navy-500 dark:text-turquoise" />
                Apenas bairro e cidade ficam públicos para aproximar leitores vizinhos.
              </p>

              {/* Termos e Consentimento */}
              <label className="flex items-start gap-2.5 text-xs text-navy-800 dark:text-cyan-100/80 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-line text-navy focus:ring-navy cursor-pointer dark:border-line/40 dark:bg-navy-950"
                  {...register('termos')}
                />
                <span>
                  Concordo com os{' '}
                  <span className="font-semibold text-link underline hover:text-turquoise">Termos de Uso</span> e a{' '}
                  <span className="font-semibold text-link underline hover:text-turquoise">Política de Privacidade</span>.
                </span>
              </label>
              {errors.termos?.message && (
                <p className="text-xs text-red-500">{errors.termos.message}</p>
              )}

              {/* Botão de Envio */}
              <Button type="submit" fullWidth disabled={isSubmitting} className="mt-4">
                {isSubmitting ? 'Criando sua conta...' : 'Criar conta'}
              </Button>

              <div className="pt-2 text-center text-xs text-muted-fg dark:text-cyan-100/60">
                Já possui uma conta?{' '}
                <Link to="/login" className="font-semibold text-link hover:underline hover:text-turquoise transition-colors">
                  Fazer login
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
