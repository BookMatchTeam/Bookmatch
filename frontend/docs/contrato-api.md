# Contrato da API para o frontend

Este documento define as premissas da comunicação entre o frontend e a API do BookMatch. A implementação dos endpoints de autenticação será feita junto ao primeiro fluxo do produto.

## Endereços

| Ambiente | Frontend | API |
| --- | --- | --- |
| Desenvolvimento | `http://localhost:5173` | `http://localhost:3000` |
| Produção | `https://bookmatch.galpao.tech` | `https://api-bookmatch.galpao.tech` |

O frontend lê o endereço da API por `VITE_API_URL`. Variáveis com prefixo `VITE_` são públicas e nunca devem conter segredos.

## Sessão e cookie

A autenticação usará um cookie de sessão criado e invalidado pelo backend. O frontend não receberá o token de sessão e não armazenará credenciais em `localStorage` ou `sessionStorage`.

Configuração definida para o cookie:

- `HttpOnly`: sempre.
- `Secure`: obrigatório em produção.
- `SameSite=Lax`.
- `Path=/`.
- cookie restrito ao host da API, sem `Domain=.galpao.tech`.
- expiração e rotação controladas pelo backend.

O cliente HTTP envia `credentials: 'include'` em todas as requisições. Em desenvolvimento, o cookie pode omitir `Secure`, mas deve manter as demais proteções.

## CORS e CSRF

O backend deve responder somente aos origins conhecidos:

- `http://localhost:5173` em desenvolvimento.
- `https://bookmatch.galpao.tech` em produção.

O CORS deve habilitar credenciais e nunca pode combinar `Access-Control-Allow-Origin: *` com cookies.

Para métodos que alteram estado (`POST`, `PUT`, `PATCH` e `DELETE`), o cliente envia `X-BookMatch-Client: web`. O backend deverá exigir esse header e validar `Origin` contra a lista permitida. O header não simples força o preflight do CORS; combinado com `SameSite=Lax`, cookie restrito ao host da API e lista exata de origins, forma a proteção inicial contra CSRF.

Frontend e API são subdomínios de `galpao.tech` e, por isso, pertencem ao mesmo *site* para o navegador. O `SameSite=Lax` não bloqueia requisições vindas de outros subdomínios de `galpao.tech`; ele atua apenas contra sites de outros domínios. A proteção efetiva contra CSRF vem da validação de `Origin` combinada com a exigência de `X-BookMatch-Client`, e o `SameSite` funciona somente como camada complementar.

Requisições `GET`, `HEAD` e `OPTIONS` não enviam `X-BookMatch-Client` e, portanto, não passam por essa verificação. Por isso, esses métodos nunca devem alterar estado no backend.

O backend deve incluir `X-BookMatch-Client` em `Access-Control-Allow-Headers`. Caso futuramente seja necessário aceitar novos origins ou requisições cross-site, deverá ser adotado um token CSRF explícito antes dessa mudança.

## Formato das respostas

Respostas com conteúdo devem usar JSON e o header `Content-Type: application/json`. Operações concluídas sem conteúdo podem retornar `204 No Content`.

Toda resposta de erro da API tem o mesmo formato, definido no ADR-003 do
backend (`backend/docs/adr/003-formato-unico-de-erro.md`):

```json
{
  "statusCode": 409,
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "Este e-mail já está cadastrado."
}
```

- `code` é estável e é o que o frontend usa para decidir o que fazer.
- `message` está em português e pode ser exibida ao usuário.
- Não há `fieldErrors` nem `requestId`: a validação por campo fica no
  formulário do frontend.
- Erro de validação de formato (campo ausente ou de tipo errado) responde
  `422` `VALIDATION_ERROR`. JSON malformado responde `400` `BAD_REQUEST`.
- `403` `CSRF_CHECK_FAILED`: falta o header `X-BookMatch-Client: web` ou o
  `Origin` não está na lista permitida (veja CORS e CSRF).
- `429`: limite atingido. Tente de novo mais tarde; o `code` diz qual limite.
- Erros inesperados respondem `500` `INTERNAL_ERROR`, sem detalhes.

O cliente HTTP do frontend também aceita o formato padrão do `ValidationPipe`
do NestJS, em que `message` pode ser uma string ou uma lista de mensagens,
mas a API não o usa mais.

## Endpoints

Todas as rotas ficam sob `https://<api>/api`. As que alteram estado exigem
`X-BookMatch-Client: web`. O Swagger fica em `/api/docs`.

### Cadastro (`auth`)

O cadastro cria a conta pendente e envia por e-mail um código de 6 dígitos,
válido por 15 minutos. A conta só fica ativa depois que o código é
confirmado. Login e sessão terão endpoints próprios.

#### `POST /api/auth/sign-up`

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

Resposta `201`: `{ "email": "ana@exemplo.com" }`, com o e-mail normalizado
(sem espaços nas pontas e em minúsculas), que a tela do código deve usar.

| Status | `code` | Quando |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Campo ausente, de tipo errado ou não previsto (por exemplo, a foto) |
| 422 | `INVALID_NAME` | Nome sem 2 a 100 caracteres, sem contar os espaços das pontas |
| 422 | `INVALID_EMAIL` | Formato inválido ou mais de 254 caracteres |
| 422 | `INVALID_PASSWORD` | Senha sem 8 a 128 caracteres, ou sem letra, ou sem número |
| 422 | `INVALID_CITY` | Cidade sem 2 a 100 caracteres, sem contar os espaços das pontas |
| 422 | `INVALID_STATE` | Não é uma das 27 siglas de UF (maiúsculas ou minúsculas) |
| 422 | `TERMS_NOT_ACCEPTED` | `acceptedTerms` diferente de `true` |
| 409 | `EMAIL_ALREADY_REGISTERED` | E-mail de uma conta já ativa |
| 429 | `VERIFICATION_CODE_RESEND_TOO_SOON` | E-mail de conta pendente com envio há menos de 60 s |
| 429 | `VERIFICATION_CODE_SEND_LIMIT_REACHED` | E-mail de conta pendente com 5 envios na última hora |

Se o e-mail for de uma conta ainda pendente, o cadastro é refeito: nome,
senha, cidade e UF são substituídos e um novo código é enviado.

#### `POST /api/auth/email-verification`

```json
{ "email": "ana@exemplo.com", "code": "042317" }
```

Resposta `204`: conta ativada.

| Status | `code` | Quando |
|---|---|---|
| 422 | `VALIDATION_ERROR` | `code` sem exatamente 6 dígitos (a tentativa não conta) |
| 422 | `INVALID_VERIFICATION_CODE` | Código errado, e-mail sem cadastro ou nenhum código ativo |
| 422 | `VERIFICATION_CODE_EXPIRED` | Passaram 15 minutos desde o envio |
| 422 | `VERIFICATION_CODE_ATTEMPTS_EXCEEDED` | O código recebeu 5 tentativas erradas |
| 409 | `EMAIL_ALREADY_VERIFIED` | A conta já está ativa |

Só o código mais recente vale. Nos três últimos `422`, o caminho é pedir um
novo código.

#### `POST /api/auth/email-verification/resend`

```json
{ "email": "ana@exemplo.com" }
```

Resposta `204`. Também responde `204`, sem enviar nada, para e-mail sem
cadastro ou de conta já ativa, para não revelar quais contas existem.

| Status | `code` | Quando |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Campo ausente ou de tipo errado |
| 429 | `VERIFICATION_CODE_RESEND_TOO_SOON` | Menos de 60 s desde o último envio |
| 429 | `VERIFICATION_CODE_SEND_LIMIT_REACHED` | 5 envios na última hora |

Os limites contam todos os envios da conta: o cadastro, o cadastro refeito e
os reenvios.

## Tratamento no frontend

- Timeout padrão de 15 segundos.
- Respostas da API usam `cache: 'no-store'`.
- Requisições podem ser canceladas com `AbortSignal`.
- Queries são consideradas atuais por 30 segundos.
- Falhas de rede, timeout e erros `5xx` recebem no máximo uma nova tentativa.
- Erros `4xx` e mutations não são repetidos automaticamente.
- `401` representa sessão ausente ou expirada.
- `403` representa uma sessão válida sem autorização para a ação.

## Pendências para a autenticação

Antes de proteger as rotas, o backend deverá fornecer o contrato real dos endpoints de criar sessão, consultar sessão e encerrar sessão. Só então o frontend implementará a consulta de sessão, o redirecionamento de `/` e as proteções do layout autenticado.

## Pendências conhecidas

Pontos identificados na revisão da Etapa 4 que serão tratados quando a integração com o backend começar.

### Backend

- [x] Habilitar CORS com a lista exata de origins e `credentials: true`.
- [x] Incluir `X-BookMatch-Client` em `Access-Control-Allow-Headers`.
- [x] Validar `Origin` e exigir `X-BookMatch-Client` nos métodos `POST`, `PUT`, `PATCH` e `DELETE`.

Concluídas na spec `docs/specs/criar-conta`. A lista de origins vem de
`CORS_ORIGINS` no backend. Uma requisição sem `Origin` (cliente que não é
navegador) passa pela checagem de origem, mas ainda precisa do header.

### Cliente HTTP

- [ ] Aceitar `FormData` no corpo da requisição, sem definir `content-type` manualmente, para permitir o envio de imagens de perfil e capas.
- [ ] Tratar como `invalid-response` uma resposta bem-sucedida que não seja JSON quando a chamada espera JSON, em vez de devolver o texto como se fosse o tipo esperado.
- [ ] Classificar o status `413` como um tipo de erro próprio, com mensagem sobre tamanho de arquivo. Outros `4xx` sem tratamento específico, como `405` e `410`, continuam como `unknown`.

### Aplicação

- [ ] Tratar `401` de forma global, por exemplo no `onError` do `QueryCache`, limpando a sessão e redirecionando para `/entrar`. Depende do fluxo de autenticação da Etapa 5.
- [ ] Remover `navigateFallbackDenylist: [/^\/api/]` da configuração do PWA, que não tem efeito porque a API está em outro subdomínio.
