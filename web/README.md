# SmartHome web frontend

React 18, TypeScript and Vite single page application. The production build is served by unprivileged Nginx; `/api/v1/` and Socket.IO are proxied to the backend service on the private Compose network.

## Local checks

```sh
npm ci
npm run lint
npm run typecheck
npm run build
```

`VITE_API_URL` is optional and defaults to `/api/v1`. It is embedded in public browser assets at build time and must never contain credentials or other secrets. `VITE_BACKEND_URL` configures the Vite development proxy and defaults to `http://localhost:3000`; it is not used by the production Nginx image. `VITE_REALTIME_URL` selects the Socket.IO namespace; the transport path remains `/socket.io/`.

The workflow validates pull requests to `dev` and `main`, and on pushes to `dev` publishes `dev` and commit-SHA tags to GHCR. The Dokploy deployment job remains disabled until the VPS backup and restore audit is complete.
