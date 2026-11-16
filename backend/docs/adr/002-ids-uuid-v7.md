# ADR-002: IDs UUID v7 gerados pela aplicação

- **Status:** Aceito
- **Data:** 2026-11-16

## Contexto

Toda entidade precisa de um identificador. Ele pode ser gerado pelo banco no
`INSERT` ou pela aplicação no momento em que a entidade é criada.

Se o banco gerar o identificador, a entidade existe no domínio sem ID até ser
persistida, e o domínio passa a depender do banco para ficar completo. Um ID
sequencial exposto na URL (`/users/42`) também revela o volume de registros e
facilita a enumeração de recursos.

## Decisão

A aplicação gera os identificadores pelo contrato `IdGenerator`
(`src/shared/application`), implementado por `UuidV7IdGenerator`
(`src/shared/infra`) com a biblioteca `uuid`.

O formato é UUID versão 7: os primeiros 48 bits são o horário de criação em
milissegundos e o restante é aleatório.

Nos testes, `FixedIdGenerator` (`src/shared/testing`) devolve identificadores
previsíveis.

## Alternativas consideradas

- **Auto-incremento do banco:** simples e compacto, mas a entidade nasce sem
  ID, os testes não conseguem prever o valor e o ID expõe o volume de
  registros.
- **UUID v4 (`crypto.randomUUID()`, nativo do Node):** dispensa dependência,
  mas é totalmente aleatório. Em índices B-tree, como os do InnoDB do MariaDB,
  inserções aleatórias espalham escritas pelo índice e degradam o desempenho
  em tabelas grandes.
- **CUID2 ou NanoID:** mais curtos, mas fora do padrão UUID reconhecido pelo
  banco e pelas ferramentas.

## Consequências

- Entidades nascem completas, e os testes conferem o ID exato gerado.
- Os IDs são ordenáveis pelo momento de criação, e novas linhas vão para o fim
  do índice.
- A biblioteca `uuid` passa a ser dependência de produção, porque o Node não
  oferece UUID v7 nativo.
- A biblioteca garante IDs crescentes mesmo se o relógio do servidor
  retroceder.
- O ID tem 36 caracteres em texto. O tipo da coluna no banco é definido junto
  com o primeiro modelo do Prisma.
- O ID revela o horário de criação do registro. Isso é aceitável para os
  recursos do BookMatch.
