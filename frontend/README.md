# BookMatch — Frontend

React + TypeScript, criado com o template `react-ts` do Vite.

## Rodando localmente

Requer Node 24 (veja `.nvmrc`).

Crie a configuração local a partir do exemplo:

```bash
cp .env.example .env.local
```

`VITE_API_URL` é pública e deve apontar para a API. O valor sugerido para desenvolvimento é `http://localhost:3000`; produção usa `https://api-bookmatch.galpao.tech`.

```bash
npm install
npm run dev       # servidor de desenvolvimento com HMR
npm run lint      # oxlint
npm run build     # checagem de tipos (tsc -b) + build de producao em dist/
npm run preview   # serve o dist/ localmente
```

O contrato de comunicação, cookies e erros está documentado em [`docs/contrato-api.md`](docs/contrato-api.md).

## Imagem Docker

```bash
docker build -t bookmatch-frontend .
docker run --rm -p 8080:80 bookmatch-frontend   # http://localhost:8080
```

## CI/CD

Veja [`docs/frontend-deploy.md`](../docs/frontend-deploy.md).
