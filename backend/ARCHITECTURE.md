# Arquitetura do BookMatch Backend

## Objetivo

O BookMatch Backend e uma API REST modular. Sua arquitetura prioriza:

- organizacao por dominios de negocio;
- casos de uso verticais;
- independencia entre regras de negocio e frameworks;
- testabilidade;
- evolucao incremental, evitando abstracoes prematuras.

Este documento descreve o estado arquitetural desejado para o projeto. Ele deve
ser atualizado quando uma decisao alterar a estrutura, as fronteiras ou a regra
de dependencia da aplicacao.

## Organizacao por dominios

Os modulos dentro de `src` representam dominios ou capacidades de negocio.

Exemplos esperados:

```text
src/
|-- auth/
|-- books/
`-- recommendations/
```

Cada dominio possui duas areas principais:

- `application`: nucleo independente de framework, contendo entidades, value
  objects, casos de uso, contratos e erros da aplicacao;
- `infra`: adaptadores e detalhes externos, como HTTP, NestJS, Prisma,
  criptografia e integracoes.

## Estrutura de um dominio

O dominio de autenticacao estabelece a estrutura inicial de referencia:

```text
src/auth/
|-- application/
|   |-- entities/
|   |   |-- vo/
|   |   `-- user.entity.ts
|   |-- exceptions/
|   `-- usecases/
|       `-- register-user/
|           |-- register-user.input.ts
|           |-- register-user.output.ts
|           |-- register-user.gateway.ts
|           |-- password-hasher.gateway.ts
|           |-- register-user.use-case.ts
|           `-- register-user.use-case.spec.ts
|-- infra/
|   |-- cryptography/
|   |-- http/
|   |   |-- dto/
|   |   `-- register-user.controller.ts
|   `-- persistence/
|       `-- prisma/
`-- auth.module.ts
```

A estrutura pode evoluir conforme novos casos de uso revelem necessidades
reais. Contratos compartilhados devem ser extraidos somente quando houver uso
por mais de um caso de uso ou uma responsabilidade comum claramente definida.

## Regra de dependencia

As dependencias apontam da infraestrutura para a aplicacao:

```text
infra -> application
```

A camada `application` nao pode importar elementos de `infra`, NestJS, Prisma,
HTTP ou qualquer outro mecanismo de entrega ou persistencia.

Consequentemente:

- entidades e value objects sao TypeScript puro;
- casos de uso recebem dependencias por contratos;
- gateways sao definidos pela aplicacao e implementados pela infraestrutura;
- controllers apenas traduzem o protocolo HTTP para entradas e saidas da
  aplicacao;
- o modulo NestJS compoe implementacoes concretas e casos de uso;
- detalhes externos podem ser substituidos sem alterar as regras da aplicacao.

## Casos de uso verticais

Cada caso de uso fica em uma pasta propria dentro de `application/usecases`.
Essa pasta concentra o comportamento e os contratos necessarios para executar
a operacao.

Um caso de uso pode conter:

- `input`: dados de entrada independentes do protocolo;
- `output`: resultado publico da operacao;
- `gateway`: contratos exigidos pelo caso de uso;
- implementacao do caso de uso;
- testes unitarios do comportamento.

O nome dos artefatos deve refletir a intencao de negocio. Para o registro de um
usuario, a nomenclatura adotada e `RegisterUser`, evitando alternar entre
`CreateUser` e `RegisterUser` para a mesma operacao.

## DTOs e entradas da aplicacao

DTOs representam contratos de mecanismos externos. Um DTO HTTP pertence a
`infra/http/dto` e pode utilizar decorators de validacao e documentacao do
NestJS.

Casos de uso nao recebem DTOs da infraestrutura. O controller converte o DTO
para um `Input` da aplicacao antes de executar o caso de uso.

Exemplo:

```text
RegisterUserRequestDto -> RegisterUserInput -> RegisterUserUseCase
```

O sufixo `Command` deve ser reservado para quando o projeto adotar
explicitamente esse vocabulario ou um mecanismo de CQRS. Ate la, `Input` torna
a responsabilidade do objeto mais direta.

## Entidades e value objects

Entidades possuem identidade e protegem invariantes que continuam verdadeiras
ao longo de seu ciclo de vida.

Value objects representam conceitos definidos por seus valores e concentram
validacoes e normalizacoes do dominio, como um endereco de e-mail. Eles devem
ser imutaveis sempre que possivel.

Decorators de persistencia, validacao HTTP ou injecao de dependencia nao devem
ser adicionados a entidades e value objects.

## Gateways e adaptadores

Gateways expressam capacidades externas exigidas pela aplicacao. Inicialmente,
eles podem ser especificos de um caso de uso, como `RegisterUserGateway`.

Adaptadores em `infra` implementam esses contratos. Exemplos:

```text
RegisterUserGateway <- PrismaRegisterUserGateway
PasswordHasherGateway <- PasswordHasherAdapter
```

Quando casos de uso diferentes precisarem do mesmo contrato, a interface pode
ser promovida para um contrato compartilhado do dominio. Essa promocao deve ser
resultado de repeticao real, nao de antecipacao.

## Tratamento de erros

Exceptions da aplicacao descrevem falhas do dominio ou do caso de uso, sem
conhecer codigos HTTP.

Toda falha esperada estende `ApplicationException`
(`src/shared/application/exceptions`) e define:

- `code`: identificador estavel, em `UPPER_SNAKE_CASE`, que o cliente usa para
  decidir o que fazer. Nunca muda depois de publicado;
- `kind`: a categoria da falha (`not_found`, `conflict`, `unauthenticated`,
  `forbidden`, `invalid_input` ou `business_rule`);
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

## Estrategia de testes

O desenvolvimento segue TDD sempre que um comportamento puder ser expresso
antes de sua implementacao:

1. escrever um teste que descreva o comportamento e falhe;
2. implementar o minimo necessario para faze-lo passar;
3. refatorar preservando o comportamento coberto.

Os testes sao distribuidos por responsabilidade:

- entidades e value objects: testes unitarios;
- casos de uso: testes unitarios com gateways em memoria ou fakes;
- adaptadores Prisma e outras integracoes: testes de integracao;
- endpoints HTTP: testes end-to-end.

Testes devem verificar comportamento observavel, evitando acoplamento a
detalhes privados de implementacao.

## Composicao da aplicacao

Os modulos NestJS sao pontos de composicao. Eles conectam controllers, casos de
uso, gateways e adaptadores concretos.

Para preservar a independencia de `application`, casos de uso nao devem receber
decorators do NestJS. Quando necessario, o modulo pode instancia-los por meio
de providers com `useFactory`.

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

## Evolucao arquitetural

Esta arquitetura e um ponto de partida, nao uma estrutura imutavel. Mudancas
devem ser guiadas por casos de uso implementados e problemas observados.

Decisoes arquiteturais relevantes, suas alternativas e consequencias devem ser
registradas em ADRs dentro de `docs/adr`. O presente documento deve refletir a
arquitetura vigente, enquanto os ADRs preservam o historico das decisoes.
