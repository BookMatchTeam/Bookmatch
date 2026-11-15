import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Search, Plus, Heart, Sparkles, BookCheck, ArrowRight, ShieldCheck, MapPin, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCurrentUser } from '@/hooks/useCurrentUser'

import { Link } from 'react-router-dom'

interface BookItem {
  id: string
  title: string
  author: string
  owner: string
  ownerInitials: string
  location: string
  category: string
  type: 'Empréstimo' | 'Doação' | 'Troca'
  coverColor: string
}

const mockBooks: BookItem[] = [
  {
    id: '1',
    title: 'A Revolução dos Bichos',
    author: 'George Orwell',
    owner: 'Lucas M.',
    ownerInitials: 'LM',
    location: 'Nazaré, Belém',
    category: 'Ficção Clássica',
    type: 'Empréstimo',
    coverColor: 'bg-emerald-800',
  },
  {
    id: '2',
    title: 'Torto Arado',
    author: 'Itamar Vieira Junior',
    owner: 'Mariana S.',
    ownerInitials: 'MS',
    location: 'Umarizal, Belém',
    category: 'Literatura Brasileira',
    type: 'Troca',
    coverColor: 'bg-amber-900',
  },
  {
    id: '3',
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    owner: 'Beatriz L.',
    ownerInitials: 'BL',
    location: 'Batista Campos, Belém',
    category: 'Infantojuvenil',
    type: 'Doação',
    coverColor: 'bg-blue-900',
  },
  {
    id: '4',
    title: 'Cem Anos de Solidão',
    author: 'Gabriel García Márquez',
    owner: 'Rodrigo C.',
    ownerInitials: 'RC',
    location: 'Marco, Belém',
    category: 'Realismo Mágico',
    type: 'Troca',
    coverColor: 'bg-purple-900',
  },
  {
    id: '5',
    title: 'Sapiens: Uma Breve História',
    author: 'Yuval Noah Harari',
    owner: 'Gabriel F.',
    ownerInitials: 'GF',
    location: 'Itaim Bibi, SP',
    category: 'Não-ficção',
    type: 'Empréstimo',
    coverColor: 'bg-cyan-900',
  },
]

export default function HomePage() {
  const { firstName } = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Empréstimo' | 'Doação' | 'Troca'>('Todos')

  const filteredBooks = mockBooks.filter((book) => {
    const matchesFilter = activeFilter === 'Todos' || book.type === activeFilter
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Hero: Boas-vindas e busca (Figma: "Boas-vindas e busca") */}
      <section className="border-b border-line/20 bg-hero/40 dark:bg-navy/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Olá, {firstName}!
              </h1>
              <p className="mt-1.5 text-base text-muted">
                Sua próxima história pode estar bem perto.
              </p>
            </div>
            <Link to="/adicionar-livro">
              <Button className="flex items-center gap-2 shadow-md">
                <Plus className="size-4" /> Adicionar livro
              </Button>
            </Link>
          </div>

          {/* Campo de Busca */}
          <div className="mt-6 relative max-w-2xl">
            <label htmlFor="search-book" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Encontre livros físicos para compartilhar
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-5 text-muted pointer-events-none" />
              <input
                id="search-book"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, autor ou ISBN"
                className="w-full rounded-xl border border-line/40 bg-surface py-3 pl-11 pr-4 text-sm text-fg placeholder:text-muted focus:border-link focus:outline-none focus:ring-2 focus:ring-link/20 shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal (Figma: "Conteúdo da home") */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Coluna 1 & 2: Descoberta na comunidade */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-fg">Disponíveis na comunidade</h2>
                <p className="text-xs text-muted">Só exemplares prontos para circular.</p>
              </div>

              {/* Filtros por Tipo (Pills) */}
              <div className="flex flex-wrap items-center gap-2">
                {(['Todos', 'Empréstimo', 'Doação', 'Troca'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      activeFilter === filter
                        ? 'bg-turquoise text-white shadow-md shadow-turquoise/20'
                        : 'bg-surface/80 text-muted-fg border border-line/30 hover:border-turquoise dark:bg-navy/70'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros secundários do Figma: Comunidade, Grupos e Localização */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Filtro 1: Comunidade */}
              <div className="relative">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-line/40 bg-surface/80 px-3.5 text-xs text-fg dark:bg-navy/80 dark:border-line/30">
                  <Users className="size-4 text-turquoise shrink-0" />
                  <select
                    className="w-full bg-transparent font-medium text-fg outline-none cursor-pointer"
                    defaultValue="all"
                  >
                    <option value="all" className="dark:bg-navy-950">Toda a comunidade</option>
                    <option value="my_network" className="dark:bg-navy-950">Apenas quem sigo</option>
                    <option value="friends" className="dark:bg-navy-950">Amigos próximos</option>
                  </select>
                </div>
              </div>

              {/* Filtro 2: Grupos */}
              <div className="relative">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-line/40 bg-surface/80 px-3.5 text-xs text-fg dark:bg-navy/80 dark:border-line/30">
                  <BookOpen className="size-4 text-turquoise shrink-0" />
                  <select
                    className="w-full bg-transparent font-medium text-fg outline-none cursor-pointer"
                    defaultValue="all"
                  >
                    <option value="all" className="dark:bg-navy-950">Todos os grupos</option>
                    <option value="classicos" className="dark:bg-navy-950">Clássicos Brasileiros</option>
                    <option value="ficcao" className="dark:bg-navy-950">Ficção Científica SP</option>
                    <option value="leitoras" className="dark:bg-navy-950">Clube do Livro Mulheres</option>
                  </select>
                </div>
              </div>

              {/* Filtro 3: Localização / Bairros */}
              <div className="relative">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-line/40 bg-surface/80 px-3.5 text-xs text-fg dark:bg-navy/80 dark:border-line/30">
                  <MapPin className="size-4 text-turquoise shrink-0" />
                  <select
                    className="w-full bg-transparent font-medium text-fg outline-none cursor-pointer"
                    defaultValue="all"
                  >
                    <option value="all" className="dark:bg-navy-950">Belém · Todos os bairros</option>
                    <option value="nazare" className="dark:bg-navy-950">Nazaré (até 2 km)</option>
                    <option value="umarizal" className="dark:bg-navy-950">Umarizal (até 3 km)</option>
                    <option value="batista_campos" className="dark:bg-navy-950">Batista Campos (até 3 km)</option>
                    <option value="marco" className="dark:bg-navy-950">Marco (até 5 km)</option>
                    <option value="reduto" className="dark:bg-navy-950">Reduto (até 4 km)</option>
                  </select>
                </div>
              </div>
            </div>


            {/* Grid de Livros */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="group relative flex flex-col justify-between rounded-card border border-line/30 bg-surface p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex gap-4">
                    {/* Capa ilustrativa com cor viva */}
                    <Link to={`/livro/${book.id}`} className="size-24 shrink-0 rounded-lg overflow-hidden group/cover">
                      <div className={`size-full ${book.coverColor} flex flex-col justify-end p-2 text-white shadow-inner transition group-hover/cover:scale-105`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{book.type}</span>
                      </div>
                    </Link>

                    <div className="flex flex-col">
                      <span className="inline-block w-fit rounded bg-turquoise/15 px-2 py-0.5 text-[10px] font-semibold text-link dark:text-turquoise mb-1">
                        {book.category}
                      </span>
                      <Link to={`/livro/${book.id}`}>
                        <h3 className="line-clamp-2 text-base font-bold text-fg group-hover:text-link transition">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted">{book.author}</p>
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted">
                        <MapPin className="size-3 text-turquoise" />
                        <span>{book.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dono do livro e ação */}
                  <div className="mt-4 flex items-center justify-between border-t border-line/20 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="grid size-6 place-items-center rounded-full bg-navy/20 text-[10px] font-bold text-fg">
                        {book.ownerInitials}
                      </div>
                      <span className="text-xs text-muted font-medium">{book.owner}</span>
                    </div>

                    <button className="flex items-center gap-1.5 rounded-lg bg-turquoise/10 px-3 py-1.5 text-xs font-semibold text-link dark:text-turquoise transition hover:bg-turquoise hover:text-white">
                      {book.type === 'Troca' ? (
                        <>
                          <Heart className="size-3.5" /> Curtir para troca
                        </>
                      ) : book.type === 'Doação' ? (
                        <>
                          <Sparkles className="size-3.5" /> Demonstrar interesse
                        </>
                      ) : (
                        <>
                          <BookCheck className="size-3.5" /> Pedir emprestado
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Sua rede de leitura & Lembretes da comunidade */}
          <div className="space-y-6">
            {/* Card: Como funciona a troca (Matches) */}
            <div className="rounded-card border border-line/30 bg-surface p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-turquoise">
                <Sparkles className="size-3.5" /> Duas pessoas. Novas histórias.
              </span>
              <h3 className="mt-2 text-base font-bold text-fg">Como funciona o BookMatch?</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Você curte um exemplar de alguém, e essa pessoa curte um dos seus. Deu match! O chat abre na hora para combinar a troca.
              </p>
              <Link
                to="/matches"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-link hover:underline"
              >
                Ver meus matches <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Card: Minha Circulação */}
            <div className="rounded-card border border-line/30 bg-surface p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber">
                Minha circulação
              </span>
              <div className="mt-3 rounded-lg bg-canvas p-3 border border-line/20">
                <p className="text-xs font-medium text-fg">
                  <strong>Comigo:</strong> Dom Casmurro, de Lucas.
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Devolução combinada: <strong>12 out</strong>.
                </p>
              </div>
              <Link
                to="/biblioteca"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-link hover:underline"
              >
                Acompanhar na biblioteca <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Card: Segurança & Comunidade */}
            <div className="rounded-card border border-turquoise/20 bg-hero/50 dark:bg-navy/50 p-4">
              <div className="flex gap-2.5">
                <ShieldCheck className="size-5 shrink-0 text-turquoise mt-0.5" />
                <p className="text-xs text-fg leading-relaxed">
                  Livros físicos, sem pagamentos. Combine entregas em locais públicos pelo chat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
