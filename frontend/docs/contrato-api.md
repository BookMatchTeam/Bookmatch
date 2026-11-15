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

Formato preferencial para erros:

```json
{
  "statusCode": 422,
  "code": "VALIDATION_ERROR",
  "message": "Revise os dados informados.",
  "fieldErrors": {
    "email": ["Informe um e-mail válido."]
  },
  "requestId": "identificador-opcional"
}
```

O frontend também aceita o formato padrão do `ValidationPipe` do NestJS, em que `message` pode ser uma string ou uma lista de mensagens.

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

- [ ] Habilitar CORS com a lista exata de origins e `credentials: true`.
- [ ] Incluir `X-BookMatch-Client` em `Access-Control-Allow-Headers`.
- [ ] Validar `Origin` e exigir `X-BookMatch-Client` nos métodos `POST`, `PUT`, `PATCH` e `DELETE`.

Sem essas configurações, o navegador bloqueia as chamadas de `bookmatch.galpao.tech` para `api-bookmatch.galpao.tech`.

### Cliente HTTP

- [ ] Aceitar `FormData` no corpo da requisição, sem definir `content-type` manualmente, para permitir o envio de imagens de perfil e capas.
- [ ] Tratar como `invalid-response` uma resposta bem-sucedida que não seja JSON quando a chamada espera JSON, em vez de devolver o texto como se fosse o tipo esperado.
- [ ] Classificar o status `413` como um tipo de erro próprio, com mensagem sobre tamanho de arquivo. Outros `4xx` sem tratamento específico, como `405` e `410`, continuam como `unknown`.

### Aplicação

- [ ] Tratar `401` de forma global, por exemplo no `onError` do `QueryCache`, limpando a sessão e redirecionando para `/entrar`. Depende do fluxo de autenticação da Etapa 5.
- [ ] Remover `navigateFallbackDenylist: [/^\/api/]` da configuração do PWA, que não tem efeito porque a API está em outro subdomínio.
