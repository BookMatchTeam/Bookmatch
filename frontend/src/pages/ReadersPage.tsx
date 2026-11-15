import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import {
  Search,
  MapPin,
  BookOpen,
  Star,
  UserPlus,
  UserCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface Reader {
  id: string
  name: string
  username: string
  bio: string
  location: string
  distance: string
  booksCount: number
  followersCount: number
  genres: string[]
  isFollowing: boolean
  isCloseFriend: boolean
  avatarBg: string
}

export default function ReadersPage() {
  const { isNew } = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'following' | 'close_friends'>('all')

  const [readers, setReaders] = useState<Reader[]>(() => {
    return [
      {
        id: '1',
        name: 'Ana Souza',
        username: '@anasouza',
        bio: 'Leio para conhecer outras vidas. Literatura brasileira contemporânea, poesia e café.',
        location: 'Nazaré, Belém',
        distance: 'A 1,2 km de você',
        booksCount: 14,
        followersCount: 28,
        genres: ['Literatura Brasileira', 'Poesia', 'Crônicas'],
        isFollowing: !isNew,
        isCloseFriend: !isNew,
        avatarBg: 'bg-gradient-to-tr from-amber-500 to-amber-700',
      },
      {
        id: '2',
        name: 'Rafael Lima',
        username: '@rafaellima',
        bio: 'Fascinado por realismo mágico, ficção científica dos anos 60 e história do Brasil.',
        location: 'Umarizal, Belém',
        distance: 'A 2,5 km de você',
        booksCount: 22,
        followersCount: 45,
        genres: ['Ficção Científica', 'História', 'Realismo Mágico'],
        isFollowing: !isNew,
        isCloseFriend: false,
        avatarBg: 'bg-gradient-to-tr from-teal-500 to-emerald-700',
      },
      {
        id: '3',
        name: 'Camila Rocha',
        username: '@camilarocha',
        bio: 'Adoro romances de época, ensaios feministas e trocar indicações no clube do livro.',
        location: 'Batista Campos, Belém',
        distance: 'A 3,8 km de você',
        booksCount: 19,
        followersCount: 62,
        genres: ['Ensaios', 'Feminismo', 'Romance'],
        isFollowing: false,
        isCloseFriend: false,
        avatarBg: 'bg-gradient-to-tr from-rose-500 to-red-700',
      },
      {
        id: '4',
        name: 'Lucas Ferreira',
        username: '@lucasferreira',
        bio: 'Estante cheia de quadrinhos, romances policiais e clássicos universais da literatura.',
        location: 'Marco, Belém',
        distance: 'A 4,1 km de você',
        booksCount: 31,
        followersCount: 88,
        genres: ['Quadrinhos', 'Policial', 'Suspense'],
        isFollowing: false,
        isCloseFriend: false,
        avatarBg: 'bg-gradient-to-tr from-cyan-500 to-blue-700',
      },
      {
        id: '5',
        name: 'Beatriz Mendes',
        username: '@biamendes',
        bio: 'Leitora voraz de não-ficção, psicologia e desenvolvimento pessoal.',
        location: 'Nazaré, Belém',
        distance: 'A 800 m de você',
        booksCount: 11,
        followersCount: 19,
        genres: ['Não-ficção', 'Psicologia', 'Filosofia'],
        isFollowing: false,
        isCloseFriend: false,
        avatarBg: 'bg-gradient-to-tr from-purple-600 to-pink-700',
      },
    ]
  })

  const toggleFollow = (id: string) => {
    setReaders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextFollowing = !r.isFollowing
          return {
            ...r,
            isFollowing: nextFollowing,
            // se deixar de seguir, desmarca amigo próximo automaticamente
            isCloseFriend: nextFollowing ? r.isCloseFriend : false,
            followersCount: nextFollowing ? r.followersCount + 1 : r.followersCount - 1,
          }
        }
        return r
      })
    )
  }

  const toggleCloseFriend = (id: string) => {
    setReaders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            isCloseFriend: !r.isCloseFriend,
            // para ser amigo próximo, precisa estar seguindo
            isFollowing: true,
          }
        }
        return r
      })
    )
  }

  const filteredReaders = readers.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.genres.some((g) => g.toLowerCase().includes(searchTerm.toLowerCase()))

    if (selectedFilter === 'following') return matchesSearch && r.isFollowing
    if (selectedFilter === 'close_friends') return matchesSearch && r.isCloseFriend
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Header com Busca de Leitores */}
      <section className="border-b border-line/20 bg-hero/20 dark:bg-navy/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Encontre Leitores
              </h1>
              <p className="mt-1.5 text-xs text-muted-fg max-w-xl leading-relaxed">
                Conecte-se com pessoas pelo @usuario ou nome, siga estantes e adicione leitores de confiança ao seu círculo de Amigos Próximos.
              </p>
            </div>
          </div>

          {/* Barra de busca estilizada */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-fg pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por @usuario, nome, bairro ou gênero literário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-2xl border border-line/40 bg-surface/90 py-2 pl-12 pr-4 text-sm text-fg placeholder:text-muted-fg focus:border-turquoise focus:outline-none dark:bg-navy/80 dark:border-line/30 shadow-sm"
            />
          </div>

          {/* Abas de Filtros de Relacionamento */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                selectedFilter === 'all'
                  ? 'bg-turquoise text-white shadow-md shadow-turquoise/20'
                  : 'border border-line/30 bg-surface/70 text-muted-fg hover:text-fg'
              }`}
            >
              Todos os leitores ({readers.length})
            </button>

            <button
              onClick={() => setSelectedFilter('following')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedFilter === 'following'
                  ? 'bg-turquoise text-white shadow-md shadow-turquoise/20'
                  : 'border border-line/30 bg-surface/70 text-muted-fg hover:text-fg'
              }`}
            >
              <UserCheck className="size-3.5" />
              <span>Quem eu sigo ({readers.filter((r) => r.isFollowing).length})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('close_friends')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedFilter === 'close_friends'
                  ? 'bg-yellow text-navy-950 shadow-md shadow-yellow/20'
                  : 'border border-line/30 bg-surface/70 text-muted-fg hover:text-fg'
              }`}
            >
              <Star className="size-3.5 fill-yellow text-yellow" />
              <span>Amigos Próximos ({readers.filter((r) => r.isCloseFriend).length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Lista de Leitores */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Banner explicativo sobre Amigos Próximos vs Seguindo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line/30 bg-surface/40 p-4 text-xs text-muted-fg dark:bg-navy-950/40">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-yellow/20 text-yellow">
              <Star className="size-4 fill-yellow" />
            </div>
            <div>
              <p className="font-semibold text-fg">Como funcionam os Amigos Próximos?</p>
              <p className="text-[11px] text-muted-fg mt-0.5">
                Marque leitores com a estrela para liberar livros exclusivos para empréstimo direto e combinar prazos flexíveis com quem você confia.
              </p>
            </div>
          </div>
        </div>

        {/* Grade de Cards de Leitores */}
        {filteredReaders.length === 0 ? (
          <div className="rounded-2xl border border-line/30 bg-surface/40 p-12 text-center">
            <p className="text-base font-bold text-fg">Nenhum leitor encontrado</p>
            <p className="text-xs text-muted-fg mt-1">Tente buscar por outro nome, @usuario ou bairro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredReaders.map((reader) => (
              <div
                key={reader.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-line/30 bg-surface/70 p-5 shadow-sm transition hover:border-turquoise/50 hover:shadow-md dark:bg-navy/80"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link to="/perfil" className="flex items-center gap-3.5 group/avatar">
                      {/* Avatar */}
                      <div
                        className={`flex size-14 items-center justify-center rounded-2xl ${reader.avatarBg} text-lg font-bold text-white shadow-md ring-2 ring-surface`}
                      >
                        {reader.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-fg group-hover/avatar:text-turquoise transition">
                            {reader.name}
                          </h3>
                          {reader.isCloseFriend && (
                            <span title="Amigo Próximo">
                              <Star className="size-3.5 fill-yellow text-yellow" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-turquoise">{reader.username}</p>
                        <p className="flex items-center gap-1 text-[11px] text-muted-fg mt-0.5">
                          <MapPin className="size-3 shrink-0" />
                          <span>{reader.location}</span>
                          <span className="text-turquoise/80 font-medium">({reader.distance})</span>
                        </p>
                      </div>
                    </Link>

                    {/* Botão de Amigo Próximo ⭐ */}
                    <button
                      onClick={() => toggleCloseFriend(reader.id)}
                      title={reader.isCloseFriend ? 'Remover dos Amigos Próximos' : 'Adicionar aos Amigos Próximos'}
                      className={`flex size-9 items-center justify-center rounded-xl border transition ${
                        reader.isCloseFriend
                          ? 'border-yellow/40 bg-yellow/15 text-yellow'
                          : 'border-line/30 bg-surface text-muted-fg hover:border-yellow/50 hover:text-yellow'
                      }`}
                    >
                      <Star
                        className={`size-4 ${reader.isCloseFriend ? 'fill-yellow text-yellow' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Bio */}
                  <p className="mt-3.5 text-xs text-fg-2 leading-relaxed">{reader.bio}</p>

                  {/* Tags de Gêneros */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {reader.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-md bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted-fg border border-line/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Métricas e Botões de Ação */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-line/20">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-fg">
                      <strong className="text-yellow">{reader.booksCount}</strong> livros
                    </span>
                    <span className="h-3 w-px bg-line/30" />
                    <span className="text-muted-fg">
                      <strong className="text-fg">{reader.followersCount}</strong> seguidores
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to="/perfil">
                      <button className="flex h-9 items-center gap-1.5 rounded-lg border border-line/40 px-3 text-xs font-semibold text-fg hover:bg-canvas transition dark:border-line/30">
                        <BookOpen className="size-3.5 text-turquoise" />
                        <span>Ver estante</span>
                      </button>
                    </Link>

                    <Button
                      variant={reader.isFollowing ? 'secondary' : 'brand'}
                      fullWidth={false}
                      onClick={() => toggleFollow(reader.id)}
                      className="h-9 px-3.5 text-xs flex items-center gap-1.5"
                    >
                      {reader.isFollowing ? (
                        <>
                          <UserCheck className="size-3.5" />
                          <span>Seguindo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="size-3.5" />
                          <span>Seguir</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
