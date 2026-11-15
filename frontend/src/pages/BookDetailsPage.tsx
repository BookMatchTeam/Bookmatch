import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import {
  BookOpen,
  ArrowLeft,
  MapPin,
  Heart,
  Share2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Repeat,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BookDetail {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  pages: number
  publishedYear: number
  synopsis: string
  condition: string
  conditionNotes: string
  modality: 'Troca' | 'Empréstimo' | 'Doação'
  coverGradient: string
  owner: {
    name: string
    username: string
    avatar: string
    location: string
    distance: string
    rating: number
    successfulTrades: number
    bio: string
  }
  whatOwnerWants?: string
}

const mockBookDatabase: Record<string, BookDetail> = {
  '1': {
    id: '1',
    title: 'A Revolução dos Bichos',
    author: 'George Orwell',
    isbn: '978-8535909555',
    category: 'Ficção Clássica / Sátira Política',
    pages: 152,
    publishedYear: 1945,
    synopsis:
      'Uma fábula alegórica sobre o poder, a corrupção e a revolução. Animais de uma fazenda se rebelam contra seus donos humanos para criar uma sociedade igualitária, mas logo descobrem que alguns animais são mais iguais que os outros.',
    condition: 'Muito bom estado',
    conditionNotes: 'Miolo limpo, sem marcações ou grifos. Leve amarelamento natural nas bordas.',
    modality: 'Empréstimo',
    coverGradient: 'from-emerald-800 via-teal-900 to-slate-950',
    owner: {
      name: 'Lucas Mendes',
      username: '@lucasmendes',
      avatar: 'LM',
      location: 'Nazaré, Belém',
      distance: 'A 1,2 km de você',
      rating: 4.9,
      successfulTrades: 14,
      bio: 'Apaixonado por clássicos modernos e distopias. Cuido dos meus livros com muito carinho.',
    },
    whatOwnerWants: 'Empresto por até 25 dias para leitores da região de Nazaré e Umarizal.',
  },
  '2': {
    id: '2',
    title: 'Torto Arado',
    author: 'Itamar Vieira Junior',
    isbn: '978-6556920252',
    category: 'Literatura Brasileira Contemporânea',
    pages: 264,
    publishedYear: 2019,
    synopsis:
      'Nas profundezas do sertão baiano, as irmãs Bibiana e Belonísia encontram uma faca misteriosa sob a cama da avó. Um acontecimento trágico une suas vidas para sempre, numa narrativa poderosa sobre terra, ancestralidade e resistência.',
    condition: 'Como novo',
    conditionNotes: 'Exemplar lido apenas uma vez, sem dobras ou desgastes.',
    modality: 'Troca',
    coverGradient: 'from-amber-600 via-amber-800 to-stone-950',
    owner: {
      name: 'Mariana Silva',
      username: '@marianas',
      avatar: 'MS',
      location: 'Umarizal, Belém',
      distance: 'A 1,4 km de você',
      rating: 5.0,
      successfulTrades: 9,
      bio: 'Leitora de ficção latino-americana e poesia. Adoro trocar livros em cafés.',
    },
    whatOwnerWants: 'Tenho interesse em Clarice Lispector, Carla Madeira ou ficção brasileira contemporânea.',
  },
  '3': {
    id: '3',
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    isbn: '978-8522031443',
    category: 'Infantojuvenil / Filosofia',
    pages: 96,
    publishedYear: 1943,
    synopsis:
      'Um piloto cai no deserto do Saara e encontra um jovem príncipe vindo de um asteroide distante. Uma fábula poética sobre amizade, amor, perda e a beleza essencial que é invisível aos olhos.',
    condition: 'Bom estado',
    conditionNotes: 'Capa ilustrada conservada, páginas firmes e sem anotações.',
    modality: 'Doação',
    coverGradient: 'from-blue-700 via-indigo-900 to-slate-950',
    owner: {
      name: 'Beatriz Lima',
      username: '@biamendes',
      avatar: 'BL',
      location: 'Batista Campos, Belém',
      distance: 'A 800 m de você',
      rating: 4.8,
      successfulTrades: 6,
      bio: 'Dando nova vida a livros que marcaram minha infância e juventude.',
    },
    whatOwnerWants: 'Doação livre para quem tiver interesse e compromisso com a leitura.',
  },
  '4': {
    id: '4',
    title: 'Cem Anos de Solidão',
    author: 'Gabriel García Márquez',
    isbn: '978-8501012074',
    category: 'Realismo Mágico',
    pages: 448,
    publishedYear: 1967,
    synopsis:
      'A saga monumental da família Buendía na mítica aldeia de Macondo. Gerações marcadas pela solidão, guerras, paixões e maravilhas cotidianas que definiram o realismo mágico latino-americano.',
    condition: 'Ótimo estado',
    conditionNotes: 'Edição de colecionador muito bem preservada.',
    modality: 'Troca',
    coverGradient: 'from-purple-800 via-indigo-950 to-stone-950',
    owner: {
      name: 'Rodrigo Castro',
      username: '@rodrigoc',
      avatar: 'RC',
      location: 'Marco, Belém',
      distance: 'A 3,5 km de você',
      rating: 4.9,
      successfulTrades: 21,
      bio: 'Fã incondicional de García Márquez, Cortázar e literatura fantástica.',
    },
    whatOwnerWants: 'Busco ensaios filosóficos, biografias históricas ou quadrinhos encadernados.',
  },
}

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [proposalSent, setProposalSent] = useState(false)

  // Seleciona o livro pelo ID ou fallback para o primeiro
  const book = (id && mockBookDatabase[id]) ? mockBookDatabase[id] : mockBookDatabase['2']

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Top Navigation Bar */}
      <div className="border-b border-line/20 bg-surface/50 py-3 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-muted-fg hover:text-fg transition"
          >
            <ArrowLeft className="size-4" />
            Voltar para a lista
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Compartilhar livro"
              className="flex items-center gap-1.5 rounded-xl border border-line/30 bg-surface px-3 py-1.5 text-xs font-semibold text-fg-2 hover:bg-canvas transition"
            >
              <Share2 className="size-3.5" />
              <span>{copiedLink ? 'Link copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={() => setLiked(!liked)}
              title={liked ? 'Remover dos favoritos' : 'Favoritar livro'}
              className={`flex size-8 items-center justify-center rounded-xl border transition ${
                liked
                  ? 'border-rose-500/40 bg-rose-500/15 text-rose-500'
                  : 'border-line/30 bg-surface text-muted-fg hover:text-rose-500'
              }`}
            >
              <Heart className={`size-4 ${liked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LADO ESQUERDO: Capa e Proposta Rápida (4 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Capa com moldura editorial */}
            <div className="relative overflow-hidden rounded-3xl border border-line/30 bg-surface shadow-xl dark:bg-navy/90 p-6 flex flex-col items-center">
              <div
                className={`relative flex h-80 w-56 flex-col justify-between rounded-2xl bg-gradient-to-br ${book.coverGradient} p-5 text-white shadow-2xl ring-1 ring-white/10`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur">
                    Físico
                  </span>
                  <BookOpen className="size-5 opacity-80" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                    {book.category.split('/')[0]}
                  </span>
                  <h1 className="font-serif text-2xl font-bold leading-snug drop-shadow-md">
                    {book.title}
                  </h1>
                  <p className="text-xs font-medium text-white/90 drop-shadow">{book.author}</p>
                </div>
              </div>

              {/* Badges de Modalidade e Estado */}
              <div className="mt-6 flex w-full items-center justify-center gap-3">
                <span className="rounded-xl bg-yellow/20 px-3.5 py-1.5 text-xs font-bold text-yellow border border-yellow/30">
                  {book.modality}
                </span>
                <span className="rounded-xl bg-canvas px-3.5 py-1.5 text-xs font-semibold text-fg-2 border border-line/30">
                  {book.condition}
                </span>
              </div>
            </div>

            {/* Ação Primária do Diferencial BookMatch */}
            <div className="rounded-3xl border border-line/30 bg-surface/80 p-6 shadow-sm dark:bg-navy/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-turquoise">
                <Sparkles className="size-4" />
                <span>Interesse mútuo no BookMatch</span>
              </div>

              {proposalSent ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2" />
                  <h4 className="text-sm font-bold text-fg">Interesse enviado com sucesso!</h4>
                  <p className="mt-1 text-xs text-muted-fg">
                    Avisamos <strong>{book.owner.name.split(' ')[0]}</strong>. Se houver interesse mútuo, o Match é confirmado e o chat se abre!
                  </p>
                  <Link to="/matches">
                    <Button variant="secondary" className="mt-3 text-xs">
                      Ver Meus Matches
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-fg leading-relaxed">
                    Demonstre interesse neste exemplar. Se {book.owner.name.split(' ')[0]} também curtir um de seus livros, vocês darão <strong>Match</strong> na hora!
                  </p>

                  <Button
                    variant="brand"
                    fullWidth
                    onClick={() => setProposalSent(true)}
                    className="flex items-center justify-center gap-2 text-sm shadow-md py-3"
                  >
                    {book.modality === 'Troca' ? (
                      <>
                        <Repeat className="size-4" /> Curtir para Troca (Dar Match)
                      </>
                    ) : book.modality === 'Empréstimo' ? (
                      <>
                        <Calendar className="size-4" /> Solicitar Empréstimo
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" /> Demonstrar Interesse na Doação
                      </>
                    )}
                  </Button>

                  <Link to="/mensagens" className="block">
                    <Button variant="secondary" fullWidth className="flex items-center justify-center gap-2 text-xs">
                      <Send className="size-3.5" /> Enviar Mensagem Direta
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* LADO DIREITO: Detalhes, Sinopse e Dono (7 colunas) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Cabeçalho do Livro */}
            <div className="rounded-3xl border border-line/30 bg-surface/80 p-6 shadow-sm dark:bg-navy/80">
              <span className="rounded-md bg-turquoise/15 px-2.5 py-1 text-xs font-semibold text-turquoise">
                {book.category}
              </span>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-fg">
                {book.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-fg">Por {book.author}</p>

              {/* Ficha técnica em pílulas */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-line/20 pt-4">
                <div className="rounded-2xl bg-canvas p-3 border border-line/20">
                  <span className="block text-[10px] uppercase font-bold text-muted-fg">Páginas</span>
                  <span className="text-sm font-bold text-fg">{book.pages}</span>
                </div>
                <div className="rounded-2xl bg-canvas p-3 border border-line/20">
                  <span className="block text-[10px] uppercase font-bold text-muted-fg">Publicação</span>
                  <span className="text-sm font-bold text-fg">{book.publishedYear}</span>
                </div>
                <div className="rounded-2xl bg-canvas p-3 border border-line/20">
                  <span className="block text-[10px] uppercase font-bold text-muted-fg">Formato</span>
                  <span className="text-sm font-bold text-fg">Físico</span>
                </div>
                <div className="rounded-2xl bg-canvas p-3 border border-line/20">
                  <span className="block text-[10px] uppercase font-bold text-muted-fg">ISBN</span>
                  <span className="text-xs font-mono font-bold text-fg truncate block" title={book.isbn}>
                    {book.isbn}
                  </span>
                </div>
              </div>
            </div>

            {/* Sinopse da Obra */}
            <div className="rounded-3xl border border-line/30 bg-surface/80 p-6 shadow-sm dark:bg-navy/80">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-fg">
                Sinopse da obra
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-2">
                {book.synopsis}
              </p>
            </div>

            {/* Estado de Conservação do Exemplar Físico */}
            <div className="rounded-3xl border border-line/30 bg-surface/80 p-6 shadow-sm dark:bg-navy/80 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-fg flex items-center gap-2">
                <Layers className="size-4 text-turquoise" />
                Conservação do exemplar físico
              </h3>
              <div className="rounded-2xl bg-canvas p-4 border border-line/20">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-fg">{book.condition}</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-fg leading-relaxed">
                  "{book.conditionNotes}"
                </p>
              </div>

              {book.whatOwnerWants && (
                <div className="rounded-2xl border border-yellow/30 bg-yellow/10 p-4">
                  <span className="text-xs font-bold text-yellow uppercase tracking-wider">
                    Preferência de troca do leitor
                  </span>
                  <p className="mt-1 text-xs text-fg font-medium">
                    {book.whatOwnerWants}
                  </p>
                </div>
              )}
            </div>

            {/* Perfil do Dono do Livro */}
            <div className="rounded-3xl border border-line/30 bg-surface/80 p-6 shadow-sm dark:bg-navy/80">
              <div className="flex items-center justify-between pb-4 border-b border-line/20">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-turquoise to-yellow text-navy font-bold text-base shadow">
                    {book.owner.avatar}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-fg">{book.owner.name}</h4>
                    <p className="text-xs text-turquoise">{book.owner.username}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-fg">
                      <MapPin className="size-3 text-turquoise" />
                      {book.owner.location} · <strong>{book.owner.distance}</strong>
                    </p>
                  </div>
                </div>

                <Link to="/perfil">
                  <Button variant="secondary" className="text-xs h-9 px-3.5">
                    Ver Estante
                  </Button>
                </Link>
              </div>

              <p className="mt-3.5 text-xs text-fg-2 leading-relaxed">
                "{book.owner.bio}"
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs">
                <span className="font-semibold text-fg">
                  ⭐ <strong className="text-yellow">{book.owner.rating}</strong> na comunidade
                </span>
                <span className="h-3 w-px bg-line/30" />
                <span className="text-muted-fg">
                  <strong className="text-fg">{book.owner.successfulTrades}</strong> trocas concluídas
                </span>
              </div>
            </div>

            {/* Segurança e Dicas de Encontro */}
            <div className="rounded-2xl border border-turquoise/20 bg-turquoise/5 p-4 flex items-center gap-3">
              <ShieldCheck className="size-5 text-turquoise shrink-0" />
              <p className="text-xs text-fg-2 leading-relaxed">
                Recomendamos combinar a entrega dos livros em locais públicos e movimentados (como cafés, praças ou estações) pelo chat do BookMatch.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
