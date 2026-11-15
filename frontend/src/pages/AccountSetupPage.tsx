import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  MapPin,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import logo from '@/assets/logo.svg'

export default function AccountSetupPage() {
  const navigate = useNavigate()
  
  // Carrega dados se existirem no localStorage
  const savedUser = JSON.parse(localStorage.getItem('bm_user') || '{}')

  const [name, setName] = useState(savedUser.name || 'Usuário Teste')
  const [username, setUsername] = useState(
    savedUser.email ? `@${savedUser.email.split('@')[0]}` : '@usuario.teste'
  )
  const [email, setEmail] = useState(savedUser.email || 'novoleitor@bookmatch.com')
  const [phone, setPhone] = useState(savedUser.phone || '(91) 98765-4321')
  const [bio, setBio] = useState(
    'Leitor apaixonado por boas histórias. Aberto a trocas e empréstimos pelo bairro!'
  )
  const [city, setCity] = useState(savedUser.city || 'Belém')
  const [neighborhood, setNeighborhood] = useState(savedUser.neighborhood || 'Nazaré')
  const [maxDistance, setMaxDistance] = useState(10)
  const [allowDirectChat] = useState(true)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault()

    // Atualiza dados no localStorage
    const updatedUser = {
      ...savedUser,
      name,
      username,
      email,
      phone,
      bio,
      city,
      neighborhood,
      maxDistance,
      allowDirectChat,
      avatarUrl: photoPreview || undefined,
    }

    localStorage.setItem('bm_user', JSON.stringify(updatedUser))
    localStorage.setItem('bm_account_setup_completed', 'true')
    window.dispatchEvent(new Event('bm_user_updated'))

    setIsSaved(true)

    // Direciona imediatamente para o Acervo Pessoal (Minha biblioteca)
    setTimeout(() => {
      navigate('/biblioteca')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line/20 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="BookMatch" className="h-8 w-auto" />
            <span className="font-brand text-xl text-turquoise">
              Book<span className="text-yellow">Match</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-turquoise/15 px-3 py-1 text-xs font-semibold text-turquoise">
              <Sliders className="size-3.5" />
              Configuração inicial da conta
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow/20 px-3.5 py-1 text-xs font-semibold text-amber-900 dark:text-yellow mb-2.5">
            <Sparkles className="size-3.5" />
            Quase pronto para ler e trocar!
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            Configure seu perfil de leitor
          </h1>
          <p className="mt-2 text-sm text-fg-2">
            Essas informações ajudam outros membros a conhecerem seu estilo e encontrarem você para trocas físicas seguras.
          </p>
        </div>

        {isSaved ? (
          <div className="rounded-3xl border border-line/30 bg-surface p-12 text-center shadow-lg animate-fade-in">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mx-auto">
              <CheckCircle2 className="size-10 stroke-[2.5]" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-fg">Perfil configurado com sucesso!</h2>
            <p className="mt-2 text-sm text-fg-2">
              Levando você para o seu <strong>Acervo Pessoal</strong> para adicionar seus livros...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-turquoise border-t-transparent" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveAndContinue} className="space-y-6">
            {/* Foto e Bio */}
            <div className="rounded-2xl border border-line/30 bg-surface p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-fg border-b border-line/20 pb-3 flex items-center gap-2">
                <User className="size-4 text-turquoise" />
                Dados públicos do perfil
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-tr from-turquoise to-amber text-2xl font-bold text-white shadow-md overflow-hidden ring-4 ring-surface">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Foto" className="size-full object-cover" />
                    ) : (
                      name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-turquoise text-white shadow-md hover:bg-turquoise/90 transition-transform active:scale-90">
                    <Camera className="size-4" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
                  </label>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome completo ou apelido *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Nome de usuário (@) *"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Input
                    label="E-mail de contato *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Telefone / WhatsApp *"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg mb-1">
                  Sua bio literária
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre o que você curte ler ou colecionar..."
                  className="w-full rounded-xl border border-line/30 bg-canvas p-3 text-xs text-fg focus:border-turquoise focus:outline-none"
                />
              </div>
            </div>

            {/* Localização e Raio do Match */}
            <div className="rounded-2xl border border-line/30 bg-surface p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-fg border-b border-line/20 pb-3 flex items-center gap-2">
                <MapPin className="size-4 text-amber-500" />
                Localização para troca e raio de alcance
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cidade *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="Bairro *"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-fg mb-2">
                  <span>Raio máximo de distância para sugestões:</span>
                  <span className="text-turquoise font-bold">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-turquoise cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted mt-1">
                  <span>2 km (Bairro)</span>
                  <span>25 km (Cidade)</span>
                  <span>50 km (Região)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-canvas/70 p-3.5 border border-line/20">
                <ShieldCheck className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-fg-2">
                  <strong>Privacidade garantida:</strong> Nunca exibimos seu endereço residencial ou número de telefone.
                </p>
              </div>
            </div>

            {/* Botão de Salvar e ir para o Acervo */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-turquoise to-amber text-white font-bold hover:opacity-95 shadow-lg shadow-turquoise/20 py-3.5"
              >
                <span>Salvar e ir para meu Acervo Pessoal</span>
                <ArrowRight className="size-4 shrink-0" />
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
