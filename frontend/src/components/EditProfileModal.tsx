import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export interface UserProfileData {
  name: string
  username: string
  email: string
  phone: string
  city: string
  neighborhood: string
  bio: string
  avatarUrl?: string
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentData: UserProfileData
  onSave: (updated: UserProfileData) => void
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentData,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentData.name)
  const [username, setUsername] = useState(currentData.username)
  const [email, setEmail] = useState(currentData.email)
  const [phone, setPhone] = useState(currentData.phone || '')
  const [city, setCity] = useState(currentData.city)
  const [neighborhood, setNeighborhood] = useState(currentData.neighborhood)
  const [bio, setBio] = useState(currentData.bio)
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentData.avatarUrl || null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updated: UserProfileData = {
      name: name.trim(),
      username: username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      bio: bio.trim(),
      avatarUrl: photoPreview || undefined,
    }

    onSave(updated)
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-line/30 bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line/20 px-6 py-4 bg-hero/20 dark:bg-navy/40">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-turquoise/20 text-turquoise">
              <User className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-fg">Editar Perfil</h2>
              <p className="text-xs text-muted-fg">Atualize suas informações pessoais e contato</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-fg hover:bg-canvas hover:text-fg transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Formulário */}
        {isSuccess ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="size-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-fg">Perfil atualizado com sucesso!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Foto de Perfil */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-turquoise to-amber text-xl font-bold text-white shadow-md overflow-hidden ring-2 ring-surface">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Avatar" className="size-full object-cover" />
                  ) : (
                    name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-turquoise text-white shadow hover:bg-turquoise/90 transition">
                  <Camera className="size-3.5" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
                </label>
              </div>

              <div>
                <h4 className="text-sm font-bold text-fg">Foto de perfil</h4>
                <p className="text-xs text-muted">Recomendado formato quadrado JPG ou PNG</p>
              </div>
            </div>

            {/* Dados Pessoais: Nome e Nome de Usuário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Nome completo *"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Nome de usuário (@) *"
                placeholder="@usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Contato: E-mail e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-fg mb-1">
                  E-mail de acesso *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-line/40 bg-surface px-3 pl-9 text-xs text-fg focus:border-turquoise focus:outline-none dark:bg-navy-950/70"
                    placeholder="email@exemplo.com"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg mb-1">
                  Telefone / WhatsApp *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-line/40 bg-surface px-3 pl-9 text-xs text-fg focus:border-turquoise focus:outline-none dark:bg-navy-950/70"
                    placeholder="(91) 98765-4321"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Endereço Seguro: APENAS Cidade e Bairro */}
            <div className="rounded-2xl border border-line/30 bg-canvas/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-amber-500" />
                <span className="text-xs font-bold text-fg">Localização para trocas (Apenas Cidade e Bairro)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Cidade *"
                  placeholder="Ex: Belém"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="Bairro *"
                  placeholder="Ex: Nazaré"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-muted">
                <ShieldCheck className="size-4 text-turquoise shrink-0" />
                <span>Rua, número e complemento não são solicitados para proteger sua privacidade.</span>
              </div>
            </div>

            {/* Bio Literária */}
            <div>
              <label className="block text-xs font-semibold text-fg mb-1">
                Bio literária
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Compartilhe seus gostos literários, autores favoritos ou como prefere combinar encontros..."
                className="w-full rounded-xl border border-line/30 bg-surface p-3 text-xs text-fg focus:border-turquoise focus:outline-none"
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/20">
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                onClick={onClose}
                className="text-xs h-10 px-4"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                fullWidth={false}
                className="text-xs h-10 px-5 bg-turquoise text-white hover:bg-turquoise/90"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

