# Arquitetura do BookMatch Backend

## Objetivo

O BookMatch Backend e uma API REST modular. Sua arquitetura prioriza:

- organizacao por dominios de negocio;
- casos de uso verticais;
- independencia entre regras de negocio e frameworks;
- testabilidade;
- evolucao incremental, evitando abstracoes prematuras.

Este documento descreve a arquitetura vigente e deve ser atualizado quando uma
decisao alterar a estrutura, as fronteiras ou a regra de dependencia. Decisoes
relevantes, com alternativas e consequencias, sao registradas em ADRs em
`docs/adr`.

## Organizacao por dominios

Cada pasta em `src` representa um dominio de negocio, com suas regras, casos de
uso e adaptadores.

```text
src/
|-- <dominio-a>/
|-- <dominio-b>/
|-- <modulo-tecnico>/
|-- app.module.ts
|-- configure-app.ts
`-- main.ts
```

### Quando criar um novo dominio

Um contexto vira um novo dominio quando atende a maior parte dos criterios:

- **vocabulario proprio**: termos que so fazem sentido dentro dele;
- **regras proprias**: invariantes que nao pertencem a nenhum dominio existente;
- **ciclo de vida proprio**: suas entidades mudam por motivos independentes;
- **mudanca isolada**: alterar suas regras nao exige alterar outros dominios;
- **coesao**: agrupa varias funcionalidades sobre as mesmas entidades.

Um contexto **nao** vira um novo dominio quando:

- e apenas mais uma funcionalidade de um dominio existente (vira um caso de uso);
- e um detalhe tecnico, como banco, e-mail ou fila (vira modulo tecnico ou
  adaptador em `infra`);
- existe apenas para compartilhar codigo entre dominios.

Em caso de duvida, comece no dominio mais proximo e extraia um novo quando o
vocabulario e as regras divergirem de fato. A criacao de um dominio e
registrada em um ADR.

### Modulos tecnicos

Modulos sem regra de negocio, como `health` e `prisma`, ficam diretamente em
`src` e nao seguem a divisao `application`/`infra`.

## Estrutura de um dominio

- `application`: nucleo independente de framework, com entidades, value
  objects, casos de uso, contratos e exceptions;
- `infra`: adaptadores para detalhes externos, como HTTP, NestJS, Prisma e
  criptografia.

```text
src/<dominio>/
|-- application/
|   |-- entities/
|   |   |-- vo/
|   |   |   |-- <value-object>.vo.ts
|   |   |   `-- <value-object>.vo.spec.ts
|   |   |-- <entidade>.entity.ts
|   |   `-- <entidade>.entity.spec.ts
|   |-- exceptions/
|   `-- usecases/
|       |-- <funcionalidade-a>/
|       |   |-- <funcionalidade-a>.input.ts
|       |   |-- <funcionalidade-a>.output.ts
|       |   |-- <funcionalidade-a>.gateway.ts
|       |   |-- <funcionalidade-a>.use-case.ts
|       |   `-- <funcionalidade-a>.use-case.spec.ts
|       `-- <funcionalidade-b>/
|-- infra/
|   |-- http/
|   |   |-- dto/
|   |   `-- <funcionalidade>.controller.ts
|   |-- persistence/
|   |   `-- prisma/
|   `-- <outros-adaptadores>/
`-- <dominio>.module.ts
```

## Regra de dependencia

```text
infra -> application
```

A camada `application` nao importa `infra`, NestJS, Prisma, HTTP ou qualquer
mecanismo de entrega ou persistencia. Entidades, value objects e casos de uso
sao TypeScript puro e nao recebem decorators.

Um dominio nao importa arquivos internos de outro. A colaboracao entre dominios
ocorre por contratos explicitos e e registrada em um ADR.

## Casos de uso verticais

Todo dominio possui `application/usecases`. Dentro dela, **cada pasta
representa uma funcionalidade**, nomeada pela intencao de negocio em kebab-case
(por exemplo, `create-account`, `change-password`).

Cada pasta e um **corte vertical**: concentra tudo o que a funcionalidade
precisa, em vez de espalhar em pastas horizontais como `gateways/` ou
`outputs/`.

- `input`: dados de entrada, independentes do protocolo;
- `output`: resultado publico da operacao;
- `gateway`: contratos de capacidades externas exigidas pelo caso de uso;
- `use-case`: orquestra entidades, value objects e gateways;
- `use-case.spec`: testes unitarios do comportamento.

Regras:

- um caso de uso executa uma unica funcionalidade;
- uma pasta de funcionalidade nao importa arquivos de outra;
- o nome reflete a intencao de negocio e e usado de forma consistente, sem
  alternar sinonimos (`Create`/`Register`) para a mesma operacao.

## DTOs e entradas

DTOs pertencem a `infra/http/dto` e podem usar decorators de validacao e
documentacao. Casos de uso nunca recebem DTOs; o controller converte:

```text
<Funcionalidade>RequestDto -> <Funcionalidade>Input -> <Funcionalidade>UseCase
```

O DTO valida o formato da requisicao (campos obrigatorios, tipos). As regras de
negocio de cada dado ficam nos value objects e nas entidades.

## Entidades

Entidades possuem identidade e protegem suas invariantes ao longo do ciclo de
vida.

A classe da entidade **agrupa os metodos relacionados as acoes do seu
contexto**. Por exemplo, no contexto de autenticacao, a entidade expoe metodos
como `createAccount()` e `login()`, cada um garantindo as regras daquela acao.

- metodos sao nomeados pela acao de negocio em camelCase (`changePassword`), e
  nao por operacoes tecnicas (`setPassword`, `update`);
- atributos nao sao alterados diretamente de fora da entidade;
- a entidade nao acessa recursos externos; quando uma acao depende deles, o
  caso de uso obtem o resultado pelo gateway e o entrega a entidade.

## Value objects

**Todo atributo com regra de negocio especifica da aplicacao vira um value
object**, em `application/entities/vo`:

- `Email`: formato valido, normalizacao para minusculas;
- `Cpf`: digitos verificadores, remocao de mascara;
- `Phone`: formato e DDD aceitos;
- `Password`: politica de senha.

Atributos sem regra propria, como um texto livre, permanecem primitivos.

- value objects sao imutaveis e comparados por valor;
- um value object invalido nunca e criado: a validacao ocorre na construcao e
  lanca uma exception da aplicacao;
- cada value object possui testes unitarios das suas regras.

## Gateways e adaptadores

Gateways sao definidos pela aplicacao e implementados por adaptadores em
`infra`:

```text
<Funcionalidade>Gateway <- Prisma<Funcionalidade>Gateway
PasswordHasherGateway   <- PasswordHasherAdapter
```

Inicialmente, um gateway e especifico do caso de uso. Ele so e promovido a
contrato compartilhado do dominio quando houver repeticao real entre casos de
uso.

## Tratamento de erros

Exceptions da aplicacao descrevem falhas do dominio ou do caso de uso, sem
conhecer codigos HTTP.

Toda falha esperada estende `ApplicationException`
(`src/shared/application/exceptions`) e define:

- `code`: identificador estavel, em `UPPER_SNAKE_CASE`, que o cliente usa para
  decidir o que fazer. Nunca muda depois de publicado;
- `kind`: a categoria da falha (`not_found`, `conflict`, `unauthenticated`,
  `forbidden`, `invalid_input`, `business_rule` ou `too_many_requests`);
- a mensagem, segura para exibir ao usuario e escrita em portugues.

```ts
export class EmailAlreadyRegisteredException extends ApplicationException {
  readonly code = 'EMAIL_ALREADY_REGISTERED';
  readonly kind = 'conflict';

  constructor() {
    super('Este e-mail já está cadastrado.');
  }
}
```

A infraestrutura e responsavel por traduzir essas falhas para o protocolo de
entrega. O `GlobalExceptionFilter` (`src/shared/infra/http`) traduz a `kind`
para o status HTTP e responde sempre no mesmo formato:

```json
{
  "statusCode": 409,
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "Este e-mail já está cadastrado."
}
```

```text
not_found -> 404    conflict -> 409        unauthenticated -> 401
forbidden -> 403    invalid_input -> 422   business_rule -> 422
too_many_requests -> 429
```

Regras:

- casos de uso e entidades nao lancam exceptions do NestJS (`HttpException`);
- um erro que nao e `ApplicationException` nem `HttpException` 4xx e tratado
  como falha inesperada: responde `500` com mensagem generica, e o detalhe
  vai somente para o log;
- adaptadores traduzem erros de bibliotecas que representam falhas esperadas
  (por exemplo, violacao de unicidade do Prisma) para uma exception da
  aplicacao. Os demais seguem como falha inesperada;
- uma nova categoria so e criada quando nenhuma existente descrever a falha.
  Ao criar, o filtro passa a exigir o status correspondente em tempo de
  compilacao.

## Composicao

Os modulos NestJS conectam controllers, casos de uso e adaptadores concretos.
Como casos de uso nao recebem decorators, o modulo os instancia com providers
`useFactory`.

## Estrategia de testes

O desenvolvimento segue TDD: teste que falha, implementacao minima, refatoracao.

- entidades e value objects: testes unitarios;
- casos de uso: testes unitarios com gateways fakes ou em memoria;
- adaptadores Prisma e integracoes: testes de integracao;
- endpoints HTTP: testes end-to-end.

Cada tipo tem sua suite e seu comando:

| Tipo | Arquivos | Comando |
|---|---|---|
| Unitario | `src/**/*.spec.ts` | `npm test` |
| End-to-end | `test/**/*.e2e-spec.ts` | `npm run test:e2e` |
| Integracao | `**/*.int-spec.ts` | `npm run test:integration` |

Os testes e2e sobem a aplicacao completa com `createTestApp`
(`test/support/test-app.ts`), sem banco. Os testes de integracao usam um
MariaDB proprio (`npm run db:test:up`), recebem as migrations antes da suite e
limpam os dados entre testes com `resetDatabase`
(`test/support/test-database.ts`). A suite recusa bancos cujo nome nao termine
em `_test`.

Testes verificam comportamento observavel, nao detalhes privados de
implementacao.

## Rotas

As rotas da aplicacao ficam sob o prefixo global `/api` (`API_PREFIX` em
`configure-app.ts`). O Swagger fica em `/api/docs`. O `/health` fica fora do
prefixo, porque a infraestrutura depende dele. Detalhes no ADR-004.

## Configuracao

As variaveis de ambiente sao lidas e validadas em um unico lugar,
`src/config`, durante a subida da aplicacao. Se alguma variavel obrigatoria
faltar ou estiver invalida, a aplicacao nao sobe e lista todos os problemas
de uma vez.

```text
src/config/
|-- app-config.ts           # tipo AppConfig e token APP_CONFIG
|-- app-config.module.ts    # modulo global que fornece APP_CONFIG
|-- environment.ts          # validacao em TypeScript puro
`-- environment.spec.ts
```

Regras:

- somente `src/config` le `process.env`;
- o restante do codigo recebe a configuracao tipada por injecao
  (`@Inject(APP_CONFIG)`);
- credenciais e segredos nao possuem valor padrao no codigo;
- a configuracao e imutavel depois da subida;
- testes substituem `APP_CONFIG` com `overrideProvider`, sem depender de
  `.env`.

Casos de uso nao recebem `AppConfig` inteiro. Quando uma regra de negocio
depender de um valor configuravel, o modulo NestJS repassa somente esse valor
ao montar o caso de uso.

## Codigo compartilhado

`src/shared` contem somente o que ja e usado, ou sera usado de imediato, por
mais de um dominio. Segue a mesma divisao dos dominios:

```text
src/shared/
|-- application/                 # TypeScript puro
|   |-- exceptions/              # ApplicationException
|   |-- clock.ts                 # contrato Clock
|   `-- id-generator.ts          # contrato IdGenerator
|-- infra/
|   |-- http/                    # filtro global e formato de erro
|   |-- shared.module.ts         # fornece ID_GENERATOR e CLOCK
|   |-- system-clock.ts
|   `-- uuid-v7-id-generator.ts
`-- testing/                     # fakes para testes, fora do build
    |-- fixed-clock.ts
    `-- fixed-id-generator.ts
```

Regras:

- entidades recebem o identificador de `IdGenerator` ao serem criadas. O
  formato e UUID v7;
- casos de uso e entidades obtem o horario atual de `Clock`, nunca de
  `new Date()` ou `Date.now()`;
- os modulos de dominio repassam `ID_GENERATOR` e `CLOCK` aos casos de uso
  pelo `inject` de seus `useFactory`;
- testes usam `FixedIdGenerator` e `FixedClock` para tornar identificadores e
  horarios previsiveis;
- algo so entra em `src/shared` quando mais de um dominio precisar. Codigo
  usado por um unico dominio fica nele.

```ts
// auth.module.ts
{
  provide: RegisterUserUseCase,
  useFactory: (gateway, hasher, idGenerator, clock) =>
    new RegisterUserUseCase(gateway, hasher, idGenerator, clock),
  inject: [REGISTER_USER_GATEWAY, PASSWORD_HASHER, ID_GENERATOR, CLOCK],
}
```
