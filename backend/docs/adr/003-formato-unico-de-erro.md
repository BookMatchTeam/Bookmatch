# ADR-003: Formato único de erro da API

- **Status:** Aceito
- **Data:** 2026-11-16

## Contexto

Antes desta decisão, a API respondia erros em formatos diferentes: o
`ValidationPipe` devolvia uma lista de mensagens em inglês, erros inesperados
devolviam `Internal server error`, e não havia como um caso de uso sinalizar
uma falha de negócio sem importar exceptions HTTP do NestJS, o que viola o
[ADR-001](001-arquitetura-em-camadas-por-dominio.md).

O frontend precisa tratar qualquer erro da API de um único jeito, e nenhuma
resposta pode expor detalhes internos como stack trace, SQL ou credenciais.

## Decisão

**Modelo:** toda falha esperada estende `ApplicationException`
(`src/shared/application/exceptions`), que define:

- `code`: identificador estável, para o cliente decidir o que fazer;
- `kind`: a categoria da falha (`not_found`, `conflict`, `unauthenticated`,
  `forbidden`, `invalid_input`, `business_rule`);
- a mensagem, segura para exibir ao usuário.

**Tradução:** o `GlobalExceptionFilter` (`src/shared/infra/http`) traduz a
`kind` para o status HTTP. A tabela é verificada pelo compilador: uma nova
`kind` sem status não compila.

**Formato:** toda resposta de erro tem três campos:

```json
{
  "statusCode": 409,
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "Este e-mail já está cadastrado."
}
```

**Regras complementares:**

- validação de DTO responde `422` (`VALIDATION_ERROR`); `400` fica para
  requisições malformadas, como JSON inválido;
- erros HTTP do framework mantêm o status, mas a mensagem técnica é trocada
  por uma mensagem segura em português;
- qualquer outro erro responde `500` (`INTERNAL_ERROR`) com mensagem
  genérica. A rota e o stack completo vão somente para o log.

## Alternativas consideradas

- **Lançar `HttpException` do NestJS nos casos de uso:** o padrão mais comum
  em NestJS, mas acopla a regra de negócio ao HTTP e não oferece código
  estável.
- **Uma classe base por categoria** (`ResourceNotFoundException`,
  `ResourceConflictException`...): nomes autoexplicativos, mas sete arquivos
  e risco de confusão com as classes homônimas do NestJS. A `kind` em uma
  única base entrega o mesmo resultado com menos estrutura.
- **Result/Either** (casos de uso devolvem o erro em vez de lançar): o
  compilador obriga a tratar cada erro, mas aumenta o código de todo caso de
  uso e é pouco idiomático em NestJS. Pode ser reavaliado para um domínio
  específico.
- **RFC 9457 (Problem Details), com `type`, `title`, `detail` e `instance`:**
  padrão da IETF, útil quando um cliente consome várias APIs ou quando erros
  passam por gateways. Com uma API e um frontend, o `type` como URL repete o
  `code`, e `title` e `detail` foram unificados em `message`.
- **`requestId` na resposta:** ligaria uma resposta de erro à linha de log
  correspondente. Descartado; a busca no log é feita por horário e rota.
- **`fieldErrors` por campo:** permitiria marcar no formulário o campo com
  erro a partir da resposta da API. Descartado; a validação por campo fica no
  frontend.
- **`success: true/false`:** repete o status HTTP, que já indica sucesso ou
  falha (`response.ok` no `fetch`, `catch` automático no axios).

## Consequências

- Todo erro sob `/api` tem o mesmo formato; o frontend trata erros com um
  único código.
- Casos de uso continuam independentes de HTTP.
- O frontend não recebe da API qual campo está inválido e precisa validar os
  formulários do seu lado.
- Para investigar um `500` em produção, o log é consultado por horário e rota.
- Uma rota inexistente fora do prefixo `/api` não passa pelo filtro. Veja o
  [ADR-004](004-prefixo-de-rotas-api.md).
- O `frontend/docs/contrato-api.md` precisa ser alinhado a este formato.
