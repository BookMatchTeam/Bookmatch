import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import {
  Users,
  Search,
  Plus,
  BookOpen,
  MapPin,
  Calendar,
  MessageCircle,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface GroupItem {
  id: string
  name: string
  description: string
  category: string
  membersCount: number
  location: string
  currentBook: {
    title: string
    author: string
  }
  nextMeeting: string
  isMember: boolean
  bannerGradient: string
}

export default function GroupsPage() {
  const { isNew } = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter] = useState('Todos')

  const [groups, setGroups] = useState<GroupItem[]>(() => {
    const allGroups: GroupItem[] = [
      {
        id: 'g-1',
        name: 'Clube dos Clássicos Paraenses',
        description:
          'Leituras e debates dedicados à literatura da Amazônia e grandes romancistas paraenses e brasileiros contemporâneos.',
        category: 'Literatura Regional',
        membersCount: 42,
        location: 'Nazaré, Belém',
        currentBook: {
          title: 'Cinzas do Norte',
          author: 'Milton Hatoum',
        },
        nextMeeting: '18 de Novembro, 16:00 · Café Santa Clara',
        isMember: !isNew,
        bannerGradient: 'from-emerald-700 to-teal-900',
      },
      {
        id: 'g-2',
        name: 'Sci-Fi & Realismo Mágico Belém',
        description:
          'Exploramos distopias, ficção científica dos anos 60 aos contemporâneos, além do realismo fantástico de García Márquez e Borges.',
        category: 'Ficção Científica',
        membersCount: 68,
        location: 'Umarizal, Belém',
        currentBook: {
          title: 'Fahrenheit 451',
          author: 'Ray Bradbury',
        },
        nextMeeting: '24 de Novembro, 19:30 · Online via Discord',
        isMember: false,
        bannerGradient: 'from-blue-700 to-indigo-950',
      },
      {
        id: 'g-3',
        name: 'Mulheres que Leem Mulheres',
        description:
          'Clube de leitura dedicado a obras escritas por autoras mulheres do Brasil e do mundo. Discussões enriquecedoras e trocas de livros físicos.',
        category: 'Feminismo & Literatura',
        membersCount: 95,
        location: 'Batista Campos, Belém',
        currentBook: {
          title: 'Tudo É Rio',
          author: 'Carla Madeira',
        },
        nextMeeting: '12 de Novembro, 15:00 · Praça Batista Campos',
        isMember: !isNew,
        bannerGradient: 'from-rose-600 to-pink-900',
      },
      {
        id: 'g-4',
        name: 'Filosofia & Não-Ficção de Quinta',
        description:
          'Encontros quinzenais para discutir ideias, psicologia aplicada, antropologia e história. Leituras profundas e compartilhamento de acervos.',
        category: 'Filosofia',
        membersCount: 31,
        location: 'Marco, Belém',
        currentBook: {
          title: 'Em Busca de Sentido',
          author: 'Viktor Frankl',
        },
        nextMeeting: '30 de Novembro, 20:00 · Espaço Cultural',
        isMember: false,
        bannerGradient: 'from-amber-600 to-stone-900',
      },
    ]

    return allGroups
  })

  const toggleMembership = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextState = !g.isMember
          return {
            ...g,
            isMember: nextState,
            membersCount: nextState ? g.membersCount + 1 : g.membersCount - 1,
          }
        }
        return g
      })
    )
  }

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.currentBook.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === 'Todos' || g.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Header */}
      <section className="border-b border-line/20 bg-hero/25 dark:bg-navy/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-turquoise/20 px-3 py-1 text-xs font-bold text-turquoise">
                  <Users className="size-3.5" /> Comunidades Literárias
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Grupos & Clubes do Livro
              </h1>
              <p className="mt-1 text-xs text-muted-fg max-w-xl leading-relaxed">
                Participe de círculos de leitura no seu bairro, discuta obras conjuntas e troque exemplares com outros participantes do mesmo grupo.
              </p>
            </div>

            <Button variant="primary" className="flex items-center gap-2 self-start sm:self-center shadow-md">
              <Plus className="size-4" /> Criar Novo Grupo
            </Button>
          </div>

          {/* Barra de Busca */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-fg pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome do grupo, livro em leitura ou tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-2xl border border-line/40 bg-surface/90 py-2 pl-12 pr-4 text-sm text-fg placeholder:text-muted-fg focus:border-turquoise focus:outline-none dark:bg-navy/80 dark:border-line/30 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Grid de Grupos */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="overflow-hidden rounded-3xl border border-line/30 bg-surface/80 shadow-sm transition hover:border-turquoise/40 hover:shadow-md dark:bg-navy/80 flex flex-col justify-between"
            >
              <div>
                {/* Banner com Gradiente e categoria */}
                <div
                  className={`relative flex h-32 w-full items-end justify-between bg-gradient-to-r ${group.bannerGradient} p-5 text-white`}
                >
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur">
                    {group.category}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium backdrop-blur">
                    <Users className="size-3.5" />
                    <span>{group.membersCount} membros</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-fg">{group.name}</h3>
                  <p className="mt-1 text-xs text-muted-fg flex items-center gap-1">
                    <MapPin className="size-3 text-turquoise" />
                    {group.location}
                  </p>

                  <p className="mt-3 text-xs text-fg-2 leading-relaxed">
                    {group.description}
                  </p>

                  {/* Leitura do Mês */}
                  <div className="mt-5 rounded-2xl bg-canvas p-3.5 border border-line/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-turquoise">
                      <BookOpen className="size-3.5" />
                      <span>Leitura atual do grupo:</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-fg">
                      {group.currentBook.title}
                    </p>
                    <p className="text-[11px] text-muted-fg">{group.currentBook.author}</p>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-fg border-t border-line/15 pt-2">
                      <Calendar className="size-3 text-yellow" />
                      <span>{group.nextMeeting}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="p-6 pt-0 flex items-center gap-3">
                <Button
                  variant={group.isMember ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => toggleMembership(group.id)}
                  className="text-xs flex items-center justify-center gap-2"
                >
                  {group.isMember ? (
                    <>
                      <Check className="size-4 text-turquoise" /> Membro do grupo
                    </>
                  ) : (
                    <>
                      <Users className="size-4" /> Participar do grupo
                    </>
                  )}
                </Button>

                {group.isMember && (
                  <Button variant="secondary" className="px-3" title="Chat do grupo">
                    <MessageCircle className="size-4 text-turquoise" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
