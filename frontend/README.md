# BookMatch — Frontend

React + TypeScript, criado com o template `react-ts` do Vite.

## Rodando localmente

Requer Node 24 (veja `.nvmrc`).

```bash
npm install
npm run dev       # servidor de desenvolvimento com HMR
npm run lint      # oxlint
npm run build     # checagem de tipos (tsc -b) + build de producao em dist/
npm run preview   # serve o dist/ localmente
```

## Imagem Docker

```bash
docker build -t bookmatch-frontend .
docker run --rm -p 8080:80 bookmatch-frontend   # http://localhost:8080
```

## CI/CD

Veja [`docs/frontend-deploy.md`](../docs/frontend-deploy.md).
