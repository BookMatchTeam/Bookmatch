import { useState, useEffect } from 'react'
import {
  Shuffle,
  HeartHandshake,
  Check,
  Plus,
  BookOpen,
  X,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BooksStorage, type BookItem, type WishlistBook } from '@/services/booksStorage'

interface MatchPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedBookIds: string[], seekingDonations: boolean) => void
}

export function MatchPreferencesModal({
  isOpen,
  onClose,
  onConfirm,
}: MatchPreferencesModalProps) {
  const [myBooks, setMyBooks] = useState<BookItem[]>([])
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([])
  const [seekingDonations, setSeekingDonations] = useState(false)
  
  // Pedido de doação
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [donationTitle, setDonationTitle] = useState('')
  const [donationAuthor, setDonationAuthor] = useState('')
  const [donationReason, setDonationReason] = useState('')
  const [wishlist, setWishlist] = useState<WishlistBook[]>([])

  useEffect(() => {
    if (isOpen) {
      const books = BooksStorage.getBooks()
      setMyBooks(books)
      const currentWish = BooksStorage.getWishlist()
      setWishlist(currentWish)

      const savedPrefs = BooksStorage.getMatchPreferences()
      if (savedPrefs && savedPrefs.selectedBookIdsForTrade.length > 0) {
        setSelectedBookIds(savedPrefs.selectedBookIdsForTrade)
        setSeekingDonations(savedPrefs.seekingDonations)
      } else {
        // Por padrão marca todos os livros disponíveis para troca
        setSelectedBookIds(books.map((b) => b.id))
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleBook = (id: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleAddDonationRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!donationTitle.trim()) return

    BooksStorage.addWishlistBook({
      title: donationTitle.trim(),
      author: donationAuthor.trim() || 'Autor não especificado',
      reason: donationReason.trim() || undefined,
      type: 'Doação',
    })

    setWishlist(BooksStorage.getWishlist())
    setDonationTitle('')
    setDonationAuthor('')
    setDonationReason('')
    setShowDonationForm(false)
    setSeekingDonations(true)
  }

  const handleRemoveWish = (id: string) => {
    BooksStorage.removeWishlistBook(id)
    setWishlist(BooksStorage.getWishlist())
  }

  const handleApply = () => {
    BooksStorage.saveMatchPreferences({
      selectedBookIdsForTrade: selectedBookIds,
      seekingDonations,
    })
    onConfirm(selectedBookIds, seekingDonations)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-line/30 bg-surface shadow-2xl overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-line/20 px-6 py-5 bg-hero/20 dark:bg-navy/40">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-turquoise to-amber text-white shadow-sm">
              <Shuffle className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-fg">Configurar intenção de Match</h2>
              <p className="text-xs text-muted-fg">
                Personalize o que você coloca para rolo hoje ou peça livros por doação
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-fg hover:bg-canvas hover:text-fg transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seção 1: Livros do Acervo para Troca */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                  <Flame className="size-4 text-amber-500" />
                  Quais livros do seu acervo você quer disponibilizar para troca?
                </h3>
                <p className="text-xs text-muted">
                  Selecione os exemplares que você está aberto a passar adiante neste momento:
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (selectedBookIds.length === myBooks.length) {
                    setSelectedBookIds([])
                  } else {
                    setSelectedBookIds(myBooks.map((b) => b.id))
                  }
                }}
                className="text-xs font-semibold text-turquoise hover:underline shrink-0"
              >
                {selectedBookIds.length === myBooks.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {myBooks.map((book) => {
                const isSelected = selectedBookIds.includes(book.id)
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => toggleBook(book.id)}
                    className={`flex items-center justify-between rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-turquoise bg-turquoise/10 shadow-sm ring-1 ring-turquoise'
                        : 'border-line/30 bg-canvas/60 hover:border-line'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${book.coverGradient} text-white shadow-xs`}
                      >
                        <BookOpen className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-fg truncate">{book.title}</h4>
                        <p className="text-[11px] text-muted truncate">{book.author}</p>
                        <span className="text-[10px] text-turquoise font-medium">{book.modality}</span>
                      </div>
                    </div>

                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition ${
                        isSelected
                          ? 'border-turquoise bg-turquoise text-white'
                          : 'border-line/40 bg-surface'
                      }`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedBookIds.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-yellow font-semibold">
                ⚠️ Selecione pelo menos 1 livro para poder gerar trocas mútuas nos matches.
              </p>
            )}
          </div>

          <hr className="border-line/20" />

          {/* Seção 2: Pedido de Doação */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                  <HeartHandshake className="size-4 text-rose-500" />
                  Gostaria de receber livros por doação?
                </h3>
                <p className="text-xs text-muted">
                  Ative esta opção se você também deseja ver exemplares gratuitos doados por outros leitores na sua região.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={seekingDonations}
                  onChange={(e) => setSeekingDonations(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-line/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-turquoise"></div>
              </label>
            </div>

            {/* Lista de livros desejados por doação */}
            <div className="rounded-2xl border border-line/30 bg-surface/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fg">
                  Livros que você gostaria de receber ({wishlist.length})
                </span>
                {!showDonationForm && (
                  <button
                    type="button"
                    onClick={() => setShowDonationForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-turquoise hover:underline"
                  >
                    <Plus className="size-3.5" />
                    Adicionar livro desejado
                  </button>
                )}
              </div>

              {/* Formulário para cadastrar livro que quer receber */}
              {showDonationForm && (
                <form
                  onSubmit={handleAddDonationRequest}
                  className="rounded-xl border border-turquoise/40 bg-turquoise/5 p-4 space-y-3"
                >
                  <h4 className="text-xs font-bold text-fg flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-yellow" />
                    Cadastrar livro para doação
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Título do livro *"
                      placeholder="Ex: O Pequeno Príncipe"
                      value={donationTitle}
                      onChange={(e) => setDonationTitle(e.target.value)}
                      required
                    />
                    <Input
                      label="Autor ou autora"
                      placeholder="Ex: Saint-Exupéry"
                      value={donationAuthor}
                      onChange={(e) => setDonationAuthor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-fg mb-1">
                      Por que gostaria de receber este livro? (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Para estudos na faculdade, leitura com os filhos..."
                      value={donationReason}
                      onChange={(e) => setDonationReason(e.target.value)}
                      className="w-full rounded-lg border border-line/30 bg-surface p-2 text-xs text-fg focus:border-turquoise focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth={false}
                      onClick={() => setShowDonationForm(false)}
                      className="text-xs h-9 px-3"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="brand"
                      fullWidth={false}
                      className="text-xs h-9 px-4"
                    >
                      Salvar pedido de doação
                    </Button>
                  </div>
                </form>
              )}

              {/* Itens já cadastrados */}
              <div className="space-y-2">
                {wishlist.length === 0 && !showDonationForm && (
                  <p className="text-xs text-muted-fg italic py-2 text-center">
                    Nenhum livro cadastrado para doação ainda. Clique em "Adicionar livro desejado" acima para cadastrar títulos que você sonha em receber!
                  </p>
                )}
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-line/20 bg-surface p-2.5"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-fg truncate">{item.title}</p>
                      <p className="text-[11px] text-muted truncate">{item.author}</p>
                      {item.reason && (
                        <p className="text-[10px] text-turquoise/90 italic truncate mt-0.5">
                          "{item.reason}"
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWish(item.id)}
                      className="text-muted hover:text-red-500 p-1 transition"
                      title="Remover"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-between border-t border-line/20 px-6 py-4 bg-surface">
          <p className="text-xs text-muted">
            <span className="font-bold text-fg">{selectedBookIds.length}</span> livro(s) ativos para troca
            {seekingDonations && <span className="text-turquoise ml-1 font-semibold">+ Doações ativas</span>}
          </p>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              onClick={onClose}
              className="text-xs h-10 px-4"
            >
              Agora não
            </Button>
            <Button
              type="button"
              fullWidth={false}
              onClick={handleApply}
              disabled={selectedBookIds.length === 0 && !seekingDonations}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-turquoise to-amber text-white font-bold hover:opacity-95 shadow-md shadow-turquoise/20 px-6 h-10 text-xs"
            >
              <span>Aplicar e começar o Swipe</span>
              <ArrowRight className="size-4 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

