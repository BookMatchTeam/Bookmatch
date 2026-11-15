import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import {
  BookOpen,
  Plus,
  Search,
  BookMarked,
  Layers,
  Pause,
  Play,
  Trash2,
  ShieldCheck,
  Sparkles,
  Flame,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { BooksStorage, type BookItem } from '@/services/booksStorage'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function LibraryPage() {
  const { isNew } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'my_books' | 'with_me'>('my_books')
  const [search, setSearch] = useState('')
  const [modalityFilter, setModalityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [books, setBooks] = useState<BookItem[]>([])

  useEffect(() => {
    setBooks(BooksStorage.getBooks())
  }, [])

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja remover "${title}" do seu acervo?`)) {
      BooksStorage.deleteBook(id)
      setBooks(BooksStorage.getBooks())
    }
  }

  const handleToggleStatus = (id: string) => {
    BooksStorage.toggleStatus(id)
    setBooks(BooksStorage.getBooks())
  }

  // Exemplos de livros emprestados de terceiros (comigo)
  const borrowedBooks = isNew
    ? []
    : [
        {
          id: 'b-1',
          title: 'Quarto de Despejo',
          owner: 'Beatriz Mendes',
          modality: 'Empréstimo',
          dueDate: '28 de nov.',
          coverGradient: 'from-purple-700 to-indigo-950',
        },
      ]

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
    const matchesModality = modalityFilter === 'all' || book.modality === modalityFilter
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter
    return matchesSearch && matchesModality && matchesStatus
  })

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Header do Acervo Pessoal */}
      <section className="border-b border-line/20 bg-hero/25 dark:bg-navy/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              {/* Abas */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <button
                  onClick={() => setActiveTab('my_books')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                    activeTab === 'my_books'
                      ? 'bg-turquoise text-white shadow-turquoise/30'
                      : 'border border-line/30 bg-surface text-fg-2 hover:bg-surface/90'
                  }`}
                >
                  <Layers className="size-4" />
                  <span>Meu Acervo Pessoal · {books.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('with_me')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                    activeTab === 'with_me'
                      ? 'bg-turquoise text-white shadow-turquoise/30'
                      : 'border border-line/30 bg-surface text-fg-2'
                  }`}
                >
                  <BookMarked className="size-4" />
                  <span>Livros comigo · {borrowedBooks.length}</span>
                </button>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Meu Acervo Pessoal
              </h1>
              <p className="mt-1 text-xs text-muted-fg">
                Gerencie aqui os livros da sua estante. Cadastre novos exemplares para liberar a aba de Matches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {books.length > 0 && (
                <Link to="/matches">
                  <Button variant="outline" fullWidth={false} className="flex items-center gap-2 border-yellow text-amber-700 dark:text-yellow">
                    <Flame className="size-4 fill-current" />
                    Ir para o Match!
                  </Button>
                </Link>
              )}
              <Link to="/adicionar-livro">
                <Button variant="brand" fullWidth={false} className="flex items-center gap-2 px-5 py-2.5">
                  <Plus className="size-4 stroke-[2.5]" />
                  Adicionar livro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Banner se o acervo estiver vazio */}
        {books.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-yellow/50 bg-yellow/10 p-8 text-center max-w-2xl mx-auto shadow-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-yellow/20 text-amber-800 dark:text-yellow mx-auto mb-3">
              <Sparkles className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-fg">Seu acervo ainda não tem livros cadastrados</h2>
            <p className="mt-2 text-sm text-fg-2 max-w-md mx-auto">
              Para participar da aba de <strong>Matches (Tinder de Livros)</strong>, você precisa cadastrar pelo menos 1 exemplar físico.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/adicionar-livro">
                <Button variant="brand" fullWidth={false} className="inline-flex items-center justify-center gap-2 px-6">
                  <Plus className="size-4 shrink-0" />
                  <span>Cadastrar meu primeiro livro agora</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Barra de Filtros e Busca */}
        {books.length > 0 && (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-fg pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar no meu acervo por título ou autor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-line/40 bg-surface py-2 pl-10 pr-4 text-xs text-fg placeholder:text-muted-fg focus:border-turquoise focus:outline-none dark:bg-navy/80"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="h-11 rounded-xl border border-line/40 bg-surface px-4 text-xs font-semibold text-fg outline-none cursor-pointer dark:bg-navy/80"
              >
                <option value="all">Todas modalidades</option>
                <option value="Troca">Troca</option>
                <option value="Empréstimo">Empréstimo</option>
                <option value="Doação">Doação</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-xl border border-line/40 bg-surface px-4 text-xs font-semibold text-fg outline-none cursor-pointer dark:bg-navy/80"
              >
                <option value="all">Todos os status</option>
                <option value="Disponível">Disponível</option>
                <option value="Pausado">Pausado</option>
                <option value="Emprestado">Emprestado</option>
                <option value="Reservado">Reservado</option>
              </select>
            </div>
          </div>
        )}

        {/* Grade de Livros do Acervo */}
        {activeTab === 'my_books' && books.length > 0 && (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line/30 bg-surface/70 p-5 shadow-sm transition-all hover:border-turquoise/60 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {/* Capa */}
                    <div
                      className={`relative flex h-28 w-20 shrink-0 flex-col justify-between rounded-lg p-2 bg-gradient-to-br ${book.coverGradient} text-white shadow`}
                    >
                      {book.photoUrl ? (
                        <img src={book.photoUrl} alt={book.title} className="h-full w-full object-cover rounded" />
                      ) : (
                        <>
                          <BookOpen className="size-4 opacity-80" />
                          <span className="text-[10px] font-bold line-clamp-2 leading-tight">
                            {book.title}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Detalhes */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            book.status === 'Disponível'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-yellow/20 text-amber-900 dark:text-yellow'
                          }`}
                        >
                          {book.status}
                        </span>
                        <span className="text-[10px] font-semibold text-muted">
                          {book.modality}
                        </span>
                      </div>

                      <h3 className="mt-1 font-bold text-sm text-fg truncate" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-fg truncate">{book.author}</p>
                      <p className="mt-1 text-[11px] text-muted">
                        Condição: <strong className="text-fg">{book.condition}</strong>
                      </p>
                      {book.category && (
                        <p className="text-[11px] text-muted">Gênero: {book.category}</p>
                      )}
                    </div>
                  </div>

                  {/* Ações do CRUD */}
                  <div className="mt-5 flex items-center justify-between border-t border-line/20 pt-3">
                    <button
                      onClick={() => handleToggleStatus(book.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-2 hover:text-turquoise transition"
                    >
                      {book.status === 'Pausado' ? (
                        <>
                          <Play className="size-3.5 text-emerald-500" /> Ativar
                        </>
                      ) : (
                        <>
                          <Pause className="size-3.5 text-amber-500" /> Pausar
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition"
                      title="Excluir livro"
                    >
                      <Trash2 className="size-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <p className="text-center text-sm text-muted-fg py-12">
                Nenhum livro encontrado para os filtros selecionados.
              </p>
            )}
          </div>
        )}

        {/* Tab Livros Comigo */}
        {activeTab === 'with_me' && (
          <div className="space-y-4">
            {borrowedBooks.length === 0 ? (
              <div className="rounded-2xl border border-line/20 bg-surface/50 p-10 text-center text-muted-fg">
                <BookMarked className="size-8 mx-auto mb-2 text-muted stroke-1" />
                <p className="text-sm font-semibold text-fg">Nenhum livro emprestado com você no momento</p>
                <p className="text-xs mt-1">
                  Quando você pegar um livro emprestado na comunidade, o controle de devolução aparecerá aqui.
                </p>
              </div>
            ) : (
              borrowedBooks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-line/20 bg-surface/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-9 items-center justify-center rounded bg-gradient-to-br ${item.coverGradient} shadow`}
                    >
                      <BookOpen className="size-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-fg">{item.title}</h3>
                      <p className="text-xs text-muted-fg">
                        Pertence a {item.owner} · {item.modality}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] text-muted-fg">Devolução prevista</span>
                    <span className="text-xs font-bold text-yellow">{item.dueDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rodapé informativo de segurança */}
        <div className="flex items-center justify-between rounded-xl border border-line/30 bg-surface/30 px-5 py-3 text-xs text-muted-fg dark:bg-navy-950/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-turquoise shrink-0" />
            <span>Livros físicos, sem pagamentos. Combine entregas em locais públicos pelo chat.</span>
          </div>
          <span className="text-[11px] hidden sm:inline">Acervo pessoal com sincronização local.</span>
        </div>
      </main>
    </div>
  )
}
