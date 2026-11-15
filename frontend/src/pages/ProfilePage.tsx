import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import {
  MapPin,
  BookOpen,
  Star,
  BookmarkCheck,
  Edit3,
  Plus,
  Heart,
  Shuffle,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { EditProfileModal, type UserProfileData } from '@/components/EditProfileModal'
import { useCurrentUser, setCurrentUser } from '@/hooks/useCurrentUser'
import { BooksStorage } from '@/services/booksStorage'

interface MyBook {
  id: string
  title: string
  author: string
  category: string
  type: 'Troca' | 'Empréstimo' | 'Doação'
  state: 'Excelente' | 'Muito bom' | 'Bom estado'
  coverColor: string
  matchesCount: number
}

export default function ProfilePage() {
  const { user, initials, isNew } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'my_books' | 'wishlist' | 'stats'>('my_books')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleSaveProfile = (updated: UserProfileData) => {
    setCurrentUser(updated)
  }

  // Lista de livros vinculada ao acervo real
  const [myBooks, setMyBooks] = useState<MyBook[]>([])

  useEffect(() => {
    if (isNew) {
      setMyBooks([])
    } else {
      const realBooks = BooksStorage.getBooks()
      if (realBooks.length > 0) {
        setMyBooks(
          realBooks.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            category: b.category,
            type: b.modality,
            state: b.condition as any,
            coverColor: b.coverGradient,
            matchesCount: 0,
          }))
        )
      } else {
        setMyBooks([])
      }
    }
  }, [isNew])

  const wishlist = isNew
    ? []
    : [
        { id: 'w1', title: 'Torto Arado', author: 'Itamar Vieira Junior', genre: 'Ficção' },
        { id: 'w2', title: 'A Redoma de Vidro', author: 'Sylvia Plath', genre: 'Drama' },
        { id: 'w3', title: 'Tudo É Rio', author: 'Carla Madeira', genre: 'Romance' },
      ]

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Header do Perfil do Usuário */}
      <div className="border-b border-line/20 bg-hero/25 dark:bg-navy/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Foto e Informações Básicas */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-turquoise via-teal-500 to-yellow text-3xl font-bold text-navy shadow-lg ring-4 ring-surface sm:size-28 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="size-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <span
                  title="Perfil Verificado"
                  className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-turquoise text-white shadow ring-2 ring-surface"
                >
                  <ShieldCheck className="size-4" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                    {user.name}
                  </h1>
                  <span className="rounded-full bg-turquoise/20 px-2.5 py-0.5 text-xs font-semibold text-turquoise">
                    {user.username}
                  </span>
                  <span className="rounded-full bg-yellow/20 px-2.5 py-0.5 text-xs font-bold text-yellow">
                    Leitor Ativo
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-fg">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-turquoise shrink-0" />
                    {user.neighborhood}, {user.city}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted shrink-0" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted shrink-0" />
                        {user.phone}
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-fg-2">
                  {user.bio}
                </p>
              </div>
            </div>

            {/* Métricas e Ações do Perfil */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
              <div className="flex items-center gap-4 rounded-2xl border border-line/30 bg-surface/70 px-4 py-2.5 backdrop-blur shadow-sm dark:bg-navy/70">
                <div className="text-center">
                  <span className="block text-base font-bold text-fg">{myBooks.length}</span>
                  <span className="text-[10px] uppercase font-semibold text-muted-fg">Disponíveis</span>
                </div>
                <div className="h-6 w-px bg-line/30" />
                <div className="text-center">
                  <span className="block text-base font-bold text-turquoise">{isNew ? 0 : 5}</span>
                  <span className="text-[10px] uppercase font-semibold text-muted-fg">Matches</span>
                </div>
                <div className="h-6 w-px bg-line/30" />
                <div className="text-center">
                  <span className="block text-base font-bold text-fg">{isNew ? 0 : 48}</span>
                  <span className="text-[10px] uppercase font-semibold text-muted-fg">Seguidores</span>
                </div>
              </div>

              <Button
                variant="secondary"
                fullWidth={false}
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 text-xs"
              >
                <Edit3 className="size-3.5" />
                Editar Perfil
              </Button>

              <Link to="/adicionar-livro">
                <Button variant="primary" className="flex items-center gap-2 text-xs shadow-md">
                  <Plus className="size-3.5" />
                  Cadastrar Livro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Abas */}
        <div className="flex border-b border-line/30 gap-6">
          <button
            onClick={() => setActiveTab('my_books')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'my_books'
                ? 'border-turquoise text-turquoise'
                : 'border-transparent text-muted-fg hover:text-fg'
            }`}
          >
            <BookOpen className="size-4" />
            Minha Estante para Matches ({myBooks.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'border-turquoise text-turquoise'
                : 'border-transparent text-muted-fg hover:text-fg'
            }`}
          >
            <Heart className="size-4" />
            Lista de Desejos ({wishlist.length})
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'border-turquoise text-turquoise'
                : 'border-transparent text-muted-fg hover:text-fg'
            }`}
          >
            <BookmarkCheck className="size-4" />
            Histórico & Conquistas
          </button>
        </div>

        {/* Aba 1: Livros cadastrados */}
        {activeTab === 'my_books' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-fg">Seus Livros em Circulação</h2>
                <p className="text-xs text-muted-fg">
                  Estes são os títulos que outros leitores podem ver na tela de Matches.
                </p>
              </div>

              <Link to="/adicionar-livro">
                <Button variant="brand" className="text-xs flex items-center gap-1.5">
                  <Plus className="size-3.5" /> Adicionar Livro
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myBooks.map((book) => (
                <div
                  key={book.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line/30 bg-surface/70 p-5 shadow-sm transition hover:border-turquoise/50 hover:shadow-md dark:bg-navy/80"
                >
                  <div>
                    {/* Capa */}
                    <div
                      className={`relative mb-4 flex h-48 w-full items-center justify-center rounded-2xl bg-gradient-to-br ${book.coverColor} p-4 text-center text-white shadow-md`}
                    >
                      <div className="space-y-1">
                        <BookOpen className="mx-auto size-8 opacity-80" />
                        <h3 className="font-serif text-lg font-bold line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-white/80">{book.author}</p>
                      </div>
                      <span className="absolute top-3 right-3 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                        {book.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-yellow/20 px-2 py-0.5 text-xs font-semibold text-yellow">
                        {book.type}
                      </span>
                      <span className="rounded-md bg-canvas px-2 py-0.5 text-xs text-muted-fg border border-line/20">
                        {book.state}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-fg">{book.title}</h4>
                    <p className="text-xs text-muted-fg">{book.author}</p>
                  </div>

                  <div className="mt-5 border-t border-line/20 pt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-turquoise flex items-center gap-1">
                      <Shuffle className="size-3.5" /> {book.matchesCount} interessados
                    </span>
                    <Link to="/matches">
                      <Button variant="secondary" className="text-xs h-8 px-3">
                        Ver Matches
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba 2: Lista de Desejos (Gera matches automáticos!) */}
        {activeTab === 'wishlist' && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-turquoise/20 bg-turquoise/5 p-4 flex items-center gap-3">
              <Star className="size-5 text-yellow shrink-0 fill-yellow" />
              <p className="text-xs text-fg leading-relaxed">
                Adicione livros que você sonha ler. Quando outro usuário perto de você disponibilizar um desses livros, nós notificaremos imediatamente para dar Match!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-line/30 bg-surface/70 p-4 shadow-sm dark:bg-navy/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-fg">{item.title}</h4>
                    <p className="text-xs text-muted-fg">{item.author}</p>
                    <span className="mt-2 inline-block rounded-md bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted-fg border border-line/20">
                      {item.genre}
                    </span>
                  </div>
                  <Button variant="secondary" className="h-8 px-2.5 text-xs">
                    Buscar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba 3: Conquistas & Histórico */}
        {activeTab === 'stats' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-line/30 bg-surface/70 p-6 text-center dark:bg-navy/80">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-turquoise/20 text-turquoise">
                <Shuffle className="size-6" />
              </div>
              <h3 className="mt-3 text-2xl font-bold text-fg">8</h3>
              <p className="text-xs text-muted-fg font-medium">Livros trocados com sucesso</p>
            </div>

            <div className="rounded-3xl border border-line/30 bg-surface/70 p-6 text-center dark:bg-navy/80">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-yellow/20 text-yellow">
                <Star className="size-6 fill-yellow" />
              </div>
              <h3 className="mt-3 text-2xl font-bold text-fg">5.0</h3>
              <p className="text-xs text-muted-fg font-medium">Avaliação média na comunidade</p>
            </div>

            <div className="rounded-3xl border border-line/30 bg-surface/70 p-6 text-center dark:bg-navy/80">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="mt-3 text-2xl font-bold text-fg">100%</h3>
              <p className="text-xs text-muted-fg font-medium">Pontualidade em devoluções</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Edição de Perfil */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentData={user}
        onSave={handleSaveProfile}
      />
    </div>
  )
}
