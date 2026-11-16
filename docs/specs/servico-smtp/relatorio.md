# Relatório: Serviço de envio de e-mail por SMTP (Gmail)

- **Spec:** [spec.md](./spec.md)
- **Escopo:** backend
- **Status:** concluída
- **Branch:** feat/autenticacao-usuario

## Resumo

O backend ganhou um módulo técnico injetável para e-mails transacionais via Gmail, com validação completa da configuração, senha de app normalizada, timeout de 10 segundos, logs seguros e verificação não bloqueante no boot. O cadastro e o reenvio agora montam o conteúdo no adaptador de `auth` e delegam o transporte a esse módulo; testes nunca abrem SMTP real.

## Desvios da spec

Nenhum.

## Decisões fora da spec

- A contagem de 1 a 200 caracteres do assunto inclui espaços; somente assunto sem nenhum caractere é vazio.
- O timeout usa `AbortSignal` do Nodemailer para encerrar a tentativa em curso, além dos timeouts de conexão, saudação e socket do transporte.
- Não foi criado endpoint de envio: o módulo é interno, como definido na seção “Organização no código”.

## Critérios de aceite

| CA | Situação | Teste |
|---|---|---|
| CA-01 | coberto | `src/email/email.module.spec.ts` › configura Gmail na porta 465 com TLS direto e senha de app |
| CA-02 | coberto | `src/config/environment.spec.ts` › remove os espaços da senha de app |
| CA-03 | coberto | `src/config/environment.spec.ts` › aceita remetente e conta iguais; `src/email/email.service.spec.ts` › envia texto simples |
| CA-04 | coberto | `src/config/environment.spec.ts` › rejeita remetente diferente da conta autenticada |
| CA-05 | coberto | `src/config/environment.spec.ts` › aceita remetente e conta iguais sem diferenciar maiúsculas |
| CA-06 | coberto | `src/config/environment.spec.ts` › rejeita cada variável obrigatória ausente e reúne problemas |
| CA-07 | coberto | `src/email/email.service.spec.ts` › envia texto simples e devolve o messageId |
| CA-08 | coberto | `src/email/email.service.spec.ts` › envia texto e HTML juntos |
| CA-09 | coberto | `src/email/email.service.spec.ts` › recusa assunto inválido antes do transporte |
| CA-10 | coberto | `src/email/email.service.spec.ts` › abandona o envio após 10 segundos |
| CA-11 | coberto | `src/email/email.service.spec.ts` › orienta sobre senha de app revogada |
| CA-12 | coberto | `src/email/email.service.spec.ts` › identifica a cota diária do Gmail |
| CA-13 | coberto | `src/email/email.service.spec.ts` › converte a falha sem tentar novamente |
| CA-14 | coberto | `src/email/email.service.spec.ts` › mascara destinatário e não registra assunto, corpo nem erro bruto |
| CA-15 | coberto | `src/email/email.service.spec.ts` › devolve e registra o messageId |
| CA-16 | coberto | `src/email/email.service.spec.ts` › deixa a aplicação subir; `deploy/smoke-test.sh` › `/health` 200 sem SMTP disponível |
| CA-17 | coberto | `test/support/test-app.ts` substitui `EmailService`; 68 testes e2e passaram sem SMTP nem ambiente real |

## Para quem integra

### Contrato interno de envio

`EmailService.send({ to, subject, text, html? })` devolve `Promise<{ messageId: string }>`; `html` é opcional. Assunto inválido ou qualquer falha SMTP rejeita com `EmailSendFailure`. Não há repetição automática.

### Endpoints que acionam o serviço

O serviço SMTP não adiciona rota pública. Hoje ele é acionado somente por estas rotas, ambas com `Content-Type: application/json`, `X-BookMatch-Client: web`, `credentials: 'include'` e base `/api`.

Erros comuns: `400 BAD_REQUEST` para JSON malformado, `403 CSRF_CHECK_FAILED` para proteção CSRF e `500 INTERNAL_ERROR` para falha inesperada. Todos usam `{ statusCode: number, code: string, message: string }`.

#### `POST /api/auth/sign-up`

Corpo: `{ name: string, email: string, password: string, city: string, state: string, acceptedTerms: true }`.

Sucesso: `201 { "email": "ana@exemplo.com" }`. O e-mail é normalizado. Uma falha SMTP não muda o sucesso: a conta e o código permanecem gravados e a pessoa pode usar o reenvio.

Erros específicos: `422 VALIDATION_ERROR | INVALID_NAME | INVALID_EMAIL | INVALID_PASSWORD | INVALID_CITY | INVALID_STATE | TERMS_NOT_ACCEPTED`; `409 EMAIL_ALREADY_REGISTERED`; `429 VERIFICATION_CODE_RESEND_TOO_SOON | VERIFICATION_CODE_SEND_LIMIT_REACHED`.

#### `POST /api/auth/email-verification/resend`

Corpo: `{ email: string }`. Sucesso: `204`, sem corpo. Também retorna `204` para conta inexistente ou ativa. Uma falha SMTP mantém o novo código gravado e a resposta `204`.

Erros específicos: `422 VALIDATION_ERROR`; `429 VERIFICATION_CODE_RESEND_TOO_SOON | VERIFICATION_CODE_SEND_LIMIT_REACHED`.

`POST /api/auth/email-verification` não envia e-mail e não foi alterado por esta spec.

## Pendências

Nenhuma.
