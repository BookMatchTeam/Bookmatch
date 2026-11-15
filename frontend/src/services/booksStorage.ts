export interface BookItem {
  id: string
  title: string
  author: string
  category: string
  modality: 'Troca' | 'Doação' | 'Empréstimo'
  condition: 'Novo' | 'Ótimo estado' | 'Bom estado' | 'Marcas de uso'
  location: string
  status: 'Disponível' | 'Reservado' | 'Emprestado' | 'Pausado'
  statusNote?: string
  recipient?: string
  coverGradient: string
  photoUrl?: string
  notes?: string
  year?: string
  publisher?: string
  createdAt: string
}

export interface WishlistBook {
  id: string
  title: string
  author: string
  reason?: string
  type: 'Troca' | 'Doação'
  createdAt: string
}

const STORAGE_KEY = 'bm_user_books'
const WISHLIST_STORAGE_KEY = 'bm_user_wishlist'
const MATCH_SESSION_KEY = 'bm_match_preferences'

export const DEFAULT_INITIAL_BOOKS: BookItem[] = [
  {
    id: 'b-def-1',
    title: 'O pequeno príncipe',
    author: 'Antoine de Saint-Exupéry',
    category: 'Infantojuvenil',
    modality: 'Troca',
    condition: 'Bom estado',
    location: 'Na sua estante · Nazaré',
    status: 'Disponível',
    coverGradient: 'from-sky-500 to-indigo-800',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-def-2',
    title: 'Capitães da areia',
    author: 'Jorge Amado',
    category: 'Literatura Brasileira',
    modality: 'Troca',
    condition: 'Ótimo estado',
    location: 'Na sua estante · Nazaré',
    status: 'Disponível',
    coverGradient: 'from-amber-600 to-orange-950',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-def-3',
    title: 'A hora da estrela',
    author: 'Clarice Lispector',
    category: 'Literatura Brasileira',
    modality: 'Doação',
    condition: 'Bom estado',
    location: 'Para Camila · retirada a combinar',
    status: 'Reservado',
    recipient: 'Camila',
    coverGradient: 'from-rose-600 to-red-950',
    createdAt: new Date().toISOString(),
  },
]

export const BooksStorage = {
  getBooks(): BookItem[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const isConfigured = localStorage.getItem('bm_first_book_registered')
      if (isConfigured === 'true') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_BOOKS))
        return DEFAULT_INITIAL_BOOKS
      }
      return []
    }
    try {
      return JSON.parse(raw) as BookItem[]
    } catch {
      return []
    }
  },

  hasRegisteredBooks(): boolean {
    const books = this.getBooks()
    return books.length > 0
  },

  addBook(book: Omit<BookItem, 'id' | 'createdAt'>): BookItem {
    const books = this.getBooks()
    const newBook: BookItem = {
      ...book,
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }
    const updated = [newBook, ...books]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem('bm_first_book_registered', 'true')
    return newBook
  },

  updateBook(id: string, updates: Partial<BookItem>): BookItem | null {
    const books = this.getBooks()
    const index = books.findIndex((b) => b.id === id)
    if (index === -1) return null
    books[index] = { ...books[index], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
    return books[index]
  },

  deleteBook(id: string): boolean {
    const books = this.getBooks()
    const updated = books.filter((b) => b.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    if (updated.length === 0) {
      localStorage.removeItem('bm_first_book_registered')
    }
    return true
  },

  toggleStatus(id: string): BookItem | null {
    const books = this.getBooks()
    const book = books.find((b) => b.id === id)
    if (!book) return null
    const newStatus = book.status === 'Pausado' ? 'Disponível' : 'Pausado'
    return this.updateBook(id, { status: newStatus })
  },

  // Pedidos de doação ou lista de interesse
  getWishlist(): WishlistBook[] {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!raw) return []
    try {
      return JSON.parse(raw) as WishlistBook[]
    } catch {
      return []
    }
  },

  addWishlistBook(wish: Omit<WishlistBook, 'id' | 'createdAt'>): WishlistBook {
    const list = this.getWishlist()
    const newItem: WishlistBook = {
      ...wish,
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }
    const updated = [newItem, ...list]
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated))
    return newItem
  },

  removeWishlistBook(id: string) {
    const list = this.getWishlist()
    const updated = list.filter((item) => item.id !== id)
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated))
  },

  // Preferências do Match ativo
  getMatchPreferences(): { selectedBookIdsForTrade: string[]; seekingDonations: boolean } | null {
    const raw = localStorage.getItem(MATCH_SESSION_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  saveMatchPreferences(prefs: { selectedBookIdsForTrade: string[]; seekingDonations: boolean }) {
    localStorage.setItem(MATCH_SESSION_KEY, JSON.stringify(prefs))
  },
}
