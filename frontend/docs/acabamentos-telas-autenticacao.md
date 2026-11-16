# Acabamentos das telas de autenticação

Este documento registra a última etapa da refatoração das telas de login, cadastro e recuperação de senha. As etapas anteriores já foram concluídas; esta ficou pendente para ser implementada depois.

## Contexto da refatoração

Status: etapas 1 a 6 concluídas.

- [x] Etapa 1 — Tokens do tema de autenticação expostos no Tailwind (`features/auth/styles/auth-theme.css`).
- [x] Etapa 2 — Uma página por arquivo (`sign-in-page`, `sign-up-page`, `recover-password-page`).
- [x] Etapa 3 — `AuthLayout` com o tema em contexto e títulos via `<title>` do React 19.
- [x] Etapa 4 — `AuthCardShell` com as ilustrações posicionadas em relação ao painel.
- [x] Etapa 5 — Componentes de formulário (`AuthField`, `PasswordField`, `AuthButton`, `GoogleSignInButton`, `AuthTextLink`).
- [x] Etapa 6 — Cadastro organizado em componentes, `validateAvatar` e `brazilianStates` em `shared/constants`.
- [ ] Etapa 7 — Acabamentos (este documento).

Estrutura atual da feature:

```text
src/features/auth/
├── components/
│   ├── auth-button.tsx
│   ├── auth-card-shell.tsx
│   ├── auth-field.tsx
│   ├── auth-input.tsx
│   ├── auth-input-variants.ts
│   ├── auth-text-link.tsx
│   ├── auth-theme-toggle.tsx
│   ├── avatar-upload-field.tsx
│   ├── google-sign-in-button.tsx
│   ├── password-field.tsx
│   ├── state-select-field.tsx
│   └── sign-up/
│       ├── sign-up-footer.tsx
│       ├── sign-up-header.tsx
│       └── sign-up-intro.tsx
├── hooks/
│   ├── auth-theme-context.ts
│   ├── auth-theme-provider.tsx
│   └── use-auth-theme.ts
├── layouts/
│   └── auth-layout.tsx
├── lib/
│   └── validate-avatar.ts
├── pages/
│   ├── recover-password-page.tsx
│   ├── sign-in-page.tsx
│   └── sign-up-page.tsx
└── styles/
    └── auth-theme.css
```

## Etapa 7 — Acabamentos

Status: pendente.

### Decisões em aberto

- [ ] **Fonte das telas de autenticação.** O `AuthLayout` força `[font-family:Arial,sans-serif]`, enquanto o restante da aplicação usa Geist.
  - Recomendação: se o Arial veio apenas do padrão do Figma, remover o override e usar Geist em toda a aplicação.
  - Se o Arial for intencional, criar um token `--font-auth` no `@theme` em vez da classe arbitrária.
- [ ] **Links de termos de uso e política de privacidade.** Hoje são âncoras sem destino (`#termos-de-uso` e `#politica-de-privacidade`).
  - Opção A: criar rotas provisórias (`/termos` e `/privacidade`) usando o `PagePlaceholder` existente.
  - Opção B: manter como `TODO` até o conteúdo existir.

### Tarefas

- [ ] **Mensagem de validação da senha.** O navegador exibe uma mensagem genérica ("Please match the requested format." ou equivalente traduzido). Adicionar ao `PasswordField` uma prop `patternMessage` que use `setCustomValidity` para exibir "Use pelo menos 8 caracteres, com letras e números." em português.
- [ ] **`HydrateFallback`.** Ao abrir uma rota diretamente, o React Router avisa no console: *"No `HydrateFallback` element provided to render during initial hydration"*. Adicionar um `HydrateFallback` simples (fundo na cor da autenticação ou um indicador de carregamento) na rota do `AuthLayout`, evitando também o flash branco na primeira carga.
- [ ] **Imagens disponíveis offline.** O service worker só faz precache de `html`, `js`, `css` e `woff2`; com o servidor fora do ar, a tela abre pelo cache, mas a logo e as ilustrações dos gatos não aparecem. Incluir imagens no `globPatterns` do `vite.config.ts`:

  ```ts
  globPatterns: ['**/*.{html,js,css,woff2,svg,png}'],
  ```

- [ ] **Marcar os fluxos simulados com `TODO(api)`.** Nenhuma tela chama a API ainda:
  - login e botão do Google navegam direto para `/descobrir`;
  - cadastro navega para `/entrar`;
  - recuperação apenas exibe a mensagem de sucesso.

  Cada ponto deve receber um comentário `// TODO(api): ...` referenciando [`docs/contrato-api.md`](contrato-api.md).
- [ ] **Asterisco dos campos obrigatórios.** Labels como "Nome completo \*" fazem leitores de tela anunciarem "asterisco". Usar `<span aria-hidden="true">*</span>` e deixar o atributo `required` comunicar a obrigatoriedade.
- [ ] **Revisão de texto.**
  - "Olá, seja bem vindo" → "Olá, seja bem-vindo".
  - "Entre com seu nome de Usuário ou seu E-mail" → "Entre com seu nome de usuário ou e-mail".
- [ ] **Opcional:** atualizar a seção "Estrutura planejada" de [`etapas-iniciais-frontend.md`](etapas-iniciais-frontend.md) com a organização de `features/auth`.

### Validação

- `npm run build` e `npm run lint` sem erros ou avisos.
- Abrir as três telas nos temas claro e escuro, sem avisos no console.
- Testar senha inválida no cadastro e conferir a mensagem em português.
- Com o servidor parado e o service worker ativo (`npm run preview`), a logo e as ilustrações continuam visíveis.

Commit sugerido: `chore(frontend): acabamentos das telas de autenticação`.

## Depois desta etapa

A integração real com a API (`api/` na feature, `useSignIn` e `useSignUp` com TanStack Query) depende da publicação do contrato de autenticação pelo backend e será tratada separadamente.
