# Registros de decisões de arquitetura (ADRs)

Um ADR (Architecture Decision Record) registra **uma** decisão de arquitetura:
o contexto, o que foi decidido, as alternativas descartadas e as
consequências. O código mostra *o que* foi feito; o ADR preserva *por quê*.

O [`ARCHITECTURE.md`](../../ARCHITECTURE.md) descreve a arquitetura vigente.
Os ADRs contam como se chegou a ela.

## Índice

| ADR | Decisão | Status |
|---|---|---|
| [001](001-arquitetura-em-camadas-por-dominio.md) | Arquitetura em camadas por domínio | Aceito |
| [002](002-ids-uuid-v7.md) | IDs UUID v7 gerados pela aplicação | Aceito |
| [003](003-formato-unico-de-erro.md) | Formato único de erro da API | Aceito |
| [004](004-prefixo-de-rotas-api.md) | Prefixo `/api` nas rotas da aplicação | Aceito |

## Quando escrever um ADR

Quando a decisão:

- é difícil ou cara de reverter;
- afeta mais de um domínio ou o contrato com o frontend;
- teve alternativas discutidas e descartadas.

Escolhas locais, como o nome de uma variável ou a organização interna de um
caso de uso, não precisam de ADR.

## Como escrever

1. Copie o [`modelo.md`](modelo.md) para `NNN-titulo-curto.md`, com o próximo
   número da sequência.
2. Preencha contexto, decisão, alternativas e consequências.
3. Inclua o ADR no **mesmo pull request** da implementação, para que a decisão
   seja revisada junto com o código.
4. Atualize o índice acima e, se a decisão mudar a arquitetura vigente, o
   `ARCHITECTURE.md`.

## Ciclo de vida

- **Proposto:** em discussão, ainda no pull request.
- **Aceito:** em vigor.
- **Substituído:** trocado por um ADR mais novo, indicado no próprio documento.

Um ADR aceito não é reescrito. Se a decisão mudar, um novo ADR é criado
referenciando o anterior, e o anterior passa a "Substituído por ADR-NNN". O
histórico das decisões fica preservado.
