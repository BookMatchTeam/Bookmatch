# Arquitetura do BookMatch Frontend

## Objetivo

O BookMatch Frontend e uma SPA responsiva, instalavel como PWA, que depende de
conexao para funcionar. Sua arquitetura prioriza:

- organizacao por contextos do produto;
- telas como cortes verticais;
- estado do servidor separado do estado da interface;
- evolucao incremental, criando pastas e abstracoes so quando necessarias.

Este documento descreve a arquitetura vigente e deve ser atualizado quando uma
decisao alterar a estrutura, as fronteiras ou as regras de importacao.
Decisoes relevantes sao registradas em ADRs em `docs/adr`. O historico de
implantacao fica em `docs/etapas-iniciais-frontend.md`, e o contrato com a API
em `docs/contrato-api.md`.

## Stack

React 19, TypeScript, Vite, React Router, TanStack Query, react-hook-form, zod,
Tailwind CSS v4, shadcn/ui (Base UI) e vite-plugin-pwa. Imports usam o alias
`@/` para `src`.

## Estrutura de `src`

```text
src/
|-- app/                # montagem: providers, router, layouts, PWA
|-- components/         # componentes comuns, fora de qualquer contexto
|   |-- ui/             # somente componentes gerados pelo shadcn
|   `-- form/           # FormField (input e select) e useZodForm
|-- config/             # leitura e validacao de variaveis de ambiente
|-- features/           # um contexto do produto por pasta
|-- lib/                # utilitarios genericos, sem regra de produto (cn)
|-- services/api/       # cliente HTTP, erros e QueryClient
|-- index.css           # Tailwind e tokens do tema
`-- main.tsx
```

## Contextos

Cada pasta em `features` e um contexto do produto: uma area que o usuario
reconhece e que agrupa telas relacionadas. Exemplo: o contexto `auth` reune as
telas de login, criacao de conta e recuperacao de senha.

### Quando criar um novo contexto

Uma area vira um novo contexto quando:

- agrupa telas que o usuario percebe como uma mesma area do produto;
- possui dados e chamadas a API que nao pertencem a outro contexto;
- pode evoluir sem exigir mudancas nos demais.

Uma nova tela que opera sobre os dados de um contexto existente entra nele. Os
contextos do frontend nao precisam corresponder um a um aos dominios do
backend.

### Estrutura de um contexto

```text
features/<contexto>/
|-- <tela-a>/
|   |-- <tela-a>-page.tsx
|   |-- <tela-a>.schema.ts       # schema zod do formulario da tela
|   |-- <tela-a>.api.ts          # funcoes que chamam o apiClient
|   |-- <tela-a>.queries.ts      # hooks useQuery/useMutation e query keys
|   |-- <tela-a>.types.ts        # tipos de request e response
|   `-- components/              # componentes usados so por esta tela
|-- <tela-b>/
|-- components/                  # componentes usados por mais de uma tela
|-- api/                         # chamadas usadas por mais de uma tela
`-- index.ts                     # API publica do contexto
```

Exemplo:

```text
features/auth/
|-- sign-in/
|   `-- sign-in-page.tsx
|-- sign-up/
|   `-- sign-up-page.tsx
`-- recover-password/
    `-- recover-password-page.tsx
```

Pastas e arquivos sao criados somente quando o primeiro conteudo deles for
necessario.

## Telas como cortes verticais

Cada pasta de tela concentra tudo o que a tela precisa: pagina, schema,
chamadas a API, tipos e componentes proprios. Quem altera uma tela encontra
tudo em um so lugar.

A pasta de tela e nomeada pela intencao do usuario, em kebab-case e em ingles
(`sign-in`, `recover-password`). A pagina da tela e o arquivo
`<tela>-page.tsx`, e cada pasta de tela possui uma unica pagina.

### Reuso entre telas

O reuso sobe um nivel por vez, somente quando acontece de fato:

1. **usado por uma tela**: fica na pasta da tela;
2. **usado por mais de uma tela do mesmo contexto**: sobe para
   `features/<contexto>/components` ou `features/<contexto>/api`;
3. **usado por mais de um contexto**:
   - componentes genericos, sem regra de um contexto, sobem para
     `src/components`;
   - o que pertence a um contexto (por exemplo, o hook de sessao de `auth`)
     continua nele e e exportado pelo `index.ts`.

## Regras de importacao

| Origem | Pode importar |
|---|---|
| pasta de tela | a propria pasta, `components` e `api` do seu contexto, `src/components`, `services`, `config`, `lib` |
| pasta de tela -> outra tela | proibido; o que for comum sobe para o contexto |
| `features/<x>` -> `features/<y>` | somente o `index.ts` de `<y>` |
| `src/components` | `components/ui`, `lib` |
| `components/ui` | `lib` |
| `services`, `config` | apenas entre si e `lib` |
| `app` | qualquer pasta |

Consequentemente:

- `src/components` nunca importa `features`;
- arquivos internos de um contexto nao sao importados por outro;
- a unica importacao permitida de `app` fora dele e `@/app/router/paths`.

O router, em `app`, importa os arquivos de pagina diretamente (e nao pelo
`index.ts`), para que cada pagina seja carregada sob demanda em um chunk
proprio.

## Componentes

- `components/ui`: somente componentes gerados pela CLI do shadcn. Nao contem
  regra de negocio nem texto de produto, e sao ajustados apenas quando
  necessario;
- `components/<grupo>`: componentes comuns do produto, fora de qualquer
  contexto, agrupados por assunto. Exemplo: `components/form` contem o
  `FormField`, que renderiza input e select, e o `useZodForm`;
- `features/<contexto>/components`: componentes usados por mais de uma tela do
  contexto;
- `features/<contexto>/<tela>/components`: componentes usados por uma unica
  tela.

Paginas fazem composicao: organizam componentes, conectam hooks e tratam
navegacao.

## Comunicacao com a API

Toda requisicao passa pelo `apiClient` de `services/api`, que aplica a URL
base, `credentials: 'include'`, timeout e a normalizacao de erros em
`ApiError`. Componentes nao chamam `fetch` diretamente.

- `*.api.ts` contem funcoes simples, sem React, que recebem dados tipados e
  devolvem a resposta tipada;
- `*.queries.ts` envolve essas funcoes em hooks do TanStack Query e define as
  query keys;
- paginas e componentes consomem apenas os hooks.

As regras de cookie, CORS, CSRF e formato de erro estao em
`docs/contrato-api.md`.

## Estado

- **dados do servidor**: sempre no TanStack Query, nunca copiados para
  `useState`;
- **estado de interface**: `useState` ou `useReducer` no componente que o usa;
- **estado compartilhado pela navegacao** (filtros, abas): parametros da URL;
- nenhuma biblioteca de estado global (Redux, Zustand) e adotada sem
  necessidade concreta registrada em ADR.

Tokens e credenciais nunca sao armazenados no navegador. A sessao e mantida
pelo backend em cookie HttpOnly.

## Formularios

- formularios usam react-hook-form com o `useZodForm` e o `FormField` de
  `components/form`;
- o schema zod do formulario fica em `<tela>.schema.ts`;
- o schema valida formato e preenchimento para dar retorno rapido ao usuario;
  o backend continua sendo a fonte das regras de negocio;
- `fieldErrors` retornados pela API sao exibidos nos campos correspondentes.

## Rotas

- os caminhos ficam em `app/router/paths.ts` e sao sempre referenciados pelo
  objeto `paths`, nunca escritos como texto;
- as URLs sao em portugues (`/entrar`, `/descobrir`);
- cada pagina e carregada sob demanda com `lazy`;
- rotas publicas usam o `PublicLayout`; rotas que exigem sessao usam o
  `AuthenticatedLayout`.

## Estilo

- estilos sao escritos com classes do Tailwind; classes condicionais usam o
  `cn` de `lib/utils`;
- cores, raios, fontes e espacamentos de marca sao tokens definidos em
  `index.css`; valores fixos como `#0794b1` ou `h-[49px]` nao sao usados nos
  componentes;
- a interface e responsiva desde o primeiro componente, partindo do mobile.

## PWA

- o service worker armazena somente os arquivos estaticos da interface;
- respostas da API e dados sensiveis nunca sao armazenados em cache;
- a aplicacao avisa antes de aplicar uma nova versao e informa quando esta sem
  conexao, sem prometer funcionamento offline.

## Nomenclatura

- arquivos e pastas em kebab-case (`sign-up-page.tsx`);
- componentes em PascalCase e exportacoes nomeadas (sem `export default`);
- hooks com prefixo `use`;
- codigo em ingles; textos exibidos ao usuario em portugues.

## Estrategia de testes

Os testes usam Vitest e Testing Library, ficam ao lado do arquivo testado
(`*.test.ts(x)`) e sao distribuidos por responsabilidade:

- schemas zod e funcoes puras: testes unitarios;
- hooks e componentes com regra de exibicao: testes de componente;
- paginas e fluxos: testes de integracao com a API simulada.

Testes verificam o que o usuario ve e faz, evitando acoplamento a detalhes de
implementacao.
