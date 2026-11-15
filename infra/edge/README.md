# Caddy de borda

Único container com portas abertas na VPS (80/443). Cuida do HTTPS (Let's Encrypt)
e repassa cada domínio para o serviço certo:

```
navegador ──HTTPS──▶ Caddy de borda (~/bookmatch-edge, portas 80/443)
                       ├ api-bookmatch.galpao.tech ──▶ bookmatch-backend:3000
                       └ bookmatch.galpao.tech     ──▶ bookmatch-frontend:80
                                 (rede Docker compartilhada "bookmatch-edge")
```

Backend e frontend não publicam portas: cada um entra na rede `bookmatch-edge`
com um nome fixo e o Caddy os encontra por esse nome. Com isso, cada serviço faz
deploy sozinho, e nenhum precisa saber como o outro é publicado.

## Arquivos

| Arquivo | Papel |
|---|---|
| `config/Caddyfile` | Domínios e para onde cada um vai |
| `compose.prod.yaml` | O container do Caddy (versão fixa), volumes dos certificados |
| `deploy.sh` | Passos executados na VPS: cria a rede, valida, sobe e recarrega |
| `.github/workflows/edge-ci.yml` | Valida compose, Caddyfile e formatação (só com mudanças em `infra/edge/`) |
| `.github/workflows/edge-cd.yml` | Envia os arquivos para `~/bookmatch-edge` e roda o `deploy.sh` |

Não edite esses arquivos direto na VPS: o próximo deploy os sobrescreve.

## Adicionar um domínio ou serviço

1. O serviço entra na rede `bookmatch-edge` com um alias (veja
   `backend/deploy/compose.prod.yaml`).
2. Um bloco novo no `config/Caddyfile`:
   ```caddyfile
   novo.galpao.tech {
   	reverse_proxy nome-do-alias:porta
   }
   ```
3. Registro DNS **A** do domínio apontando para a VPS.
4. PR → merge. O Edge CD aplica com `caddy reload`, sem derrubar conexões.

## Operação

- **Logs:** em `~/bookmatch-edge`, `docker compose -f compose.prod.yaml logs -f caddy`.
- **Redeploy manual:** *Actions → Edge CD → Run workflow*, ou na VPS
  `bash ~/bookmatch-edge/deploy.sh`.
- Os certificados ficam no volume `bookmatch-edge_caddy_data`. Não apague: o
  Let's Encrypt limita quantos certificados novos saem por semana.
