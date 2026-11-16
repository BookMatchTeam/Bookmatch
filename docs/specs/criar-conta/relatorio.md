# Relatório: Criar conta

- **Spec:** [spec.md](./spec.md)
- **Escopo:** backend
- **Status:** concluída
- **Branch:** feat/autenticacao-usuario

## Resumo

A API cria contas pendentes (`POST /api/auth/sign-up`), envia por SMTP um código de 6 dígitos e ativa a conta quando o código é confirmado (`POST /api/auth/email-verification`). O reenvio (`POST /api/auth/email-verification/resend`) segue os limites por usuário. CORS e CSRF do `contrato-api.md` estão ativos em todas as rotas, e a migration `create_account` cria as três tabelas.

## Desvios da spec

| Referência | O que mudou | Motivo |
|---|---|---|
| Documentação a atualizar (ADR-003) | A categoria `too_many_requests` foi registrada numa seção "Atualizações" no fim do ADR-003, sem reescrever a decisão | O `docs/adr/README.md` proíbe reescrever um ADR aceito |
| Fluxo D | Em dois cadastros simultâneos com o mesmo e-mail, a segunda requisição recebe `409` `EMAIL_ALREADY_REGISTERED` se ler o banco antes do commit da primeira. Se ler depois, recebe `429` `VERIFICATION_CODE_RESEND_TOO_SOON` (cadastro refeito, RN-09 + RN-16). Em qualquer caso, só uma conta é gravada | A conta já existe como pendente quando a segunda leitura acontece depois do commit |

## Decisões fora da spec

- **Ordem das validações no cadastro:** nome, e-mail, senha, cidade, UF e termos. Com vários campos inválidos, a resposta traz o `code` do primeiro da lista.
- **Verificação de conta já ativa:** responde `409` `EMAIL_ALREADY_VERIFIED` antes de conferir o código, mesmo que o código esteja errado.
- **Reenvio com e-mail fora do formato:** responde `204` sem enviar nada, como um e-mail sem cadastro. As rotas de verificação e reenvio só normalizam o e-mail, sem validá-lo.
- **CSRF:** `Origin: null` (enviado por contextos opacos) é recusado com `403`. O valor de `X-BookMatch-Client` tem de ser exatamente `web`.
- **`CORS_ORIGINS`:** cada item tem de ser um origin `http(s)://host[:porta]`. Uma barra final é aceita e removida; caminho, query e `*` derrubam a subida.
- **Swagger em produção:** o `CORS_ORIGINS` de produção tem só `https://bookmatch.galpao.tech`. Por isso, o "Try it out" do Swagger em `api-bookmatch.galpao.tech` recebe `403` nas rotas `POST`. Para liberar, é preciso acrescentar o próprio origin da API à lista.
- **Mensagens:** os textos de `message` estão em `src/auth/application/exceptions`. O e-mail tem versão em texto e em HTML.

## Critérios de aceite

Unitários em `backend/src`, e2e em `backend/test`, integração em `*.int-spec.ts`.

| CA | Situação | Teste |
|---|---|---|
| CA-01 | coberto | `test/auth/sign-up.e2e-spec.ts` › "cria a conta pendente e envia o código (CA-01)"; `test/auth/sign-up-flow.int-spec.ts` › "cria a conta, grava hashes e ativa com o código" |
| CA-02 a CA-09 | coberto | `test/auth/sign-up.e2e-spec.ts` › "responde 422 para %s" (um caso por CA); `create-account.use-case.spec.ts` › "normaliza nome, e-mail, cidade e UF (CA-03, CA-07)" |
| CA-10 | coberto | `test/auth/sign-up.e2e-spec.ts` › "grava o aceite da versão vigente no horário do Clock (CA-10)" |
| CA-11 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "recusa um novo cadastro com o e-mail da conta ativa (CA-11)" |
| CA-12 | coberto | `test/auth/sign-up.e2e-spec.ts` › "refaz o cadastro pendente depois de 60 segundos (CA-12)"; `prisma-auth-gateways.int-spec.ts` › "refaz o cadastro invalidando o código ativo..." |
| CA-13 | coberto | `test/auth/sign-up.e2e-spec.ts` › "responde 429 ao refazer o cadastro antes de 60 segundos (CA-13)" |
| CA-14 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "cria a conta, grava hashes..."; `argon2-password-hasher.spec.ts` › "gera um hash Argon2id que confere com a senha (CA-14)" |
| CA-15 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "cria a conta, grava hashes..."; `hmac-verification-code-hasher.spec.ts` › "(CA-15)" |
| CA-16 | coberto | `test/auth/email-verification.e2e-spec.ts` › "ativa a conta com o código certo (CA-16)" |
| CA-17 | coberto | `test/auth/email-verification.e2e-spec.ts` › "responde 422 VERIFICATION_CODE_EXPIRED depois de 15 minutos (CA-17)" |
| CA-18 | coberto | `test/auth/sign-up-flow.int-spec.ts` › "soma uma tentativa ao errar o código (CA-18)" |
| CA-19 | coberto | `test/auth/email-verification.e2e-spec.ts` › "bloqueia o código depois de 5 tentativas erradas (CA-19)" |
| CA-20 | coberto | `test/auth/email-verification.e2e-spec.ts` › "só aceita o código mais recente (CA-20)" |
| CA-21 | coberto | `test/auth/email-verification.e2e-spec.ts` › "responde código inválido para e-mail sem cadastro (CA-21)" |
| CA-22 | coberto | `test/auth/email-verification.e2e-spec.ts` › "responde 409 EMAIL_ALREADY_VERIFIED para conta ativa (CA-22)" |
| CA-23 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "invalida o código anterior e envia um novo (CA-23)" |
| CA-24 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "responde 429 com 59 segundos desde o último envio (CA-24)" |
| CA-25, CA-26 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "responde 429 com 5 envios em 60 minutos e libera depois (CA-25, CA-26)" |
| CA-27 | coberto | `test/auth/resend-verification-code.e2e-spec.ts` › "responde 204 sem enviar nada..." (sem cadastro e conta ativa) |
| CA-28 | coberto | `test/auth/sign-up.e2e-spec.ts` › "responde 201 mesmo com o SMTP falhando (CA-28)"; `smtp-verification-code-mailer.spec.ts` › "registra a falha no log sem o código..." |
| CA-29 | coberto | `test/auth/sign-up.e2e-spec.ts` › "não envia e-mail quando a transação falha (CA-29)" |
| CA-30, CA-31 | coberto | `test/security.e2e-spec.ts` › "responde ao preflight de um origin permitido (CA-30)", "não libera um origin fora da lista (CA-31)" |
| CA-32 a CA-34 | coberto | `test/security.e2e-spec.ts` › "recusa %s sem X-BookMatch-Client (CA-32)", "recusa um Origin fora da lista (CA-33)", "aceita o header sem Origin (CA-34)" |
| CA-35 | coberto | `test/security.e2e-spec.ts` › "responde 429 para a categoria too_many_requests (CA-35)" |
| CA-36 | coberto | `src/config/environment.spec.ts` › "rejeita %s ausente", "reune todos os problemas em um unico erro" |

## Para quem integra

- **Sessão:** o cadastro não cria sessão nem cookie. Depois do `204` da verificação, a próxima etapa é o login (spec futura, que deve recusar contas pendentes).
- **Ordem das telas:** cadastro → tela do código (com o `email` devolvido no `201`) → login. A tela do código precisa de um botão de reenvio, que trata os dois `429`.
- **Limites:** o código vale 15 min e bloqueia após 5 tentativas erradas. Envios: 1 a cada 60 s e no máximo 5 por hora, por conta, contando o cadastro refeito.
- **Campos:** a foto de perfil não pode ir no corpo: campos extras respondem `422` `VALIDATION_ERROR`. `acceptedTerms` precisa ser o booleano `true`.
- **E-mail:** assunto "Seu código de verificação do BookMatch", remetente de `EMAIL_FROM`. Em desenvolvimento, chega no Mailpit (`http://localhost:8025`).
- **Rotas, campos e códigos de erro:** estão em `frontend/docs/contrato-api.md` e no Swagger.

## Pendências

- **Antes do merge na `main` (que faz o deploy):** preencher no `.env` da VPS as variáveis novas (`deploy/env.production.example`), com um provedor SMTP real, que ainda não foi definido. Sem elas, a API de produção não sobe.
- **Smoke test de produção (`deploy/smoke-test.sh`):** não foi rodado localmente. A política de permissões da sessão bloqueou a execução, em linha com o `AGENTS.md` (não rodar scripts de `deploy/` sem pedido explícito). Ele roda no CI do pull request. O `argon2` traz binários pré-compilados no próprio pacote, então o `npm ci --omit=optional` da imagem `runtime` não deve afetá-lo, mas isso só se confirma no CI.
- **Spec do frontend:** integrar a tela de cadastro e criar a tela do código, partindo deste relatório.
