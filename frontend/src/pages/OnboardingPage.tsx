import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronRight,
  Search,
  BookOpen,
  Flame,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import logo from '@/assets/logo.svg'

interface GenreOption {
  id: string
  name: string
  emoji: string
  description: string
  color: string
}

interface BookOption {
  id: string
  title: string
  author: string
  genre: string
  gradient: string
  year: number
}

const AVAILABLE_GENRES: GenreOption[] = [
  { id: 'ficcao-cientifica', name: 'Ficção Científica', emoji: '🚀', description: 'Viagens no tempo, distopias e futuros', color: 'from-blue-600 to-indigo-900' },
  { id: 'fantasia', name: 'Fantasia', emoji: '🐉', description: 'Magia, reinos épicos e aventuras', color: 'from-purple-600 to-violet-950' },
  { id: 'romance', name: 'Romance', emoji: '💌', description: 'Amores intensos e histórias emocionantes', color: 'from-rose-500 to-pink-900' },
  { id: 'suspense', name: 'Suspense & Mistério', emoji: '🕵️', description: 'Crimes instigantes, plot twists e enigmas', color: 'from-slate-700 to-zinc-950' },
  { id: 'terror', name: 'Terror & Horror', emoji: '🕯️', description: 'Sobrenatural, psicológico e tensão', color: 'from-amber-900 to-stone-950' },
  { id: 'literatura-br', name: 'Literatura Brasileira', emoji: '🇧🇷', description: 'Grandes clássicos e vozes contemporâneas', color: 'from-emerald-600 to-teal-950' },
  { id: 'desenvolvimento', name: 'Desenvolvimento Pessoal', emoji: '🌱', description: 'Hábitos, mentalidade e produtividade', color: 'from-cyan-600 to-blue-900' },
  { id: 'filosofia', name: 'Filosofia & Sociologia', emoji: '🏛️', description: 'Reflexões sobre a sociedade e o ser humano', color: 'from-amber-700 to-yellow-950' },
  { id: 'biografia', name: 'Biografias & Memórias', emoji: '📜', description: 'Vidas reais e histórias inspiradoras', color: 'from-teal-600 to-slate-900' },
  { id: 'historia', name: 'História & Política', emoji: '🌍', description: 'Eventos mundiais, épocas e reflexões', color: 'from-orange-700 to-stone-900' },
  { id: 'manga-hq', name: 'Mangás & Quadrinhos', emoji: '🎨', description: 'Narrativas visuais e graphic novels', color: 'from-fuchsia-600 to-pink-950' },
  { id: 'poesia', name: 'Poesia', emoji: '🪶', description: 'Versos, sensibilidade e ritmo', color: 'from-violet-500 to-purple-900' },
]

const SAMPLE_BOOKS: BookOption[] = [
  { id: 'b-1', title: 'Duna', author: 'Frank Herbert', genre: 'Ficção Científica', gradient: 'from-orange-600 to-amber-950', year: 1965 },
  { id: 'b-2', title: 'Torto Arado', author: 'Itamar Vieira Junior', genre: 'Literatura Brasileira', gradient: 'from-amber-700 to-stone-950', year: 2019 },
  { id: 'b-3', title: 'O Nome do Vento', author: 'Patrick Rothfuss', genre: 'Fantasia', gradient: 'from-emerald-700 to-teal-950', year: 2007 },
  { id: 'b-4', title: '1984', author: 'George Orwell', genre: 'Ficção Científica', gradient: 'from-zinc-700 to-slate-950', year: 1949 },
  { id: 'b-5', title: 'Orgulho e Preconceito', author: 'Jane Austen', genre: 'Romance', gradient: 'from-rose-600 to-pink-950', year: 1813 },
  { id: 'b-6', title: 'O Iluminado', author: 'Stephen King', genre: 'Terror & Horror', gradient: 'from-red-800 to-stone-950', year: 1977 },
  { id: 'b-7', title: 'Sapiens: Uma Breve História', author: 'Yuval Noah Harari', genre: 'História & Política', gradient: 'from-cyan-700 to-slate-950', year: 2014 },
  { id: 'b-8', title: 'A Paciente Silenciosa', author: 'Alex Michaelides', genre: 'Suspense & Mistério', gradient: 'from-teal-800 to-slate-950', year: 2019 },
  { id: 'b-9', title: 'Capitães da Areia', author: 'Jorge Amado', genre: 'Literatura Brasileira', gradient: 'from-yellow-700 to-amber-950', year: 1937 },
  { id: 'b-10', title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', genre: 'Fantasia', gradient: 'from-lime-800 to-zinc-950', year: 1954 },
  { id: 'b-11', title: 'Hábitos Atômicos', author: 'James Clear', genre: 'Desenvolvimento Pessoal', gradient: 'from-blue-700 to-sky-950', year: 2018 },
  { id: 'b-12', title: 'A Redoma de Vidro', author: 'Sylvia Plath', genre: 'Romance', gradient: 'from-indigo-700 to-slate-950', year: 1963 },
  { id: 'b-13', title: 'Neuromancer', author: 'William Gibson', genre: 'Ficção Científica', gradient: 'from-cyan-600 to-slate-900', year: 1984 },
  { id: 'b-14', title: 'Cem Anos de Solidão', author: 'Gabriel García Márquez', genre: 'Literatura Brasileira', gradient: 'from-purple-800 to-stone-950', year: 1967 },
  { id: 'b-15', title: 'Garota Exemplar', author: 'Gillian Flynn', genre: 'Suspense & Mistério', gradient: 'from-blue-900 to-slate-950', year: 2012 },
  { id: 'b-16', title: 'Flores para Algernon', author: 'Daniel Keyes', genre: 'Ficção Científica', gradient: 'from-sky-700 to-indigo-950', year: 1959 },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const MIN_GENRES = 3
  const MIN_BOOKS = 3

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    )
  }

  const toggleBook = (bookId: string) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    )
  }

  const handleFinish = () => {
    // Salva preferências no localStorage
    localStorage.setItem('bm_onboarding_completed', 'true')
    localStorage.setItem(
      'bm_user_preferences',
      JSON.stringify({
        genres: selectedGenres,
        favoriteBooks: selectedBooks,
        completedAt: new Date().toISOString(),
      })
    )

    // Direciona para a tela de configuração inicial da conta do leitor
    navigate('/configurar-perfil')
  }

  // Livros filtrados por busca e afinidade com gêneros selecionados
  const filteredBooks = SAMPLE_BOOKS.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  }).sort((a, b) => {
    // Dá prioridade visual aos livros correspondentes aos gêneros escolhidos no passo 1
    const aGenreMatched = selectedGenres.some((g) => {
      const gObj = AVAILABLE_GENRES.find((item) => item.id === g)
      return gObj?.name === a.genre
    })
    const bGenreMatched = selectedGenres.some((g) => {
      const gObj = AVAILABLE_GENRES.find((item) => item.id === g)
      return gObj?.name === b.genre
    })
    if (aGenreMatched && !bGenreMatched) return -1
    if (!aGenreMatched && bGenreMatched) return 1
    return 0
  })

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      {/* Barra de progresso / Header estilo YouTube Music */}
      <header className="sticky top-0 z-30 border-b border-line/20 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="BookMatch" className="h-8 w-auto" />
            <span className="hidden font-brand text-xl text-turquoise sm:inline">
              Book<span className="text-yellow">Match</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-fg-2">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs transition-colors ${
                  step === 1 ? 'bg-turquoise text-white font-bold' : 'bg-turquoise/20 text-turquoise'
                }`}
              >
                1
              </span>
              <span className={step === 1 ? 'font-bold text-fg' : ''}>Gêneros</span>

              <ChevronRight className="size-3.5 text-muted" />

              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs transition-colors ${
                  step === 2 ? 'bg-turquoise text-white font-bold' : 'bg-line/30 text-muted'
                }`}
              >
                2
              </span>
              <span className={step === 2 ? 'font-bold text-fg' : 'text-muted'}>Livros</span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="text-xs font-semibold text-muted hover:text-fg transition-colors"
          >
            Pular
          </button>
        </div>

        {/* Linha de progresso no topo */}
        <div className="h-1 w-full bg-line/20">
          <div
            className="h-1 bg-gradient-to-r from-turquoise to-yellow transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 pb-28">
        {step === 1 ? (
          <div>
            {/* Cabeçalho Passo 1 */}
            <div className="text-center max-w-xl mx-auto mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-turquoise/10 px-3.5 py-1 text-xs font-semibold text-turquoise mb-3">
                <Compass className="size-3.5" />
                Passo 1 de 2 • Personalize seu radar
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-fg">
                Quais gêneros fazem seu coração bater mais forte?
              </h1>
              <p className="mt-3 text-sm sm:text-base text-fg-2">
                Igual no seu app de músicas favorito: escolha pelo menos{' '}
                <strong className="text-turquoise">{MIN_GENRES} gêneros</strong> para calibrarmos os
                leitores e livros compatíveis na sua região.
              </p>
            </div>

            {/* Grid de Gêneros interativos */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {AVAILABLE_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id)
                return (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    type="button"
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'border-turquoise bg-gradient-to-br from-turquoise/20 to-turquoise/5 shadow-md shadow-turquoise/10 ring-2 ring-turquoise ring-offset-2 ring-offset-surface dark:ring-offset-navy-950'
                        : 'border-line/30 bg-surface hover:border-line hover:bg-canvas/60'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className="text-2xl sm:text-3xl">{genre.emoji}</span>
                      <div
                        className={`flex size-6 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? 'border-turquoise bg-turquoise text-white'
                            : 'border-line/40 bg-surface/80 text-transparent group-hover:border-line'
                        }`}
                      >
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <h2 className="font-bold text-sm sm:text-base text-fg group-hover:text-turquoise transition-colors">
                        {genre.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted line-clamp-2">
                        {genre.description}
                      </p>
                    </div>

                    {/* Destaque sutil de cor no rodapé */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${genre.color} ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                      } transition-opacity`}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* Cabeçalho Passo 2 */}
            <div className="text-center max-w-xl mx-auto mb-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow/20 px-3.5 py-1 text-xs font-semibold text-amber-900 dark:text-yellow mb-3">
                <Flame className="size-3.5" />
                Passo 2 de 2 • Seus livros favoritos
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-fg">
                Escolha livros ou autores que você adora
              </h1>
              <p className="mt-3 text-sm sm:text-base text-fg-2">
                Selecione pelo menos <strong className="text-yellow">{MIN_BOOKS} títulos</strong>. Isso
                cria seu perfil de afinidade imediato para o algoritmo de match com outros leitores!
              </p>
            </div>

            {/* Barra de pesquisa de livros */}
            <div className="relative mx-auto max-w-md mb-8">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor ou gênero..."
                className="w-full rounded-full border border-line/40 bg-surface py-2.5 pl-10 pr-4 text-sm text-fg shadow-inner placeholder:text-muted focus:border-turquoise focus:outline-none focus:ring-2 focus:ring-turquoise/20"
              />
            </div>

            {/* Grid de Livros estilo YouTube Music Card */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filteredBooks.map((book) => {
                const isSelected = selectedBooks.includes(book.id)
                return (
                  <button
                    key={book.id}
                    onClick={() => toggleBook(book.id)}
                    type="button"
                    className={`group relative flex flex-col items-center rounded-2xl border p-3.5 text-center transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'border-turquoise bg-gradient-to-b from-turquoise/15 to-surface shadow-md ring-2 ring-turquoise ring-offset-2 ring-offset-surface dark:ring-offset-navy-950'
                        : 'border-line/30 bg-surface hover:border-line hover:bg-canvas/50'
                    }`}
                  >
                    {/* Mock da Capa do Livro */}
                    <div
                      className={`relative mb-3 flex h-36 w-24 flex-col justify-between rounded-lg p-2.5 shadow-md bg-gradient-to-br ${book.gradient} text-white transition-transform group-hover:scale-105`}
                    >
                      <div className="flex justify-between items-start">
                        <BookOpen className="size-3.5 opacity-80" />
                        <span className="text-[10px] font-bold opacity-75">{book.year}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold leading-tight line-clamp-3">{book.title}</p>
                        <p className="text-[9px] opacity-80 line-clamp-1 mt-0.5">{book.author}</p>
                      </div>

                      {/* Selo de selecionado sobre a capa */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-navy-950/60 backdrop-blur-[1px]">
                          <div className="flex size-8 items-center justify-center rounded-full bg-turquoise text-white shadow-lg animate-scale-up">
                            <Check className="size-5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <h3 className="w-full truncate font-bold text-sm text-fg group-hover:text-turquoise transition-colors">
                      {book.title}
                    </h3>
                    <p className="w-full truncate text-xs text-muted mt-0.5">{book.author}</p>
                    <span className="mt-1.5 inline-block rounded-md bg-canvas px-2 py-0.5 text-[10px] font-medium text-fg-2 border border-line/20">
                      {book.genre}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Barra Fixa Inferior com Ação e Contador */}
      <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-line/20 bg-surface/95 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="text-sm">
            {step === 1 ? (
              <p className="text-fg-2">
                <span className="font-bold text-fg">
                  {selectedGenres.length} de {MIN_GENRES}
                </span>{' '}
                gêneros selecionados
                {selectedGenres.length >= MIN_GENRES && (
                  <span className="ml-2 text-success font-semibold">✓ Ótimo gosto!</span>
                )}
              </p>
            ) : (
              <p className="text-fg-2">
                <span className="font-bold text-fg">
                  {selectedBooks.length} de {MIN_BOOKS}
                </span>{' '}
                livros selecionados
                {selectedBooks.length >= MIN_BOOKS && (
                  <span className="ml-2 text-success font-semibold">✓ Pronto para o Match!</span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 2 && (
              <Button
                variant="outline"
                fullWidth={false}
                onClick={() => setStep(1)}
                className="hidden sm:inline-flex px-4 whitespace-nowrap"
              >
                Voltar aos gêneros
              </Button>
            )}

            {step === 1 ? (
              <Button
                fullWidth={false}
                onClick={() => setStep(2)}
                disabled={selectedGenres.length < MIN_GENRES}
                className="inline-flex items-center justify-center gap-2 px-5 bg-turquoise text-white hover:bg-turquoise/90 disabled:opacity-50 whitespace-nowrap"
              >
                <span>Continuar para Livros</span>
                <ChevronRight className="size-4 shrink-0" />
              </Button>
            ) : (
              <Button
                fullWidth={false}
                onClick={handleFinish}
                disabled={selectedBooks.length < MIN_BOOKS}
                className="inline-flex items-center justify-center gap-2 px-5 bg-gradient-to-r from-turquoise to-amber hover:opacity-95 text-white font-bold disabled:opacity-50 shadow-md shadow-turquoise/20 whitespace-nowrap"
              >
                <span>Configurar minha conta</span>
                <ChevronRight className="size-4 shrink-0" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
