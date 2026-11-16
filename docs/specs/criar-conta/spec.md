# Spec: Criar conta (backend)

## Motivação

A tela de cadastro do frontend já existe, mas o envio só redireciona para
`/entrar`: nenhuma conta é criada, porque o backend ainda não tem usuários,
tabelas nem endpoints de cadastro. Também faltam o CORS e a proteção CSRF
exigidos pelo `frontend/docs/contrato-api.md`, sem os quais o navegador
bloqueia qualquer chamada do frontend para a API.

Esta spec cobre o cadastro com nome, e-mail, senha, cidade, UF e aceite dos
termos, e a confirmação do e-mail por um código de 6 dígitos.

**Resultado esperado:** uma pessoa cria a conta pelo frontend, recebe um
código por e-mail e, ao informá-lo, tem a conta ativada.

## Fora de escopo

| Item | Motivo |
|---|---|
| Login, sessão e cookie | Terá spec própria. Esta spec só cria e ativa a conta |
| Login com Google | Não será feito agora. O modelo exige senha |
| Foto de perfil | Terá spec própria (armazenamento e redimensionamento). O campo opcional da tela não é enviado |
| Nome de usuário (username) | A conta é identificada só pelo e-mail |
| Recuperação de senha | Terá spec própria. A tabela de códigos já prevê o propósito `PASSWORD_RESET` |
| Integração da tela no frontend e tela de digitar o código | Terá spec do frontend, que parte do relatório desta |
| Páginas de termos de uso e política de privacidade | O conteúdo ainda não existe. O backend só registra a versão aceita |
| Limpeza de contas que nunca foram verificadas | Não é necessária agora. A RN-09 permite refazer o cadastro pendente |
| Troca do e-mail de uma conta | Não é necessária agora |
| Limite de requisições por IP | Os limites desta spec são por usuário (RN-16 e RN-17) |

## Regras de negócio

**Dados do cadastro**
- **RN-01**: O nome é obrigatório e tem de 2 a 100 caracteres, depois de
  remover os espaços das pontas.
- **RN-02**: O e-mail é obrigatório, tem formato válido e até 254 caracteres.
  Ele é salvo sem espaços nas pontas e em minúsculas, e a unicidade considera
  esse valor normalizado. Todas as rotas desta spec normalizam o e-mail
  recebido da mesma forma.
- **RN-03**: A senha tem de 8 a 128 caracteres, com pelo menos uma letra e um
  número.
- **RN-04**: A cidade é obrigatória e tem de 2 a 100 caracteres, depois de
  remover os espaços das pontas.
- **RN-05**: A UF é uma das 27 siglas brasileiras. Ela é aceita em maiúsculas
  ou minúsculas e salva em maiúsculas.
- **RN-06**: O aceite dos termos de uso e da política de privacidade é
  obrigatório (`acceptedTerms: true`). O backend grava em
  `terms_acceptances.terms_version` a versão vigente, lida da variável de
  ambiente `TERMS_VERSION` (valor inicial `1`), e a data do aceite. O cliente
  não informa a versão.

**Conta**
- **RN-07**: Toda conta nova começa com o status `PENDING_VERIFICATION`. O
  usuário, o aceite dos termos e o primeiro código são gravados na mesma
  transação.
- **RN-08**: O cadastro com o e-mail de uma conta `ACTIVE` é recusado com
  `EMAIL_ALREADY_REGISTERED`.
- **RN-09**: O cadastro com o e-mail de uma conta `PENDING_VERIFICATION`
  refaz o cadastro pendente:
  - substitui nome, senha, cidade e UF;
  - registra o aceite da versão vigente, se ele ainda não existir;
  - gera e envia um novo código (RN-15 a RN-17).
- **RN-10**: A senha é salva somente como hash Argon2id. Ela nunca aparece em
  texto puro no banco, no log ou nas respostas.

**Código de verificação**
- **RN-11**: O código tem 6 dígitos numéricos (de `000000` a `999999`) e é
  gerado com um gerador aleatório criptográfico.
- **RN-12**: O código é salvo somente como HMAC-SHA-256, calculado com a
  chave secreta `VERIFICATION_CODE_SECRET`.
- **RN-13**: O código vale por 15 minutos a partir da criação.
- **RN-14**: Cada tentativa errada soma 1 em `attempts`. Ao chegar a 5
  tentativas erradas, o código fica bloqueado, e nem o valor certo é aceito
  depois disso.
- **RN-15**: Gerar um código novo invalida os códigos ativos do mesmo usuário
  e propósito. Só o código mais recente vale.
- **RN-16**: É preciso esperar pelo menos 60 segundos desde o último envio de
  código para o mesmo usuário. Contam como envio o cadastro, o cadastro
  refeito (RN-09) e o reenvio.
- **RN-17**: Cada usuário recebe no máximo 5 envios de código em qualquer
  janela de 60 minutos.
- **RN-18**: Quando o código informado está ativo e confere, o código é
  marcado como consumido e o usuário passa a `ACTIVE`, na mesma transação.

**Envio do e-mail**
- **RN-19**: O e-mail só é enviado depois do commit da transação. Se o envio
  falhar, o cadastro ou o reenvio não é desfeito: a API responde normalmente
  e registra o erro no log, sem o código.
- **RN-20**: O e-mail é escrito em português, com o assunto
  "Seu código de verificação do BookMatch". O corpo traz o código e diz que
  ele vale por 15 minutos. O envio, o remetente e o tratamento de falhas
  seguem `docs/specs/servico-smtp/spec.md`.

**Respostas que não revelam contas**
- **RN-21**: O reenvio para um e-mail sem cadastro ou de uma conta já `ACTIVE`
  responde como sucesso e não envia nada.
- **RN-22**: A verificação com um e-mail sem cadastro responde como código
  inválido (`INVALID_VERIFICATION_CODE`).

**Segurança da requisição**
- **RN-23**: O CORS responde somente aos origins listados em `CORS_ORIGINS`,
  com `credentials: true` e com `Content-Type` e `X-BookMatch-Client` em
  `Access-Control-Allow-Headers`.
- **RN-24**: Toda requisição `POST`, `PUT`, `PATCH` ou `DELETE` sob `/api`
  precisa do header `X-BookMatch-Client: web`. Se o header `Origin` vier
  preenchido, ele tem de estar em `CORS_ORIGINS`. Requisições sem `Origin`
  (clientes que não são navegador) passam por essa checagem. Se alguma
  condição falhar, a API responde `403` com `CSRF_CHECK_FAILED`.
- **RN-25**: Quando um limite de envio (RN-16 ou RN-17) é atingido, a API
  responde `429`. Para isso, é criada a categoria de erro
  `too_many_requests`, que o `GlobalExceptionFilter` traduz para `429`.

## Fluxos

### Fluxo principal: criar conta

1. O cliente envia `POST /api/auth/sign-up` com nome, e-mail, senha, cidade,
   UF e aceite dos termos (RN-24).
2. A API valida os dados (RN-01 a RN-06).
3. A API verifica que o e-mail não está cadastrado (RN-02).
4. A API gera o hash da senha (RN-10) e o código (RN-11, RN-12, RN-13).
5. A API grava o usuário `PENDING_VERIFICATION`, o aceite e o código em uma
   transação (RN-06, RN-07).
6. A API envia o e-mail com o código (RN-19, RN-20).
7. A API responde `201` com o e-mail normalizado.

### Fluxo A: dados inválidos

2a. Algum dado viola uma regra: a API responde `422` com o código da regra
violada e nada é gravado.

### Fluxo B: e-mail de conta ativa

3a. O e-mail pertence a uma conta `ACTIVE`: a API responde `409`
`EMAIL_ALREADY_REGISTERED` (RN-08).

### Fluxo C: e-mail de conta pendente

3b. O e-mail pertence a uma conta `PENDING_VERIFICATION`:
1. A API verifica os limites de envio (RN-16, RN-17). Se algum estiver
   esgotado, responde `429` e nada é alterado.
2. Em uma transação, a API substitui os dados, registra o aceite se faltar
   (RN-09), invalida o código anterior (RN-15) e grava o novo.
3. Segue do passo 6.

### Fluxo D: cadastro simultâneo com o mesmo e-mail

5a. Outra requisição gravou o mesmo e-mail entre os passos 3 e 5: a violação
de unicidade do banco é traduzida para `409` `EMAIL_ALREADY_REGISTERED`.

### Fluxo E: falha no envio do e-mail

6a. O servidor SMTP falha: a API registra o erro no log e responde `201`
mesmo assim (RN-19). A pessoa usa o reenvio.

### Fluxo principal: verificar e-mail

1. O cliente envia `POST /api/auth/email-verification` com e-mail e código.
2. A API busca o usuário pelo e-mail normalizado (RN-02).
3. A API busca o código mais recente do usuário com propósito
   `EMAIL_VERIFICATION` que não esteja consumido nem invalidado.
4. A API verifica que o código não expirou (RN-13) e não está bloqueado
   (RN-14).
5. A API compara o HMAC do valor informado com o salvo (RN-12).
6. A API consome o código e ativa o usuário (RN-18).
7. A API responde `204`.

### Fluxo F: verificação sem sucesso

- 2a. Não existe usuário com o e-mail: `422` `INVALID_VERIFICATION_CODE`
  (RN-22).
- 2b. O usuário já está `ACTIVE`: `409` `EMAIL_ALREADY_VERIFIED`.
- 3a. Não há código ativo: `422` `INVALID_VERIFICATION_CODE`.
- 4a. O código expirou: `422` `VERIFICATION_CODE_EXPIRED`.
- 4b. O código atingiu 5 tentativas erradas: `422`
  `VERIFICATION_CODE_ATTEMPTS_EXCEEDED`.
- 5a. O valor não confere: a API soma 1 em `attempts` (RN-14) e responde
  `422` `INVALID_VERIFICATION_CODE`.

### Fluxo principal: reenviar código

1. O cliente envia `POST /api/auth/email-verification/resend` com o e-mail.
2. A API busca o usuário pelo e-mail normalizado (RN-02).
3. A API verifica os limites de envio (RN-16, RN-17).
4. Em uma transação, a API invalida o código anterior (RN-15) e grava um
   novo (RN-11 a RN-13).
5. A API envia o e-mail (RN-19, RN-20).
6. A API responde `204`.

### Fluxo G: reenvio sem envio

- 2a. Não existe usuário com o e-mail, ou ele já está `ACTIVE`: a API
  responde `204` e não envia nada (RN-21).
- 3a. Menos de 60 segundos desde o último envio: `429`
  `VERIFICATION_CODE_RESEND_TOO_SOON` (RN-16).
- 3b. Já houve 5 envios nos últimos 60 minutos: `429`
  `VERIFICATION_CODE_SEND_LIMIT_REACHED` (RN-17).

## Contrato HTTP

Rotas no domínio `auth`, com os casos de uso `create-account`,
`verify-email` e `resend-verification-code`. Todas exigem o header
`X-BookMatch-Client: web` (RN-24). Os erros seguem o formato único do
ADR-003 (`statusCode`, `code`, `message`).

### `POST /api/auth/sign-up`

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

Resposta `201`:

```json
{ "email": "ana@exemplo.com" }
```

| Status | `code` | Quando |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Campo ausente ou de tipo errado (DTO) |
| 422 | `INVALID_NAME` | RN-01 |
| 422 | `INVALID_EMAIL` | RN-02 |
| 422 | `INVALID_PASSWORD` | RN-03 |
| 422 | `INVALID_CITY` | RN-04 |
| 422 | `INVALID_STATE` | RN-05 |
| 422 | `TERMS_NOT_ACCEPTED` | RN-06 |
| 409 | `EMAIL_ALREADY_REGISTERED` | RN-08 |
| 429 | `VERIFICATION_CODE_RESEND_TOO_SOON` | RN-16, só no cadastro refeito |
| 429 | `VERIFICATION_CODE_SEND_LIMIT_REACHED` | RN-17, só no cadastro refeito |

### `POST /api/auth/email-verification`

```json
{ "email": "ana@exemplo.com", "code": "042317" }
```

Resposta `204`. O `code` precisa ter exatamente 6 dígitos. Se não tiver, o
DTO responde `422` `VALIDATION_ERROR` e a tentativa não é contada.

| Status | `code` | Quando |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Campo ausente ou fora do formato |
| 422 | `INVALID_VERIFICATION_CODE` | RN-14, RN-22, sem código ativo |
| 422 | `VERIFICATION_CODE_EXPIRED` | RN-13 |
| 422 | `VERIFICATION_CODE_ATTEMPTS_EXCEEDED` | RN-14 |
| 409 | `EMAIL_ALREADY_VERIFIED` | Conta já ativa |

### `POST /api/auth/email-verification/resend`

```json
{ "email": "ana@exemplo.com" }
```

Resposta `204`.

| Status | `code` | Quando |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Campo ausente ou de tipo errado |
| 429 | `VERIFICATION_CODE_RESEND_TOO_SOON` | RN-16 |
| 429 | `VERIFICATION_CODE_SEND_LIMIT_REACHED` | RN-17 |

Qualquer rota que altera estado sem o header ou com um `Origin` fora da
lista responde `403` `CSRF_CHECK_FAILED` (RN-24).

### Documentação a atualizar

- `frontend/docs/contrato-api.md`: as três rotas acima, o `403`, o `429` e o
  formato de erro do ADR-003. Também marcar como concluídas as pendências de
  CORS e CSRF do backend.
- `backend/ARCHITECTURE.md` e ADR-003: a categoria `too_many_requests` → `429`
  (RN-25).
- O Swagger envia o header `X-BookMatch-Client: web` nas chamadas de teste.

## Configuração

Novas variáveis de ambiente, validadas no boot por `src/config`. Elas também
entram em `.env.example`, em `deploy/env.production.example` e no CI.

| Variável | Uso | Regra |
|---|---|---|
| `TERMS_VERSION` | Versão vigente dos termos (RN-06) | Obrigatória, de 1 a 20 caracteres. Valor inicial `1` |
| `CORS_ORIGINS` | Origins aceitos (RN-23, RN-24) | Lista separada por vírgula, cada item com URL válida |
| `VERIFICATION_CODE_SECRET` | Chave do HMAC (RN-12) | Obrigatória, com pelo menos 32 caracteres |
As variáveis do envio de e-mail (`SMTP_*`, `EMAIL_FROM_NAME` e
`EMAIL_FROM_ADDRESS`) estão definidas em `docs/specs/servico-smtp/spec.md`.
Todos os ambientes enviam pelo Gmail; não há servidor de e-mail falso em
desenvolvimento.

O `CORS_ORIGINS` de desenvolvimento inclui `http://localhost:5173` e
`http://localhost:3000` (Swagger).

Nova dependência: `argon2`, para o hash de senha. A imagem `node:24-slim` usa
glibc, que tem binário pré-compilado do `argon2`. A dependência `nodemailer`
é justificada na spec do serviço de SMTP.

## Critérios de aceite

| ID | Dado | Quando | Então | Regra |
|---|---|---|---|---|
| CA-01 | Nenhuma conta com `ana@exemplo.com` | Envia o cadastro com dados válidos | `201` com o e-mail; usuário `PENDING_VERIFICATION`, aceite e código gravados; um e-mail enviado | RN-07, RN-20 |
| CA-02 | — | Envia o nome `" A "` ou com 101 caracteres | `422` `INVALID_NAME`, nada gravado | RN-01 |
| CA-03 | — | Envia o e-mail `"  Ana@Exemplo.COM "` | Conta gravada com `ana@exemplo.com` | RN-02 |
| CA-04 | — | Envia o e-mail `ana@` | `422` `INVALID_EMAIL` | RN-02 |
| CA-05 | — | Envia a senha `abcdefgh`, `12345678` ou `a1` | `422` `INVALID_PASSWORD` | RN-03 |
| CA-06 | — | Envia a cidade com 1 caractere | `422` `INVALID_CITY` | RN-04 |
| CA-07 | — | Envia a UF `sp` | Conta gravada com `SP` | RN-05 |
| CA-08 | — | Envia a UF `XX` | `422` `INVALID_STATE` | RN-05 |
| CA-09 | — | Envia `acceptedTerms: false` | `422` `TERMS_NOT_ACCEPTED` | RN-06 |
| CA-10 | — | Cadastro concluído | O aceite tem `terms_version` igual a `TERMS_VERSION` e `accepted_at` igual ao horário do `Clock` | RN-06 |
| CA-11 | Conta `ACTIVE` com o e-mail | Envia o cadastro | `409` `EMAIL_ALREADY_REGISTERED`, nada alterado | RN-08 |
| CA-12 | Conta pendente com último envio há mais de 60 s | Envia o cadastro com outros dados | `201`; dados substituídos, código anterior invalidado, novo código enviado | RN-09, RN-15 |
| CA-13 | Conta pendente com último envio há menos de 60 s | Envia o cadastro | `429` `VERIFICATION_CODE_RESEND_TOO_SOON`, nada alterado | RN-16 |
| CA-14 | Cadastro concluído | Lê `password_hash` no banco | É um hash Argon2id (`$argon2id$...`) que confere com a senha; a senha não aparece em log nem resposta | RN-10 |
| CA-15 | Código gerado | Lê `code_hash` no banco | É o HMAC-SHA-256 do código com `VERIFICATION_CODE_SECRET`, em hexadecimal | RN-11, RN-12 |
| CA-16 | Conta pendente com código ativo | Envia o código certo | `204`; usuário `ACTIVE`, código com `consumed_at` | RN-18 |
| CA-17 | Código criado há 15 min e 1 s | Envia o código certo | `422` `VERIFICATION_CODE_EXPIRED`, usuário continua pendente | RN-13 |
| CA-18 | Código ativo | Envia um código errado | `422` `INVALID_VERIFICATION_CODE`, `attempts` passa de 0 para 1 | RN-14 |
| CA-19 | Código com 5 tentativas erradas | Envia o código certo | `422` `VERIFICATION_CODE_ATTEMPTS_EXCEEDED`, usuário continua pendente | RN-14 |
| CA-20 | Dois códigos gerados em sequência | Envia o primeiro | `422` `INVALID_VERIFICATION_CODE`; o segundo continua válido | RN-15 |
| CA-21 | Nenhuma conta com o e-mail | Envia um código para verificação | `422` `INVALID_VERIFICATION_CODE` | RN-22 |
| CA-22 | Conta `ACTIVE` | Envia um código para verificação | `409` `EMAIL_ALREADY_VERIFIED` | — |
| CA-23 | Conta pendente com último envio há mais de 60 s | Pede reenvio | `204`; código anterior invalidado, novo código enviado | RN-15, RN-16 |
| CA-24 | Conta pendente com último envio há 59 s | Pede reenvio | `429` `VERIFICATION_CODE_RESEND_TOO_SOON` | RN-16 |
| CA-25 | Conta pendente com 5 envios nos últimos 60 min | Pede reenvio | `429` `VERIFICATION_CODE_SEND_LIMIT_REACHED` | RN-17 |
| CA-26 | Conta pendente com 5 envios, o primeiro há 61 min | Pede reenvio | `204` e novo código enviado | RN-17 |
| CA-27 | E-mail sem cadastro ou de conta `ACTIVE` | Pede reenvio | `204` e nenhum e-mail enviado | RN-21 |
| CA-28 | SMTP falhando | Envia o cadastro | `201`; conta gravada; erro no log sem o código | RN-19 |
| CA-29 | Transação do cadastro falha | Envia o cadastro | Nenhum e-mail enviado | RN-19 |
| CA-30 | — | Requisição `OPTIONS` de `http://localhost:5173` | Responde com `Access-Control-Allow-Origin` igual ao origin, `Allow-Credentials: true` e `X-BookMatch-Client` nos headers permitidos | RN-23 |
| CA-31 | — | Requisição `OPTIONS` de `https://outro.site` | Sem `Access-Control-Allow-Origin` | RN-23 |
| CA-32 | — | `POST` sob `/api` sem `X-BookMatch-Client` | `403` `CSRF_CHECK_FAILED` | RN-24 |
| CA-33 | — | `POST` com o header e `Origin: https://outro.site` | `403` `CSRF_CHECK_FAILED` | RN-24 |
| CA-34 | — | `POST` com o header e sem `Origin` | Passa pela checagem | RN-24 |
| CA-35 | — | Um caso de uso lança uma exception `too_many_requests` | O filtro responde `429` no formato do ADR-003 | RN-25 |
| CA-36 | Variáveis novas ausentes ou inválidas | A aplicação sobe | A subida falha e lista todos os problemas | Configuração |

## Modelo de dados

**Estado atual:** o banco não tem tabelas nem migrations. O schema das três
tabelas abaixo já está em `backend/prisma/schema.prisma` nesta branch, mas
ainda sem migration. Os detalhes de colunas, tipos e diagramas estão em
`docs/modelos-tabelas.md`.

**O que esta spec cria:**

| Tabela | Relação | Regras |
|---|---|---|
| `users` | Tem 1 ou mais `terms_acceptances` e 0 ou mais `verification_codes` | `email` único e normalizado (RN-02); `state` em `CHAR(2)` (RN-05); `password_hash` (RN-10); `status` (RN-07, RN-18) |
| `terms_acceptances` | Pertence a um usuário. Impede apagar o usuário | `(user_id, terms_version)` único (RN-06, RN-09) |
| `verification_codes` | Pertence a um usuário. Apagado junto com ele | `code_hash` (RN-12); `expires_at` (RN-13); `attempts` (RN-14); `invalidated_at` (RN-15); `consumed_at` (RN-18); índice `(user_id, purpose, created_at)` para os limites (RN-16, RN-17) |

**Estados do usuário:** `PENDING_VERIFICATION` → `ACTIVE` quando o código é
confirmado (RN-18). Não há transição de volta. A futura spec de login deve
recusar contas `PENDING_VERIFICATION`.

**Estados do código:** não ficam em uma coluna; são calculados.

| Estado | Condição |
|---|---|
| Ativo | Nenhum dos estados abaixo |
| Consumido | `consumed_at` preenchido |
| Invalidado | `invalidated_at` preenchido |
| Expirado | Horário do `Clock` depois de `expires_at` |
| Bloqueado | `attempts` igual a 5 |

O incremento de `attempts` é atômico no banco (`increment`), para que
tentativas simultâneas não passem do limite. Os limites de envio (RN-16,
RN-17) contam as linhas de `verification_codes` do usuário pelo
`created_at`, incluindo códigos invalidados e consumidos.

**Migration:** criada com
`npm run prisma:migrate -- --name create_account` (equivale a
`npx prisma migrate dev`; não usar `db push`).
