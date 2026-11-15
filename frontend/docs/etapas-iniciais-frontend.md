# Etapas iniciais do frontend

Este documento organiza a fundação técnica do frontend do BookMatch. A aplicação será uma SPA responsiva e instalável como PWA, mas dependerá de conexão para acessar autenticação, perfis, descoberta, matches e mensagens.

## Decisões iniciais

- React 19, TypeScript e Vite.
- Uma única aplicação para desktop e dispositivos móveis.
- Tailwind CSS v4 e shadcn/ui como fundação visual.
- Componentes próprios para a identidade e as experiências centrais do BookMatch.
- React Router para navegação.
- TanStack Query para estado proveniente do servidor.
- `fetch` nativo para comunicação HTTP inicialmente.
- Sem Redux ou Zustand até existir uma necessidade concreta.
- Nenhuma resposta da API ou informação sensível será armazenada pelo service worker.

## Etapa 1 — Fundação visual

Status: concluída.

- [x] Instalar e configurar o Tailwind CSS v4.
- [x] Inicializar o shadcn/ui no projeto Vite existente.
- [x] Configurar o alias `@/` para o diretório `src`.
- [x] Criar os tokens semânticos iniciais de tema.
- [x] Adicionar somente `Button`, `Input`, `Label` e `Card`.
- [x] Validar lint e build de produção.

Os componentes gerados pelo shadcn/ui ficarão em `src/components/ui`. Componentes de produto, compostos e específicos do BookMatch ficarão em `src/shared/components` ou dentro da feature responsável.

O shadcn/ui foi configurado com Base UI, preset Nova, ícones Lucide e tokens neutros. As cores de marca serão definidas posteriormente sem alterar a API dos componentes.

## Etapa 2 — Fundação PWA

Status: não iniciada.

- [ ] Instalar e configurar `vite-plugin-pwa`.
- [ ] Criar o manifesto com nome, nome curto, cores e modo `standalone`.
- [ ] Criar ícones temporários de 192 px, 512 px e `maskable`.
- [ ] Armazenar somente os arquivos estáticos da interface.
- [ ] Impedir cache de autenticação, perfis, matches, mensagens e API.
- [ ] Exibir um aviso antes de aplicar uma nova versão da aplicação.
- [ ] Exibir o estado sem conexão sem prometer funcionamento offline.

## Etapa 3 — Estrutura da aplicação

Status: não iniciada.

- [ ] Configurar os providers globais.
- [ ] Configurar o React Router.
- [ ] Configurar o TanStack Query.
- [ ] Criar as pastas somente quando a primeira implementação exigir.

Estrutura planejada:

```text
src/
├── app/
│   ├── providers/
│   └── router/
├── components/
│   └── ui/
├── features/
│   ├── auth/
│   ├── discovery/
│   ├── matches/
│   ├── chat/
│   └── profile/
├── services/
│   └── api/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
└── styles/
```

## Etapa 4 — Infraestrutura da API

Status: não iniciada.

- [ ] Documentar e validar `VITE_API_URL`.
- [ ] Criar um cliente HTTP centralizado sobre o `fetch`.
- [ ] Padronizar respostas e erros.
- [ ] Preparar o envio seguro das credenciais de autenticação.
- [ ] Integrar o estado de conectividade às requisições.

## Etapa 5 — Primeiro fluxo do produto

Status: não iniciada.

O primeiro fluxo será implementado nesta ordem:

```text
Entrar → Criar conta → Montar perfil → Escolher preferências → Descoberta
```

A tela de descoberta será tratada como a experiência central do produto, mas será construída depois que o usuário puder criar um perfil mínimo.

## Critérios gerais

- A interface deve ser responsiva desde o primeiro componente.
- O shadcn/ui será uma fundação técnica, não a identidade visual final.
- Dependências e componentes serão adicionados apenas quando necessários.
- Cada etapa deverá terminar com lint e build aprovados e um commit separado.
