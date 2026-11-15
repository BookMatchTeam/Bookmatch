import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import {
  Heart,
  X,
  Sparkles,
  ArrowRight,
  MapPin,
  Flame,
  CheckCircle2,
  RefreshCw,
  Info,
  BookOpen,
  Plus,
  Lock,
  SlidersHorizontal,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { BooksStorage } from '@/services/booksStorage'
import { MatchPreferencesModal } from '@/components/MatchPreferencesModal'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface SwipeBook {
  id: string
  title: string
  author: string
  genre: string
  condition: string
  ownerName: string
  ownerUsername: string
  ownerAvatar: string
  distance: string
  neighborhood: string
  description: string
  wantsInReturn: string
  coverGradient: string
  pages: number
  year: number
}

interface MatchRecord {
  id: string
  userName: string
  userUsername: string
  userAvatar: string
  distance: string
  matchedAt: string
  theyGive: {
    title: string
    author: string
    coverColor: string
  }
  youGive: {
    title: string
    author: string
    coverColor: string
  }
}

export default function MatchesPage() {
  const { firstName, isNew } = useCurrentUser()
  const [viewMode, setViewMode] = useState<'discover' | 'my_matches'>('discover')
  const [matchPopup, setMatchPopup] = useState<MatchRecord | null>(null)
  const [hasBooks, setHasBooks] = useState<boolean>(true)
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false)
  const [activeTradeCount, setActiveTradeCount] = useState<number>(0)
  const [isSeekingDonations, setIsSeekingDonations] = useState<boolean>(false)

  useEffect(() => {
    const registered = BooksStorage.hasRegisteredBooks()
    setHasBooks(registered)

    if (registered) {
      // Verifica se o usuário já respondeu a intenção de match nesta sessão
      const sessionPrefs = BooksStorage.getMatchPreferences()
      if (!sessionPrefs) {
        setShowPreferencesModal(true)
      } else {
        setActiveTradeCount(sessionPrefs.selectedBookIdsForTrade.length)
        setIsSeekingDonations(sessionPrefs.seekingDonations)
      }
    }
  }, [])

  const handlePreferencesConfirm = (selectedIds: string[], seekingDonations: boolean) => {
    setActiveTradeCount(selectedIds.length)
    setIsSeekingDonations(seekingDonations)
    setShowPreferencesModal(false)
  }

  // Fila de livros para o modo Tinder / Match Literário
  const [deck, setDeck] = useState<SwipeBook[]>([
    {
      id: 'sw-1',
      title: 'Torto Arado',
      author: 'Itamar Vieira Junior',
      genre: 'Literatura Brasileira',
      condition: 'Como novo',
      ownerName: 'Mariana Silva',
      ownerUsername: '@marianas',
      ownerAvatar: 'MS',
      distance: 'A 1,4 km',
      neighborhood: 'Umarizal, Belém',
      description:
        'Exemplar em perfeito estado, lido apenas uma vez com muito cuidado. Quero trocar por algum clássico ou ficção contemporânea!',
      wantsInReturn: 'Interesse em ficção latino-americana ou clássicos',
      coverGradient: 'from-amber-600 via-amber-700 to-amber-950',
      pages: 264,
      year: 2019,
    },
    {
      id: 'sw-2',
      title: 'Duna',
      author: 'Frank Herbert',
      genre: 'Ficção Científica',
      condition: 'Bom estado',
      ownerName: 'Rafael Lima',
      ownerUsername: '@rafaellima',
      ownerAvatar: 'RL',
      distance: 'A 2,1 km',
      neighborhood: 'Nazaré, Belém',
      description:
        'Capa com leve marca de manuseio na lombada, miolo impecável. Estou procurando romances de distopia ou Stephen King.',
      wantsInReturn: 'Procura Stephen King, 1984 ou Fundação',
      coverGradient: 'from-orange-600 via-stone-800 to-stone-950',
      pages: 680,
      year: 1965,
    },
    {
      id: 'sw-3',
      title: 'A Redoma de Vidro',
      author: 'Sylvia Plath',
      genre: 'Drama / Biografia',
      condition: 'Excelente',
      ownerName: 'Camila Rocha',
      ownerUsername: '@camilarocha',
      ownerAvatar: 'CR',
      distance: 'A 3,2 km',
      neighborhood: 'Batista Campos, Belém',
      description:
        'Edição especial com prefácio. Livro que mexeu muito comigo, adoraria trocar com quem tenha livros de Clarice Lispector.',
      wantsInReturn: 'Livros de Clarice Lispector ou Virginia Woolf',
      coverGradient: 'from-rose-700 via-purple-900 to-slate-950',
      pages: 288,
      year: 1963,
    },
    {
      id: 'sw-4',
      title: 'Cem Anos de Solidão',
      author: 'Gabriel García Márquez',
      genre: 'Realismo Mágico',
      condition: 'Ótimo estado',
      ownerName: 'Lucas Ferreira',
      ownerUsername: '@lucasferreira',
      ownerAvatar: 'LF',
      distance: 'A 4,0 km',
      neighborhood: 'Marco, Belém',
      description:
        'Uma obra-prima incontestável! Li e me apaixonei. Troco por não-ficção, ensaios ou filosofia.',
      wantsInReturn: 'Ensaios, Filosofia ou História',
      coverGradient: 'from-emerald-700 via-teal-900 to-cyan-950',
      pages: 448,
      year: 1967,
    },
  ])

  // Lista de matches já confirmados
  const [confirmedMatches, setConfirmedMatches] = useState<MatchRecord[]>(() => {
    if (isNew) return []
    return [
      {
        id: 'm-1',
        userName: 'Mariana Silva',
        userUsername: '@marianas',
        userAvatar: 'MS',
        distance: 'A 1,4 km · Umarizal',
        matchedAt: 'Hoje às 09:15',
        theyGive: {
          title: 'Torto Arado',
          author: 'Itamar Vieira Junior',
          coverColor: 'bg-amber-900',
        },
        youGive: {
          title: 'Capitães da Areia',
          author: 'Jorge Amado',
          coverColor: 'bg-teal-900',
        },
      },
      {
        id: 'm-2',
        userName: 'Beatriz Mendes',
        userUsername: '@biamendes',
        userAvatar: 'BM',
        distance: 'A 800 m · Nazaré',
        matchedAt: 'Ontem',
        theyGive: {
          title: 'O Homem em Busca de Sentido',
          author: 'Viktor Frankl',
          coverColor: 'bg-indigo-900',
        },
        youGive: {
          title: 'Quarto de Despejo',
          author: 'Carolina Maria de Jesus',
          coverColor: 'bg-rose-900',
        },
      },
    ]
  })

  const currentBook = deck[0]

  const handleLike = () => {
    if (!currentBook) return

    // Se curtir o primeiro, simula o momento especial "DEU MATCH!"
    const wasMatch = currentBook.id === 'sw-1' || currentBook.id === 'sw-3'

    if (wasMatch) {
      const newMatch: MatchRecord = {
        id: `m-${Date.now()}`,
        userName: currentBook.ownerName,
        userUsername: currentBook.ownerUsername,
        userAvatar: currentBook.ownerAvatar,
        distance: `${currentBook.distance} · ${currentBook.neighborhood}`,
        matchedAt: 'Agora mesmo',
        theyGive: {
          title: currentBook.title,
          author: currentBook.author,
          coverColor: 'bg-amber-900',
        },
        youGive: {
          title: 'Vidas Secas',
          author: 'Graciliano Ramos',
          coverColor: 'bg-blue-900',
        },
      }

      setConfirmedMatches((prev) => [newMatch, ...prev])
      setMatchPopup(newMatch)
    }

    setDeck((prev) => prev.slice(1))
  }

  const handlePass = () => {
    if (!currentBook) return
    setDeck((prev) => prev.slice(1))
  }

  const handleResetDeck = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Header com destaque da funcionalidade principal */}
      <section className="border-b border-line/20 bg-hero/25 dark:bg-navy/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-yellow/20 px-3 py-1 text-xs font-bold text-yellow">
                  <Flame className="size-3.5 fill-yellow" /> O Coração do BookMatch
                </span>
                <span className="text-xs text-muted-fg">Trocas mútuas perfeitas</span>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Matches Literários
              </h1>
              <p className="mt-1 text-xs text-muted-fg max-w-xl leading-relaxed">
                Deslize pelos livros de leitores vizinhos. Quando o interesse for recíproco, o BookMatch conecta vocês dois instantaneamente para a troca!
              </p>
            </div>

            {/* Ações e Alternador de Modo */}
            <div className="flex flex-wrap items-center gap-3">
              {hasBooks && (
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-line/30 bg-surface px-3.5 py-2 text-xs font-semibold text-fg-2 hover:border-turquoise hover:text-turquoise transition shadow-xs"
                  title="Configurar intenção de match"
                >
                  <SlidersHorizontal className="size-3.5 text-turquoise" />
                  <span>
                    Troca ({activeTradeCount})
                    {isSeekingDonations && ' · + Doações'}
                  </span>
                </button>
              )}

              <div className="flex items-center rounded-2xl border border-line/30 bg-surface/80 p-1.5 shadow-sm dark:bg-navy/80">
                <button
                  onClick={() => setViewMode('discover')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    viewMode === 'discover'
                      ? 'bg-turquoise text-white shadow-md shadow-turquoise/20'
                      : 'text-muted-fg hover:text-fg'
                  }`}
                >
                  <Flame className="size-4" />
                  Descoberta
                </button>
                <button
                  onClick={() => setViewMode('my_matches')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    viewMode === 'my_matches'
                      ? 'bg-turquoise text-white shadow-md shadow-turquoise/20'
                      : 'text-muted-fg hover:text-fg'
                  }`}
                >
                  <Sparkles className="size-4" />
                  Meus Matches ({confirmedMatches.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Caso o usuário não tenha livros cadastrados no acervo */}
        {!hasBooks ? (
          <div className="mx-auto max-w-2xl rounded-3xl border-2 border-dashed border-amber-500/40 bg-surface/80 p-8 sm:p-12 text-center shadow-lg backdrop-blur-md">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-yellow mb-4">
              <Lock className="size-8" />
            </div>

            <span className="inline-block rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-yellow uppercase tracking-wider mb-2">
              Acesso bloqueado temporariamente
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
              Cadastre pelo menos 1 livro para participar do Match
            </h2>

            <p className="mt-3 text-sm text-fg-2 leading-relaxed max-w-lg mx-auto">
              No <strong>BookMatch</strong>, o match é baseado em trocas reais entre leitores. Para começar a dar <em>likes</em> e receber propostas de livros compatíveis, você precisa disponibilizar pelo menos um livro no seu acervo pessoal.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/adicionar-livro">
                <Button className="gap-2 bg-gradient-to-r from-turquoise to-amber text-white font-bold hover:opacity-95 shadow-md shadow-turquoise/20 px-6">
                  <Plus className="size-4" />
                  Cadastrar meu primeiro livro
                </Button>
              </Link>
              <Link to="/biblioteca">
                <Button variant="outline" fullWidth={false} className="border-line/40 text-fg-2 hover:bg-canvas">
                  <BookOpen className="size-4" />
                  Ir para meu acervo
                </Button>
              </Link>
            </div>

            <div className="mt-8 rounded-xl bg-canvas/60 p-4 border border-line/20 text-xs text-muted flex items-center justify-center gap-2">
              <Sparkles className="size-4 text-turquoise shrink-0" />
              <span>Você pode navegar livremente pelas outras abas (Explorar, Comunidade, Grupos e Chat).</span>
            </div>
          </div>
        ) : viewMode === 'discover' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Lado Esquerdo: O Card de Descoberta / Match (Estilo Swipe Premium) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {currentBook ? (
                <div className="w-full max-w-md">
                  {/* Card Central */}
                  <div className="group relative overflow-hidden rounded-3xl border border-line/30 bg-surface shadow-xl transition-all duration-300 dark:bg-navy/90 hover:border-turquoise/40">
                    {/* Capa com Efeito Gradiente e Arte */}
                    <div
                      className={`relative flex h-80 w-full flex-col justify-between bg-gradient-to-br ${currentBook.coverGradient} p-6 text-white`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                          {currentBook.genre}
                        </span>
                        <span className="rounded-full bg-yellow/90 px-3 py-1 text-xs font-bold text-navy shadow-sm">
                          {currentBook.condition}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                          {currentBook.year} · {currentBook.pages} páginas
                        </span>
                        <h2 className="font-serif text-3xl font-bold leading-tight drop-shadow-md">
                          {currentBook.title}
                        </h2>
                        <p className="text-base font-medium text-white/90 drop-shadow">
                          {currentBook.author}
                        </p>
                      </div>
                    </div>

                    {/* Detalhes do Dono e Intenção de Troca */}
                    <div className="p-6 space-y-4">
                      {/* Dono */}
                      <div className="flex items-center justify-between pb-3 border-b border-line/20">
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 items-center justify-center rounded-2xl bg-turquoise font-bold text-white shadow-sm ring-2 ring-turquoise/20">
                            {currentBook.ownerAvatar}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-fg">{currentBook.ownerName}</h4>
                            <p className="text-xs text-turquoise">{currentBook.ownerUsername}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="flex items-center justify-end gap-1 text-xs font-medium text-fg">
                            <MapPin className="size-3.5 text-turquoise" />
                            {currentBook.neighborhood}
                          </p>
                          <span className="text-[11px] text-muted-fg font-semibold">
                            {currentBook.distance}
                          </span>
                        </div>
                      </div>

                      {/* Descrição do exemplar */}
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                          Sobre este exemplar
                        </span>
                        <p className="mt-1 text-xs text-fg-2 leading-relaxed">
                          "{currentBook.description}"
                        </p>
                      </div>

                      {/* O que o dono procura em troca */}
                      <div className="rounded-2xl border border-turquoise/30 bg-turquoise/10 p-3.5 dark:bg-turquoise/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-turquoise">
                          <Sparkles className="size-3.5" />
                          <span>O que {currentBook.ownerName.split(' ')[0]} busca em troca:</span>
                        </div>
                        <p className="mt-1 text-xs text-fg-2 font-medium">
                          {currentBook.wantsInReturn}
                        </p>
                      </div>
                    </div>

                    {/* Barra de Ações (Passar / Curtir para Match) */}
                    <div className="flex items-center justify-center gap-6 border-t border-line/20 bg-canvas/40 px-6 py-5">
                      <button
                        onClick={handlePass}
                        title="Passar livro"
                        className="group/btn flex size-14 items-center justify-center rounded-full border-2 border-line/40 bg-surface shadow-md transition-all hover:scale-110 hover:border-error hover:bg-error/10 hover:text-error"
                      >
                        <X className="size-6 text-muted-fg transition group-hover/btn:text-error" />
                      </button>

                      <div className="text-center">
                        <span className="text-[11px] font-bold text-muted-fg uppercase tracking-wider">
                          Interesse mútuo
                        </span>
                      </div>

                      <button
                        onClick={handleLike}
                        title="Curtir e buscar Match!"
                        className="group/btn flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-turquoise to-emerald-500 text-white shadow-lg shadow-turquoise/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-turquoise/50"
                      >
                        <Heart className="size-6 fill-white transition group-hover/btn:scale-110" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-fg flex items-center justify-center gap-1.5">
                    <Info className="size-3.5 text-turquoise" />
                    Use <strong>X</strong> para pular ou <strong>Coração</strong> para demonstrar interesse.
                  </p>
                </div>
              ) : (
                /* Fim da Fila */
                <div className="w-full max-w-md rounded-3xl border border-line/30 bg-surface/60 p-10 text-center shadow-lg dark:bg-navy/60">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-turquoise/20 text-turquoise">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-fg">Você viu todos os livros por perto!</h3>
                  <p className="mt-2 text-xs text-muted-fg leading-relaxed">
                    Você explorou todas as obras disponíveis na sua região por enquanto. Assim que outros leitores cadastrarem livros compatíveis, eles aparecerão aqui.
                  </p>
                  <Button onClick={handleResetDeck} variant="primary" className="mt-6 flex items-center gap-2 mx-auto">
                    <RefreshCw className="size-4" /> Recarregar sugestões
                  </Button>
                </div>
              )}
            </div>

            {/* Lado Direito: Como funciona + Seus livros na vitrine de trocas */}
            <div className="lg:col-span-5 space-y-6">
              {/* O Segredo do Match */}
              <div className="rounded-3xl border border-line/30 bg-surface/70 p-6 shadow-sm dark:bg-navy/80">
                <div className="flex items-center gap-2.5 text-yellow font-bold text-sm">
                  <Sparkles className="size-4 fill-yellow" />
                  <span>Por que o BookMatch é especial?</span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-fg">A mágica da troca de livros</h3>
                <p className="mt-2 text-xs text-muted-fg leading-relaxed">
                  Diferente de sebos ou compras comuns, aqui a circulação é <strong>humana e colaborativa</strong>. Ao curtir um livro, o sistema verifica se essa pessoa também tem interesse em algum exemplar da sua biblioteca.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl bg-canvas p-3 border border-line/20">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-turquoise text-white text-xs font-bold">
                      1
                    </span>
                    <p className="text-xs text-fg-2">
                      <strong>Você curte</strong> um livro que gostaria muito de ler.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-canvas p-3 border border-line/20">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-turquoise text-white text-xs font-bold">
                      2
                    </span>
                    <p className="text-xs text-fg-2">
                      <strong>O leitor curte</strong> um exemplar disponível na sua estante.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-canvas p-3 border border-line/20">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-yellow text-navy font-bold text-xs">
                      3
                    </span>
                    <p className="text-xs text-fg-2">
                      <strong>DEU MATCH!</strong> A sala de mensagens se abre para combinarem o local de troca.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seus Livros Disponíveis para dar Match */}
              <div className="rounded-3xl border border-line/30 bg-surface/70 p-6 shadow-sm dark:bg-navy/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-fg">Sua Estante Ativa para Matches</h4>
                  <Link to="/adicionar-livro" className="text-xs font-semibold text-turquoise hover:underline">
                    + Adicionar
                  </Link>
                </div>
                <p className="mt-1 text-xs text-muted-fg">
                  Quanto mais livros você cadastrar, maiores as chances de dar match recíproco!
                </p>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between rounded-2xl border border-line/20 bg-canvas p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-teal-900 text-white font-bold text-xs">
                        CA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-fg">Capitães da Areia</p>
                        <p className="text-[11px] text-muted-fg">Jorge Amado · Troca</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Disponível
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-line/20 bg-canvas p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-900 text-white font-bold text-xs">
                        VS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-fg">Vidas Secas</p>
                        <p className="text-[11px] text-muted-fg">Graciliano Ramos · Troca</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Disponível
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Visualização: Meus Matches Confirmados */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-fg">Seus Matches Prontos para Troca</h2>
                <p className="text-xs text-muted-fg">
                  Leitores que querem trocar livros com você agora mesmo. Inicie a conversa para combinar o encontro!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {confirmedMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-3xl border border-turquoise/30 bg-surface/80 p-6 shadow-md transition hover:border-turquoise dark:bg-navy/80"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-line/20">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-turquoise to-yellow text-navy font-bold text-sm shadow">
                        {match.userAvatar}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-fg">{match.userName}</h3>
                        <p className="text-xs text-turquoise">{match.userUsername}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="rounded-full bg-yellow/20 px-2.5 py-1 text-[11px] font-bold text-yellow">
                        Match Realizado!
                      </span>
                      <p className="mt-1 text-[10px] text-muted-fg">{match.matchedAt}</p>
                    </div>
                  </div>

                  {/* Comparativo de Troca: O que um dá x O que o outro dá */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-canvas p-4 border border-line/20">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">
                        Você recebe:
                      </span>
                      <p className="mt-1 text-xs font-bold text-fg line-clamp-1">
                        {match.theyGive.title}
                      </p>
                      <p className="text-[11px] text-muted-fg line-clamp-1">{match.theyGive.author}</p>
                    </div>

                    <div className="border-l border-line/20 pl-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">
                        Você entrega:
                      </span>
                      <p className="mt-1 text-xs font-bold text-fg line-clamp-1">
                        {match.youGive.title}
                      </p>
                      <p className="text-[11px] text-muted-fg line-clamp-1">{match.youGive.author}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-muted-fg flex items-center gap-1">
                    <MapPin className="size-3 text-turquoise" />
                    {match.distance}
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <Link to="/mensagens" className="flex-1">
                      <Button variant="primary" fullWidth className="text-xs flex items-center justify-center gap-2">
                        Abrir Conversa <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                    <Link to="/perfil">
                      <Button variant="secondary" className="text-xs">
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL / POPUP DE MATCH REALIZADO (Efeito UAU) */}
      {matchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg rounded-3xl border border-yellow/40 bg-surface p-8 text-center shadow-2xl dark:bg-navy animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-tr from-yellow to-amber-500 text-navy shadow-lg">
              <Sparkles className="size-10 fill-navy" />
            </div>

            <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-yellow">
              Troca Perfeita Encontrada!
            </span>
            <h2 className="mt-1 font-brand text-4xl text-fg">É um BookMatch!</h2>
            <p className="mt-2 text-xs text-muted-fg max-w-sm mx-auto">
              Você e <strong>{matchPopup.userName}</strong> demonstraram interesse mútuo nos livros um do outro!
            </p>

            {/* Cards lado a lado dos livros em match */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="w-36 rounded-2xl bg-canvas p-3 border border-line/30 shadow-sm text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-amber-800 text-white font-bold text-xs mb-2">
                  TA
                </div>
                <p className="text-xs font-bold text-fg line-clamp-1">{matchPopup.theyGive.title}</p>
                <p className="text-[10px] text-muted-fg">{matchPopup.userName.split(' ')[0]}</p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-full bg-yellow text-navy font-black shadow">
                ⇄
              </div>

              <div className="w-36 rounded-2xl bg-canvas p-3 border border-line/30 shadow-sm text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-800 text-white font-bold text-xs mb-2">
                  VS
                </div>
                <p className="text-xs font-bold text-fg line-clamp-1">{matchPopup.youGive.title}</p>
                <p className="text-[10px] text-muted-fg">Você ({firstName})</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link to="/mensagens" className="w-full sm:w-auto">
                <Button variant="brand" className="w-full sm:w-auto px-6 text-xs flex items-center justify-center gap-2">
                  Conversar no Chat <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setMatchPopup(null)}
                className="w-full sm:w-auto text-xs"
              >
                Continuar Deslizando
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Intenção de Troca / Doação */}
      <MatchPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onConfirm={handlePreferencesConfirm}
      />
    </div>
  )
}
