import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { useNavigate, Link } from 'react-router-dom'
import {
  Upload,
  Barcode,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BooksStorage } from '@/services/booksStorage'

export default function AddBookPage() {
  const navigate = useNavigate()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [publisher, setPublisher] = useState('')
  const [year, setYear] = useState('')
  const [notes, setNotes] = useState('')
  const [modality, setModality] = useState<'Empréstimo' | 'Troca' | 'Doação'>('Troca')
  const [condition, setCondition] = useState<'Novo' | 'Ótimo estado' | 'Bom estado' | 'Marcas de uso'>('Ótimo estado')
  const [isbn, setIsbn] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleIsbnSearch = () => {
    if (isbn.trim()) {
      setTitle('Torto Arado')
      setAuthor('Itamar Vieira Junior')
      setCategory('Literatura Brasileira')
      setPublisher('Todavia')
      setYear('2019')
    }
  }

  const getRandomGradient = () => {
    const gradients = [
      'from-amber-600 to-orange-950',
      'from-sky-500 to-indigo-800',
      'from-emerald-600 to-teal-950',
      'from-purple-600 to-violet-950',
      'from-rose-600 to-red-950',
      'from-cyan-600 to-blue-950',
    ]
    return gradients[Math.floor(Math.random() * gradients.length)]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !author.trim()) return

    // Salva no CRUD da biblioteca
    BooksStorage.addBook({
      title: title.trim(),
      author: author.trim(),
      category: category.trim() || 'Geral',
      modality,
      condition,
      location: 'Na sua estante',
      status: 'Disponível',
      coverGradient: getRandomGradient(),
      photoUrl: photoPreview || undefined,
      notes: notes.trim() || undefined,
      publisher: publisher.trim() || undefined,
      year: year.trim() || undefined,
    })

    setIsSuccess(true)
    setTimeout(() => {
      navigate('/biblioteca')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      {/* Header */}
      <section className="border-b border-line/20 bg-hero/20 dark:bg-navy/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/biblioteca"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-fg hover:text-turquoise mb-3 transition"
          >
            <ArrowLeft className="size-3.5" />
            Minha biblioteca / Cadastro de livros
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">
              Cadastre um novo livro
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-turquoise/15 px-3 py-0.5 text-xs font-semibold text-turquoise">
              <Sparkles className="size-3" />
              Acervo Pessoal
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-fg max-w-xl">
            Adicione um exemplar físico à sua estante para liberar e participar dos matches com outros leitores.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {isSuccess ? (
          <div className="rounded-3xl border border-line/30 bg-surface/50 p-12 text-center max-w-lg mx-auto shadow-md">
            <CheckCircle2 className="mx-auto size-16 text-emerald-500 animate-bounce" />
            <h2 className="mt-4 text-2xl font-bold text-fg">Livro cadastrado com sucesso!</h2>
            <p className="mt-2 text-xs text-muted-fg">
              Seu exemplar já está no seu acervo e a aba de Matches agora está liberada para você!
            </p>
            <div className="mt-6 flex justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-turquoise border-t-transparent" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Coluna esquerda: Foto e Privacidade */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-line/30 bg-surface/50 p-5 backdrop-blur">
                <h2 className="text-sm font-bold text-fg mb-3">Foto ou capa do exemplar</h2>
                
                <label className="flex flex-col items-center justify-center h-64 w-full rounded-xl border-2 border-dashed border-line/50 hover:border-turquoise bg-surface/40 cursor-pointer overflow-hidden transition relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Capa" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Upload className="size-10 text-turquoise/70 mb-2" />
                      <span className="text-xs font-semibold text-fg">Carregar foto real</span>
                      <span className="text-[11px] text-muted-fg mt-1">
                        JPG ou PNG, até 5 MB. Ajuda a mostrar o estado do exemplar.
                      </span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
                </label>
              </div>

              {/* Informações de Localização e Privacidade */}
              <div className="rounded-2xl border border-line/30 bg-surface/50 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-6 text-yellow shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-fg">Perto, sem expor seu endereço</h3>
                    <p className="text-[11px] text-muted-fg mt-0.5">
                      Apenas bairro e cidade aparecem publicamente. A entrega é combinada via chat seguro.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna direita: Formulário da Obra */}
            <div className="lg:col-span-8 rounded-2xl border border-line/30 bg-surface/50 p-6 backdrop-blur space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-line/20 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-fg">Informações do livro</h2>
                  <p className="text-xs text-muted-fg">Preencha os dados da edição que você tem em mãos</p>
                </div>

                {/* Preenchimento por ISBN */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Digitar ISBN..."
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="h-10 rounded-lg border border-line/40 bg-surface px-3 text-xs text-fg placeholder:text-muted/60 focus:border-turquoise focus:outline-none dark:bg-navy-950/70"
                  />
                  <Button
                    type="button"
                    variant="brand"
                    fullWidth={false}
                    onClick={handleIsbnSearch}
                    className="h-10 flex shrink-0 items-center justify-center gap-1.5 px-3.5 text-xs whitespace-nowrap"
                  >
                    <Barcode className="size-4 shrink-0" />
                    <span>Auto</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Título da obra *"
                  placeholder="Ex: Capitães da Areia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  label="Autor ou autora *"
                  placeholder="Ex: Jorge Amado"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Gênero / Categoria"
                  placeholder="Ex: Literatura Brasileira"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <Input
                  label="Editora"
                  placeholder="Ex: Companhia das Letras"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
                <Input
                  label="Ano da edição"
                  placeholder="Ex: 2018"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              {/* Modalidade de Circulação */}
              <div>
                <label className="block text-xs font-semibold text-fg mb-2">
                  Como este exemplar pode circular? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Empréstimo', 'Troca', 'Doação'] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setModality(type)}
                      className={`rounded-xl border p-3 text-xs font-semibold transition ${
                        modality === type
                          ? 'border-turquoise bg-turquoise/15 text-turquoise font-bold'
                          : 'border-line/30 bg-surface/40 text-muted-fg hover:text-fg'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado do Livro */}
              <div>
                <label className="block text-xs font-semibold text-fg mb-2">
                  Condição e estado de conservação *
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(['Novo', 'Ótimo estado', 'Bom estado', 'Marcas de uso'] as const).map((cond) => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => setCondition(cond)}
                      className={`rounded-xl border p-2.5 text-xs font-semibold transition ${
                        condition === cond
                          ? 'border-yellow bg-yellow/15 text-amber-900 dark:text-yellow font-bold'
                          : 'border-line/30 bg-surface/40 text-muted-fg hover:text-fg'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sinopse / Observações */}
              <div>
                <label className="block text-xs font-semibold text-fg mb-1">
                  Notas sobre o exemplar (opcional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Exemplar com poucas anotações a lápis, sem páginas rasgadas..."
                  className="w-full rounded-xl border border-line/30 bg-surface/70 p-3 text-xs text-fg focus:border-turquoise focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Link to="/biblioteca">
                  <Button type="button" variant="secondary" fullWidth={false}>
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" fullWidth={false} className="bg-turquoise text-white hover:bg-turquoise/90">
                  Publicar no meu acervo
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
