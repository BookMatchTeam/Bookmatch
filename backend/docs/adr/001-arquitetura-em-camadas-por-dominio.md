# ADR-001: Arquitetura em camadas por domínio

- **Status:** Aceito
- **Data:** 2026-11-16

## Contexto

O BookMatch Backend é uma API REST em NestJS que vai crescer por domínios de
negócio (autenticação, livros, recomendações, matches, mensagens). As regras
de negócio precisam ser testáveis sem subir o framework nem o banco, e devem
sobreviver a trocas de detalhes externos, como a biblioteca de criptografia
ou o provedor de e-mail.

O padrão mais comum em projetos NestJS concentra a regra de negócio em
services que dependem diretamente do framework, do ORM e de exceptions HTTP.

## Decisão

Organizar o código por domínio (`src/<dominio>`), cada um dividido em:

- `application`: TypeScript puro, com entidades, value objects, casos de uso,
  contratos (gateways) e exceptions. Não importa NestJS, Prisma ou HTTP;
- `infra`: adaptadores que implementam os contratos (HTTP, Prisma,
  criptografia, integrações).

As dependências apontam somente de `infra` para `application`. Os casos de
uso não recebem decorators do NestJS e são montados nos módulos com
`useFactory`. Cada caso de uso fica em uma pasta própria, com input, output,
gateways e testes.

Os detalhes vigentes estão no [`ARCHITECTURE.md`](../../ARCHITECTURE.md).

## Alternativas consideradas

- **Services do NestJS com acesso direto ao Prisma (padrão da documentação
  do NestJS):** menos arquivos e menor curva de aprendizado, mas acopla a
  regra de negócio ao framework e ao ORM, e obriga a testar com o container
  de injeção do NestJS ou com o banco.
- **Organização por tipo técnico** (`controllers/`, `services/`,
  `repositories/` na raiz): espalha um mesmo domínio por várias pastas e
  dificulta enxergar o que pertence a cada funcionalidade.
- **Arquitetura hexagonal completa desde o início**, com portas
  compartilhadas e camadas adicionais: antecipa abstrações sem casos de uso
  que as justifiquem.

## Consequências

- Casos de uso e entidades são testados com testes unitários simples, usando
  fakes dos gateways.
- Cada caso de uso exige mais arquivos (input, output, gateway, adaptador) do
  que um service tradicional.
- Contratos começam específicos de cada caso de uso e só são compartilhados
  quando houver repetição real.
- Quem entra no projeto precisa conhecer a regra de dependência; o
  `ARCHITECTURE.md` é a referência.
