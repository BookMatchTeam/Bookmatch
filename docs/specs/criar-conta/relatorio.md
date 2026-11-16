# Relatório: Criar conta

- **Spec:** [spec.md](./spec.md)
- **Escopo:** backend
- **Status:** concluída
- **Branch:** feat/autenticacao-usuario

## Resumo

A API cria contas pendentes (`POST /api/auth/sign-up`), envia por SMTP um código de 6 dígitos e ativa a conta quando o código é confirmado (`POST /api/auth/email-verification`). O reenvio (`POST /api/auth/email-verification/resend`) segue os limites por usuário. CORS e CSRF do `contrato-api.md` estão ativos em todas as rotas, e a migration `create_account` cria as três tabelas.

## Desvios da spec

| Referência | O que mudou | Motivo |
|---|---|---|
| Documentação a atualizar (ADR-003) | A categoria `too_many_requests` foi registrada numa seção "Atualizações" no fim do ADR-003, sem reescrever a decisão | O `docs/adr/README.md` proíbe reescrever um ADR aceito |
| Fluxo D | Em dois cadastros simultâneos com o mesmo e-mail, a segunda requisição recebe `409` `EMAIL_ALREADY_REGISTERED` se ler o banco antes do commit da primeira. Se ler depois, recebe `429` `VERIFICATION_CODE_RESEND_TOO_SOON` (cadastro refeito, RN-09 + RN-16). Em qualquer caso, só uma conta é gravada | A conta já existe como pendente quando a segunda leitura acontece depois do commit |

## Decisões fora da spec

- **Ordem das validações no cadastro:** nome, e-mail, senha, cidade, UF e termos. Com vários campos inválidos, a resposta traz o `code` do primeiro da lista.
- **Verificação de conta já ativa:** responde `409` `EMAIL_ALREADY_VERIFIED` antes de conferir o código, mesmo que o código esteja errado.
- **Reenvio com e-mail fora do formato:** responde `204` sem enviar nada, como um e-mail sem cadastro. As rotas de verificação e reenvio só normalizam o e-mail, sem validá-lo.
- **CSRF:** `Origin: null` (enviado por contextos opacos) é recusado com `403`. O valor de `X-BookMatch-Client` tem de ser exatamente `web`.
- **`CORS_ORIGINS`:** cada item tem de ser um origin `http(s)://host[:porta]`. Uma barra final é aceita e removida; caminho, query e `*` derrubam a subida.
- **Swagger em produção:** o `CORS_ORIGINS` de produção tem só `https://bookmatch.galpao.tech`. Por isso, o "Try it out" do Swagger em `api-bookmatch.galpao.tech` recebe `403` nas rotas `POST`. Para liberar, é preciso acrescentar o próprio origin da API à lista.
- **Mensagens:** os textos de `message` estão em `src/auth/application/exceptions`. O e-mail tem versão em texto e em HTML.

## Contrato HTTP para o frontend

As três rotas usam como base `${VITE_API_URL}/api`. Em desenvolvimento,
`VITE_API_URL` é `http://localhost:3000`; em produção, é
`https://api-bookmatch.galpao.tech`.

Todas as requisições deste fluxo são `POST` e devem enviar:

```http
Content-Type: application/json
X-BookMatch-Client: web
```

O cliente HTTP também deve usar `credentials: 'include'` e
`cache: 'no-store'`, conforme `frontend/docs/contrato-api.md`. Este fluxo ainda
não cria sessão nem cookie, mas a configuração deve ser comum às chamadas da
API. Campos JSON não documentados são recusados.

### Tipos compartilhados

Os tipos abaixo representam o contrato da API, não o estado intermediário dos
formulários:

```ts
export interface ApiError<TCode extends string = string> {
  statusCode: number;
  code: TCode;
  message: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  city: string;
  state: string;
  acceptedTerms: true;
}

export interface SignUpResponse {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationCodeRequest {
  email: string;
}
```

Toda falha da API devolve `ApiError` em JSON. O frontend deve tomar decisões
por `code`, que é estável; `message` está em português e pode ser exibida. Não
há `fieldErrors`. Falhas comuns às três rotas:

| Status | `code` | Quando |
|---|---|---|
| 400 | `BAD_REQUEST` | JSON malformado |
| 403 | `CSRF_CHECK_FAILED` | Header ausente/incorreto ou `Origin` não permitido |
| 422 | `VALIDATION_ERROR` | Campo ausente, tipo incorreto ou campo extra |
| 500 | `INTERNAL_ERROR` | Erro inesperado, sem detalhes internos |

### Criar ou refazer cadastro

`POST /api/auth/sign-up`

```ts
type SignUp = (body: SignUpRequest) => Promise<SignUpResponse>;
```

Exemplo de corpo:

```json
{
  "name": "Ana Souza",
  "email": "ana@exemplo.com",
  "password": "senha1234",
  "city": "São Paulo",
  "state": "SP",
  "acceptedTerms": true
}
```

| Campo | Contrato aceito |
|---|---|
| `name` | `string`, de 2 a 100 caracteres após remover espaços das pontas |
| `email` | `string`, e-mail válido, com até 254 caracteres; é normalizado para minúsculas e sem espaços nas pontas |
| `password` | `string`, de 8 a 128 caracteres, com pelo menos uma letra e um número |
| `city` | `string`, de 2 a 100 caracteres após remover espaços das pontas |
| `state` | `string`, uma das 27 siglas de UF; aceita maiúsculas ou minúsculas |
| `acceptedTerms` | booleano literal `true`; a versão dos termos não é enviada pelo cliente |

Sucesso: `201 Created` com o e-mail normalizado. Esse valor deve ser levado
para a tela de confirmação:

```json
{ "email": "ana@exemplo.com" }
```

Erros específicos:

| Status | `code` | Quando |
|---|---|---|
| 422 | `INVALID_NAME` | `name` viola o contrato |
| 422 | `INVALID_EMAIL` | `email` viola o contrato |
| 422 | `INVALID_PASSWORD` | `password` viola o contrato |
| 422 | `INVALID_CITY` | `city` viola o contrato |
| 422 | `INVALID_STATE` | `state` não é uma UF brasileira |
| 422 | `TERMS_NOT_ACCEPTED` | `acceptedTerms` não é `true` |
| 409 | `EMAIL_ALREADY_REGISTERED` | O e-mail pertence a uma conta ativa |
| 429 | `VERIFICATION_CODE_RESEND_TOO_SOON` | Cadastro pendente recebeu código há menos de 60 segundos |
| 429 | `VERIFICATION_CODE_SEND_LIMIT_REACHED` | Cadastro pendente já recebeu 5 códigos nos últimos 60 minutos |

Se o e-mail pertence a uma conta pendente, esta mesma rota substitui os dados
anteriores e envia um código novo. Portanto, os dois erros `429` também devem
ser tratados na tela de cadastro. Mesmo se o SMTP falhar, a API mantém o
cadastro e responde `201`; a tela seguinte deve permitir o reenvio.

### Confirmar e-mail

`POST /api/auth/email-verification`

```ts
type VerifyEmail = (body: VerifyEmailRequest) => Promise<void>;
```

Exemplo de corpo:

```json
{ "email": "ana@exemplo.com", "code": "042317" }
```

| Campo | Contrato aceito |
|---|---|
| `email` | `string`; é normalizado para minúsculas e sem espaços nas pontas |
| `code` | `string` com exatamente 6 dígitos; zeros à esquerda são significativos |

Sucesso: `204 No Content`, sem corpo. Não execute `response.json()` nessa
resposta. Depois do sucesso, direcione a pessoa para o login; a verificação
não cria sessão.

Erros específicos:

| Status | `code` | Quando | Ação esperada na tela |
|---|---|---|---|
| 422 | `INVALID_VERIFICATION_CODE` | Código errado, e-mail sem cadastro ou nenhum código ativo | Manter na tela e permitir nova tentativa |
| 422 | `VERIFICATION_CODE_EXPIRED` | Passaram 15 minutos desde o envio | Pedir novo código |
| 422 | `VERIFICATION_CODE_ATTEMPTS_EXCEEDED` | O código chegou a 5 tentativas erradas | Pedir novo código |
| 409 | `EMAIL_ALREADY_VERIFIED` | A conta já está ativa | Direcionar para o login |

Um `code` fora do formato de seis dígitos recebe `VALIDATION_ERROR` e não
conta como tentativa. Só o código enviado mais recentemente é aceito.

### Reenviar código

`POST /api/auth/email-verification/resend`

```ts
type ResendVerificationCode = (
  body: ResendVerificationCodeRequest,
) => Promise<void>;
```

Exemplo de corpo:

```json
{ "email": "ana@exemplo.com" }
```

O único campo é `email: string`, normalizado para minúsculas e sem espaços nas
pontas. Sucesso: `204 No Content`, sem corpo; não execute `response.json()`.
A API também responde `204` e não envia e-mail quando a conta não existe ou já
está ativa, para não revelar contas cadastradas.

Erros específicos:

| Status | `code` | Quando |
|---|---|---|
| 429 | `VERIFICATION_CODE_RESEND_TOO_SOON` | Ainda não passaram 60 segundos desde o último envio |
| 429 | `VERIFICATION_CODE_SEND_LIMIT_REACHED` | A conta recebeu 5 códigos nos últimos 60 minutos |

Os limites contam em conjunto o cadastro inicial, o cadastro refeito e os
reenvios. A API não devolve `Retry-After`; o frontend pode manter localmente o
contador de 60 segundos para orientar a interface, mas a resposta do backend
continua sendo a fonte de verdade.

## Critérios de aceite

Unitários em `backend/src`, e2e em `backend/test`, integração em `*.int-spec.ts`.

| CA | Situação | Teste |
|---|---|---|
| CA-01 | coberto | `test/auth/sign-up.e2e-spec.ts` › "cria a conta pendente e envia o código (CA-01)"; `test/auth/sign-up-flow.int-spec.ts` › "cria a conta, grava hashes e ativa com o código" |
| CA-02 a CA-09 | coberto | `test/auth/sign-up.e2e-spec.ts` › "responde 422 para %s" (um caso por CA); `create-account.use-case.spec.ts` › "normaliza nome, e-mail, cidade e UF (CA-03, CA-07)" |
| CA-10 | coberto | `test/auth/sign-up.e2e-spec.ts` › "grava o aceite da versão vigente no horário do Clock (CA-10)" |
| CA-11 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "recusa um novo cadastro com o e-mail da conta ativa (CA-11)" |
| CA-12 | coberto | `test/auth/sign-up.e2e-spec.ts` › "refaz o cadastro pendente depois de 60 segundos (CA-12)"; `prisma-auth-gateways.int-spec.ts` › "refaz o cadastro invalidando o código ativo..." |
| CA-13 | coberto | `test/auth/sign-up.e2e-spec.ts` › "responde 429 ao refazer o cadastro antes de 60 segundos (CA-13)" |
| CA-14 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "cria a conta, grava hashes..."; `argon2-password-hasher.spec.ts` › "gera um hash Argon2id que confere com a senha (CA-14)" |
| CA-15 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "cria a conta, grava hashes..."; `hmac-verification-code-hasher.spec.ts` › "(CA-15)" |
| CA-16 | coberto | `test/auth/email-verification.e2e-spec.ts` › "ativa a conta com o código certo (CA-16)" |
| CA-17 | coberto | `test/auth/email-verification.e2e-spec.ts` › "responde 422 VERIFICATION_CODE_EXPIRED depois de 15 minutos (CA-17)" |
| CA-18 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "soma uma tentativa ao errar o código (CA-18)" |
| CA-19 | coberto | `test/auth/email-verification.e2e-spec.ts` › "bloqueia o código depois de 5 tentativas erradas (CA-19)" |
| CA-20 | coberto | `test/auth/email-verification.e2e-spec.ts` › "só aceita o código mais recente (CA-20)" |
| CA-21 | coberto | `test/auth/email-verification.e2e-spec.ts` › "responde código inválido para e-mail sem cadastro (CA-21)" |
| CA-22 | coberto | `test/auth/email-verification.e2e-spec.ts` › "responde 409 EMAIL_ALREADY_VERIFIED para conta ativa (CA-22)" |
| CA-23 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "invalida o código anterior e envia um novo (CA-23)" |
| CA-24 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "responde 429 com 59 segundos desde o último envio (CA-24)" |
| CA-25, CA-26 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "responde 429 com 5 envios em 60 minutos e libera depois (CA-25, CA-26)" |
| CA-27 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "responde 204 sem enviar nada..." (sem cadastro e conta ativa) |
| CA-28 | coberto | `test/auth/sign-up.e2e-spec.ts` › "responde 201 mesmo com o SMTP falhando (CA-28)"; `smtp-verification-code-mailer.spec.ts` › "registra a falha no log sem o código..." |
| CA-29 | coberto | `test/auth/sign-up.e2e-spec.ts` › "não envia e-mail quando a transação falha (CA-29)" |
| CA-30, CA-31 | coberto | `test/security.e2e-spec.ts` › "responde ao preflight de um origin permitido (CA-30)", "não libera um origin fora da lista (CA-31)" |
| CA-32 a CA-34 | coberto | `test/security.e2e-spec.ts` › "recusa %s sem X-BookMatch-Client (CA-32)", "recusa um Origin fora da lista (CA-33)", "aceita o header sem Origin (CA-34)" |
| CA-35 | coberto | `test/security.e2e-spec.ts` › "responde 429 para a categoria too_many_requests (CA-35)" |
| CA-36 | coberto | `src/config/environment.spec.ts` › "rejeita %s ausente", "reune todos os problemas em um unico erro" |

## Para quem integra

- **Sessão:** o cadastro não cria sessão nem cookie. Depois do `204` da verificação, a próxima etapa é o login (spec futura, que deve recusar contas pendentes).
- **Ordem das telas:** cadastro → tela do código (com o `email` devolvido no `201`) → login. A tela do código precisa de um botão de reenvio, que trata os dois `429`.
- **Limites:** o código vale 15 min e bloqueia após 5 tentativas erradas. Envios: 1 a cada 60 s e no máximo 5 por hora, por conta, contando o cadastro refeito.
- **Campos:** a foto de perfil não pode ir no corpo: campos extras respondem `422` `VALIDATION_ERROR`. `acceptedTerms` precisa ser o booleano `true`.
- **E-mail:** assunto "Seu código de verificação do BookMatch", remetente de `EMAIL_FROM`. Em desenvolvimento, chega no Mailpit (`http://localhost:8025`).
- **Rotas, campos e códigos de erro:** estão em `frontend/docs/contrato-api.md` e no Swagger.

## Pendências

- **Antes do merge na `main` (que faz o deploy):** preencher no `.env` da VPS as variáveis novas (`deploy/env.production.example`), com um provedor SMTP real, que ainda não foi definido. Sem elas, a API de produção não sobe.
- **Smoke test de produção (`deploy/smoke-test.sh`):** não foi rodado localmente. A política de permissões da sessão bloqueou a execução, em linha com o `AGENTS.md` (não rodar scripts de `deploy/` sem pedido explícito). Ele roda no CI do pull request. O `argon2` traz binários pré-compilados no próprio pacote, então o `npm ci --omit=optional` da imagem `runtime` não deve afetá-lo, mas isso só se confirma no CI.
- **Spec do frontend:** integrar a tela de cadastro e criar a tela do código, partindo deste relatório.
