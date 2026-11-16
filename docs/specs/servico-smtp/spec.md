# Spec: Serviço de envio de e-mail por SMTP (Gmail)

## Motivação

O cadastro (`docs/specs/criar-conta/spec.md`) precisa enviar o código de
verificação por e-mail, e a recuperação de senha vai precisar do mesmo
recurso. O backend ainda não envia e-mail. Também não está definido como
usar uma conta Google, que hoje exige senha de app, limita o volume diário e
reescreve o remetente quando ele não é a própria conta.

Esta spec é a fonte única de como o backend envia e-mail. As specs de
funcionalidade só dizem **o que** enviar: destinatário, assunto e conteúdo.

**Resultado esperado:** qualquer funcionalidade do backend envia um e-mail
pela conta Gmail configurada, com o remetente correto, falhas registradas no
log e sem expor credenciais.

## Fora de escopo

| Item | Motivo |
|---|---|
| Autenticação OAuth2 (XOAUTH2) | Decidido usar senha de app. Se for preciso, terá spec própria |
| Google Workspace e domínio próprio no remetente | A conta é um Gmail pessoal |
| Servidor de e-mail falso em desenvolvimento (Mailpit) | Decidido usar o Gmail em todos os ambientes |
| Fila, novas tentativas automáticas e envio em segundo plano | O volume não justifica agora. Quem chama decide o que fazer com a falha |
| Controle da cota diária pela aplicação | O próprio Gmail recusa o envio acima da cota. A recusa é identificada no log (RN-12) |
| Modelos de e-mail (templates) e layout HTML | Cada funcionalidade monta seu conteúdo |
| Anexos, cópia (CC/BCC) e vários destinatários | Nenhuma funcionalidade precisa agora |
| Descadastro (unsubscribe) e e-mails de marketing | Só há e-mails transacionais |

## Regras de negócio

**Conta e autenticação**
- **RN-01**: O envio usa um Gmail pessoal pelo servidor SMTP do Google,
  autenticado com senha de app. A conta precisa ter a verificação em duas
  etapas ativada, e a senha normal da conta nunca é usada.
- **RN-02**: Todos os ambientes (desenvolvimento e produção) enviam pelo
  Gmail. A conta de produção é exclusiva da produção. Em desenvolvimento, cada
  pessoa usa a própria conta Gmail e a própria senha de app.
- **RN-03**: A conexão usa `smtp.gmail.com` na porta `465`, com TLS desde o
  início (`SMTP_SECURE=true`). Esses valores ficam no `.env`, sem valor padrão
  no código.
- **RN-04**: A senha de app é aceita com ou sem os espaços que o Google exibe
  (`abcd efgh ijkl mnop`). Os espaços são removidos na leitura da
  configuração.

**Remetente**
- **RN-05**: O remetente é montado como `"<EMAIL_FROM_NAME>" <EMAIL_FROM_ADDRESS>`.
  O valor inicial de `EMAIL_FROM_NAME` é `BookMatch`.
- **RN-06**: `EMAIL_FROM_ADDRESS` precisa ser igual a `SMTP_USER`, sem
  diferenciar maiúsculas de minúsculas. Se for diferente, a aplicação não
  sobe, porque o Gmail trocaria o remetente sem avisar.

**Mensagem**
- **RN-07**: Cada envio tem um destinatário, um assunto e um corpo em texto
  simples. O corpo em HTML é opcional e, quando existe, vai junto com o texto.
- **RN-08**: O assunto tem de 1 a 200 caracteres e não pode ter quebra de
  linha. Um assunto inválido é recusado antes da conexão com o SMTP.

**Falhas**
- **RN-09**: Se o servidor SMTP não concluir o envio em até 10 segundos, a
  tentativa é abandonada e tratada como falha. O limite cabe dentro do timeout
  de 15 segundos do frontend.
- **RN-10**: Toda falha de envio (conexão, autenticação, recusa, tempo
  esgotado) chega a quem chamou como uma falha de envio única. Não há nova
  tentativa automática. A funcionalidade que chamou decide como responder,
  como faz a RN-19 da spec de criar conta.
- **RN-11**: Toda falha é registrada no log com o tipo da falha, o código de
  resposta SMTP (quando houver) e o destinatário mascarado. Quando a falha é
  de autenticação, o log diz que a senha de app pode ter sido revogada. O
  Google revoga a senha de app quando a senha da conta muda.
- **RN-12**: A recusa por cota diária do Gmail (resposta SMTP `550 5.4.5`) é
  registrada no log como "cota diária do Gmail esgotada".

**Privacidade e segredos**
- **RN-13**: O log nunca contém a senha de app, o assunto nem o corpo do
  e-mail, porque o corpo pode ter códigos de verificação. O destinatário
  aparece mascarado: a primeira letra do usuário, `***` e o domínio
  (`a***@gmail.com`).
- **RN-14**: Um envio bem-sucedido é registrado no log com o `messageId` e o
  destinatário mascarado.

**Disponibilidade**
- **RN-15**: Na subida, a aplicação testa a conexão e a autenticação SMTP. Se
  o teste falhar, ela registra o erro no log (RN-11) e sobe mesmo assim, para
  que o Gmail fora do ar não derrube a API. O `/health` não depende do SMTP.

## Fluxos

### Fluxo principal: enviar e-mail

1. Uma funcionalidade pede o envio com destinatário, assunto, texto e,
   opcionalmente, HTML (RN-07).
2. O serviço valida o assunto (RN-08).
3. O serviço monta o remetente (RN-05).
4. O serviço envia pelo Gmail (RN-01, RN-03), com limite de 10 segundos
   (RN-09).
5. O serviço registra o sucesso no log (RN-13, RN-14) e devolve o
   `messageId`.

### Fluxo A: assunto inválido

2a. O assunto viola a RN-08: o serviço recusa sem conectar ao SMTP e devolve
a falha a quem chamou.

### Fluxo B: falha no envio

4a. O Gmail recusa, a autenticação falha, a conexão cai ou o tempo de 10
segundos acaba: o serviço registra a falha (RN-11, RN-12, RN-13) e devolve a
falha de envio a quem chamou (RN-10).

### Fluxo principal: subida da aplicação

1. A configuração é validada (RN-03, RN-04, RN-06). Se algo estiver ausente
   ou inválido, a aplicação não sobe e lista todos os problemas.
2. A aplicação testa a conexão e a autenticação SMTP (RN-15).
3. A aplicação começa a receber requisições.

### Fluxo C: Gmail inacessível na subida

2a. O teste falha: a aplicação registra o erro no log e segue para o passo 3
(RN-15).

## Organização no código

O envio é um recurso técnico, sem regra de negócio. Por isso fica em um
módulo próprio, `src/email`, como `src/prisma`, e segue o
`backend/ARCHITECTURE.md`:

- `src/email` expõe um serviço de envio injetável, implementado com
  `nodemailer`, que aplica as regras desta spec.
- Casos de uso não importam `src/email`. Cada caso de uso declara no seu
  gateway a capacidade de que precisa (por exemplo, "enviar código de
  verificação"). O adaptador em `infra` do domínio monta o conteúdo e usa o
  serviço de `src/email`.
- A falha de envio da RN-10 é um erro do módulo `src/email`. O adaptador do
  domínio o traduz para o que o caso de uso espera.
- Os testes unitários e e2e substituem o serviço por um falso em memória e
  nunca enviam e-mail real nem precisam de credenciais. Os testes do próprio
  módulo simulam o transporte do `nodemailer`.

Nova dependência: `nodemailer` (e `@types/nodemailer`), para o envio SMTP.

## Configuração

Variáveis validadas na subida por `src/config`. Todas são obrigatórias e
nenhuma tem valor padrão no código.

| Variável | Uso | Regra | Valor no Gmail |
|---|---|---|---|
| `SMTP_HOST` | Servidor SMTP (RN-03) | Texto não vazio | `smtp.gmail.com` |
| `SMTP_PORT` | Porta (RN-03) | Inteiro de 1 a 65535 | `465` |
| `SMTP_SECURE` | TLS desde o início (RN-03) | `true` ou `false` | `true` |
| `SMTP_USER` | Conta que autentica (RN-01) | E-mail válido | a conta Gmail |
| `SMTP_PASSWORD` | Senha de app (RN-01, RN-04) | Texto não vazio, espaços removidos | a senha de app |
| `EMAIL_FROM_NAME` | Nome do remetente (RN-05) | De 1 a 100 caracteres, sem aspas nem quebra de linha | `BookMatch` |
| `EMAIL_FROM_ADDRESS` | Endereço do remetente (RN-05, RN-06) | E-mail válido e igual a `SMTP_USER` | a conta Gmail |

Onde as variáveis entram:

- `backend/.env.example`: com os valores do Gmail e marcadores no lugar da
  conta e da senha;
- `backend/deploy/env.production.example` e o `compose.prod.yaml`, que
  repassa as variáveis à API;
- o CI não precisa delas, porque os testes substituem a configuração
  (`overrideProvider`).

O `backend/README.md` ganha um passo a passo para obter a senha de app:

1. Ativar a verificação em duas etapas na conta Google.
2. Criar a senha de app em <https://myaccount.google.com/apppasswords>.
3. Preencher `SMTP_USER`, `SMTP_PASSWORD` e `EMAIL_FROM_ADDRESS` no `.env`.

O README também avisa que trocar a senha da conta revoga a senha de app e
que a conta pessoal tem uma cota diária de envios.

## Ajuste na spec de criar conta

A spec de criar conta passa a remeter a esta para tudo o que é envio:

- a RN-20 fica só com o conteúdo do e-mail (assunto, código e validade) e
  remete a esta spec para o envio e o remetente;
- a tabela de configuração perde `SMTP_*` e `EMAIL_FROM` e remete a esta
  spec;
- o parágrafo do Mailpit sai;
- a dependência `nodemailer` passa a ser justificada aqui.

## Critérios de aceite

| ID | Dado | Quando | Então | Regra |
|---|---|---|---|---|
| CA-01 | Configuração válida do Gmail | A aplicação sobe | Conecta a `smtp.gmail.com:465` com TLS e autentica com `SMTP_USER` e a senha de app | RN-01, RN-03, RN-15 |
| CA-02 | `SMTP_PASSWORD="abcd efgh ijkl mnop"` | A configuração é lida | A senha usada é `abcdefghijklmnop` | RN-04 |
| CA-03 | `EMAIL_FROM_NAME=BookMatch` e `EMAIL_FROM_ADDRESS` igual a `SMTP_USER` | Um e-mail é enviado | O cabeçalho `From` é `"BookMatch" <conta@gmail.com>` | RN-05 |
| CA-04 | `EMAIL_FROM_ADDRESS` diferente de `SMTP_USER` | A aplicação sobe | A subida falha com uma mensagem sobre o remetente | RN-06 |
| CA-05 | `EMAIL_FROM_ADDRESS=Conta@Gmail.com` e `SMTP_USER=conta@gmail.com` | A aplicação sobe | Sobe normalmente | RN-06 |
| CA-06 | Alguma variável SMTP ausente ou inválida | A aplicação sobe | A subida falha e lista todos os problemas | Configuração |
| CA-07 | — | Envio só com texto | A mensagem tem só a parte em texto simples | RN-07 |
| CA-08 | — | Envio com texto e HTML | A mensagem tem as duas partes | RN-07 |
| CA-09 | — | Envio com assunto vazio, com 201 caracteres ou com quebra de linha | Falha antes de conectar ao SMTP | RN-08 |
| CA-10 | SMTP sem responder | Um e-mail é enviado | Falha de envio em até 10 segundos | RN-09, RN-10 |
| CA-11 | SMTP recusa a autenticação | Um e-mail é enviado | Falha de envio; o log diz que a senha de app pode ter sido revogada | RN-10, RN-11 |
| CA-12 | SMTP responde `550 5.4.5` | Um e-mail é enviado | Falha de envio; o log diz "cota diária do Gmail esgotada" | RN-12 |
| CA-13 | Qualquer falha de envio | O serviço devolve a falha | Houve uma única tentativa, sem nova tentativa automática | RN-10 |
| CA-14 | Envio para `ana@exemplo.com` com o código `042317` no corpo | O envio termina, com sucesso ou falha | O log mostra `a***@exemplo.com` e não contém o código, o assunto, o corpo nem a senha | RN-13 |
| CA-15 | Envio bem-sucedido | O envio termina | O serviço devolve o `messageId` e o log o registra | RN-14 |
| CA-16 | Gmail inacessível ou senha de app inválida | A aplicação sobe | O erro é registrado no log, a aplicação sobe e o `/health` responde `200` | RN-15 |
| CA-17 | Suítes de teste unitária e e2e | Os testes rodam | Nenhuma conexão SMTP é aberta e nenhuma credencial é exigida | Organização no código |

## Modelo de dados

**Estado atual:** o banco tem só as tabelas da spec de criar conta.

**O que esta spec cria ou altera:** nada no banco. Os envios não são
registrados em tabela; o histórico fica no log (RN-11, RN-14).

Esta spec não exige migration.
