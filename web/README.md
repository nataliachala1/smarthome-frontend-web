# SmartHome web frontend

React 18, TypeScript and Vite single page application. The production build is served by unprivileged Nginx; `/api/v1/` and Socket.IO are proxied to the backend service on the private Compose network.

## Local checks

```sh
npm ci
npm run lint
npm run typecheck
npm run build
```

`VITE_API_URL` is optional and defaults to `/api/v1`. It is embedded in public browser assets at build time and must never contain credentials or other secrets.

The `dev` branch workflow performs these checks, builds a Docker image, publishes `dev` and commit-SHA tags to GHCR, and then requests deployment through Dokploy.
