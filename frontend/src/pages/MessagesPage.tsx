import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import {
  Search,
  Send,
  MoreVertical,
  Shuffle,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface ChatConversation {
  id: string
  userName: string
  userUsername: string
  userAvatar: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  isMatch: boolean
  bookNegotiation?: {
    theirBook: string
    yourBook: string
    status: 'Combinando encontro' | 'Match confirmado' | 'Concluído'
    agreedPlace?: string
  }
}

interface MessageItem {
  id: string
  sender: 'me' | 'them'
  text: string
  time: string
}

export default function MessagesPage() {
  const { firstName, isNew } = useCurrentUser()
  const [conversations] = useState<ChatConversation[]>(() => {
    if (isNew) return []
    return [
      {
        id: 'c-1',
        userName: 'Mariana Silva',
        userUsername: '@marianas',
        userAvatar: 'MS',
        lastMessage: 'Perfeito! O Café Santa Clara na quinta às 17h fica ótimo pra mim.',
        lastTime: '09:42',
        unreadCount: 2,
        isMatch: true,
        bookNegotiation: {
          theirBook: 'Torto Arado (Itamar Vieira Jr)',
          yourBook: 'Capitães da Areia (Jorge Amado)',
          status: 'Combinando encontro',
          agreedPlace: 'Café Santa Clara, Nazaré',
        },
      },
      {
        id: 'c-2',
        userName: 'Beatriz Mendes',
        userUsername: '@biamendes',
        userAvatar: 'BM',
        lastMessage: 'Muito obrigada pelo empréstimo de Quarto de Despejo! Cuidarei muito bem dele.',
        lastTime: 'Ontem',
        unreadCount: 0,
        isMatch: true,
        bookNegotiation: {
          theirBook: 'O Homem em Busca de Sentido',
          yourBook: 'Quarto de Despejo',
          status: 'Match confirmado',
        },
      },
      {
        id: 'c-3',
        userName: 'Rafael Lima',
        userUsername: '@rafaellima',
        userAvatar: 'RL',
        lastMessage: 'Você teria interesse em trocar pelo meu exemplar de Duna?',
        lastTime: '26 out',
        unreadCount: 0,
        isMatch: false,
      },
    ]
  })

  const [activeChatId, setActiveChatId] = useState<string>('c-1')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Record<string, MessageItem[]>>(() => {
    const initialMap: Record<string, MessageItem[]> = {}
    if (isNew) return initialMap
    initialMap['c-1'] = [
      {
        id: 'm1',
        sender: 'them',
        text: `Oi ${firstName}! Vi que demos Match no BookMatch! Adorei saber que você tem Capitães da Areia.`,
        time: '09:16',
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Oi Mariana! Sim, fiquei super feliz! Eu estava há meses querendo ler Torto Arado.',
        time: '09:20',
      },
      {
        id: 'm3',
        sender: 'me',
        text: 'Qual local fica bom pra gente fazer a troca física dos livros?',
        time: '09:21',
      },
      {
        id: 'm4',
        sender: 'them',
        text: 'Perfeito! O Café Santa Clara na quinta às 17h fica ótimo pra mim.',
        time: '09:42',
      },
    ]
    return initialMap
  })

  const activeConv = conversations.find((c) => c.id === activeChatId) || conversations[0]
  const currentMessages = activeConv ? messages[activeChatId] || [] : []

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }))

    setInputText('')
  }

  return (
    <div className="min-h-screen bg-canvas text-fg transition-colors">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[550px]">
          {/* Coluna Esquerda: Lista de Conversas & Matches */}
          <div className="lg:col-span-5 flex flex-col rounded-3xl border border-line/30 bg-surface/80 shadow-sm dark:bg-navy/80 overflow-hidden">
            {/* Header das Mensagens */}
            <div className="p-4 border-b border-line/20">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-fg">Mensagens</h1>
                <Link to="/matches">
                  <span className="flex items-center gap-1 text-xs font-semibold text-turquoise hover:underline">
                    <Shuffle className="size-3" /> Ver Matches
                  </span>
                </Link>
              </div>

              {/* Busca de Conversas */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-fg pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar conversa ou leitor..."
                  className="h-10 w-full rounded-xl border border-line/30 bg-canvas py-1 pl-9 pr-3 text-xs text-fg placeholder:text-muted-fg focus:border-turquoise focus:outline-none"
                />
              </div>
            </div>

            {/* Lista de Chats */}
            <div className="flex-1 overflow-y-auto divide-y divide-line/15">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-fg space-y-2">
                  <MessageSquare className="size-10 text-muted mx-auto stroke-1" />
                  <p className="text-xs font-semibold text-fg">Nenhuma conversa ainda</p>
                  <p className="text-[11px] leading-relaxed">
                    Dê matches na aba de Descoberta ou inicie um papo com leitores próximos para trocar livros!
                  </p>
                  <div className="pt-2">
                    <Link to="/matches">
                      <Button variant="outline" fullWidth={false} className="text-xs h-9">
                        Ir para Matches
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.id === activeChatId
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveChatId(conv.id)}
                      className={`w-full flex items-start gap-3.5 p-4 text-left transition ${
                        isSelected
                          ? 'bg-turquoise/15 dark:bg-turquoise/10'
                          : 'hover:bg-canvas/60'
                      }`}
                    >
                      <div className="relative">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-turquoise to-yellow text-navy font-bold text-xs shadow-sm">
                          {conv.userAvatar}
                        </div>
                        {conv.isMatch && (
                          <span
                            title="Match recíproco"
                            className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-yellow text-navy text-[10px] font-black ring-2 ring-surface shadow"
                          >
                            ⇄
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-fg truncate">{conv.userName}</h4>
                          <span className="text-[10px] text-muted-fg">{conv.lastTime}</span>
                        </div>

                        <p className="text-xs text-turquoise truncate">{conv.userUsername}</p>

                        <p className="mt-1 text-xs text-muted-fg truncate leading-relaxed">
                          {conv.lastMessage}
                        </p>

                        {conv.bookNegotiation && (
                          <span className="mt-1.5 inline-block rounded-md bg-canvas px-2 py-0.5 text-[10px] font-semibold text-fg-2 border border-line/20">
                            Troca: {conv.bookNegotiation.theirBook.split(' ')[0]} ⇄ {conv.bookNegotiation.yourBook.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-turquoise text-white text-[10px] font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Janela de Chat Ativa */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl border border-line/30 bg-surface/80 shadow-sm dark:bg-navy/80 overflow-hidden">
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-fg space-y-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-turquoise/10 text-turquoise">
                  <MessageSquare className="size-7" />
                </div>
                <h3 className="text-base font-bold text-fg">Seus chats começarão aqui</h3>
                <p className="text-xs max-w-sm">
                  Quando você der match com outro leitor ou enviar uma mensagem direta, a negociação e troca aparecerão nesta tela.
                </p>
              </div>
            ) : (
              <>
                {/* Header do Chat Ativo */}
                <div className="flex items-center justify-between p-4 border-b border-line/20 bg-canvas/30">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-turquoise to-yellow text-navy font-bold text-xs shadow-sm">
                      {activeConv.userAvatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-fg">{activeConv.userName}</h3>
                      <p className="text-xs text-turquoise">{activeConv.userUsername}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to="/perfil">
                      <Button variant="secondary" className="text-xs h-8 px-3">
                        Ver Perfil
                      </Button>
                    </Link>
                    <button className="grid size-8 place-items-center rounded-xl text-muted-fg hover:bg-canvas">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Painel de Negociação de Troca */}
                {activeConv.bookNegotiation && (
                  <div className="border-b border-turquoise/20 bg-turquoise/10 p-3 px-4 dark:bg-turquoise/5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex size-6 items-center justify-center rounded-full bg-yellow text-navy font-bold text-[10px]">
                          ⇄
                        </span>
                        <span className="font-bold text-fg">Troca em andamento:</span>
                        <span className="text-muted-fg">
                          <strong>{activeConv.bookNegotiation.theirBook}</strong> por <strong>{activeConv.bookNegotiation.yourBook}</strong>
                        </span>
                      </div>

                      <span className="rounded-full bg-turquoise/20 px-2.5 py-0.5 text-[11px] font-semibold text-turquoise self-start sm:self-auto">
                        {activeConv.bookNegotiation.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Corpo das Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentMessages.map((msg) => {
                    const isMe = msg.sender === 'me'
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-turquoise text-white rounded-tr-none'
                              : 'bg-canvas text-fg border border-line/20 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="mt-1 text-[10px] text-muted-fg px-1">
                          {msg.time}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Input de Envio */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-line/20 bg-canvas/30">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Escreva uma mensagem..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 h-11 rounded-2xl border border-line/30 bg-surface px-4 text-xs text-fg placeholder:text-muted-fg focus:border-turquoise focus:outline-none dark:bg-navy"
                    />
                    <Button variant="primary" type="submit" className="h-11 px-4 flex items-center justify-center">
                      <Send className="size-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
