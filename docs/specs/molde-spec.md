# Spec: <Nome da funcionalidade>

<!--
Molde de spec do BookMatch.

Como usar:
- Copie este arquivo para `docs/specs/<funcionalidade>/spec.md`.
- A spec contém só decisões tomadas. Dúvidas são resolvidas na conversa
  durante a escrita, antes de o documento ficar pronto. Por isso não há seção
  de questões em aberto.
- As regras de negócio são a fonte única dos números e das políticas.
  Fluxos, critérios de aceite e modelo de dados só as referenciam (RN-xx).
- Apague estes comentários ao preencher.
-->

## Motivação

<!--
Qual problema existe hoje e por que resolvê-lo agora.
Termine com o resultado esperado em uma frase.
-->

**Resultado esperado:** <o que passa a ser possível quando esta spec estiver
implementada>.

## Fora de escopo

<!--
O que poderia razoavelmente fazer parte desta spec, mas foi deixado de fora
de propósito. Não liste o óbvio ("o sistema não deve travar").
-->

| Item | Motivo |
|---|---|
| <funcionalidade relacionada> | <terá spec própria, não é necessária agora...> |

## Regras de negócio

<!--
Numere as regras (RN-01, RN-02...) e agrupe por assunto.
Cada regra deve ser verificável: valores, limites e prazos explícitos.
-->

**<Assunto>**
- **RN-01**: <regra>.
- **RN-02**: <regra>.

## Fluxos

<!--
Fluxo principal numerado. Fluxos alternativos derivam de um passo do
principal (3a, 3b...). Cite as regras que cada passo aplica.
-->

### Fluxo principal: <nome>

1. <passo>.
2. <passo> (RN-01).

### Fluxo A: <nome>

2a. <desvio a partir do passo 2>.

## Critérios de aceite

<!--
Um critério por comportamento verificável, no formato Dado / Quando / Então.
Toda regra de negócio deve ser coberta por ao menos um critério.
-->

| ID | Dado | Quando | Então | Regra |
|---|---|---|---|---|
| CA-01 | <contexto> | <ação> | <resultado observável> | RN-01 |

## Modelo de dados

<!--
Diga o estado atual do banco (tabelas que já existem ou não) e o que esta
spec cria ou altera. Foque no que o schema não mostra sozinho: relações,
estados e transições, e o vínculo de cada campo com uma regra de negócio.
Informe como a migration é criada:
`npx prisma migrate dev --name <nome_da_migration>` (não usar `db push`).
-->
