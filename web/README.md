# Frontend con i18n — Conversión a JavaScript

Resumen: este repositorio contiene un frontend React (originalmente con archivos TypeScript/TSX). He convertido los archivos principales de TypeScript a JavaScript/JSX para que el proyecto pueda ejecutarse sin compilar TypeScript.

Lenguaje y stack:
- Frontend: JavaScript (ESM) + JSX
- Bundler: Vite (configurado en `vite.config.js`)
- UI: React + TailwindCSS (configuración ya incluida)
- i18n: `i18next` + `react-i18next`

Archivos que toqué/creé (conversión .ts/.tsx → .js/.jsx):
- `src/main.jsx` (nuevo entry)
- `vite.config.js` (convertido desde `vite.config.ts`)
- `src/app/App.jsx`
- `src/lib/i18n.js`
- `src/lib/axios.js`
- `src/app/contexts/AuthContext.jsx`
- `src/app/contexts/ThemeContext.jsx`
- `src/app/contexts/OfflineContext.jsx`
- `src/components/ui/Input.jsx`
- `src/components/ui/Button.jsx`
- `src/components/ui/Card.jsx`
- `src/components/ui/Badge.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/Navbar.jsx`
- `src/components/layout/OfflineBanner.jsx`
- `src/app/components/Layout.jsx`
- `src/app/layouts/DashboardLayout.jsx`
- `src/app/pages/Dashboard.jsx`
- `src/app/pages/Devices.jsx`
- `src/app/pages/Consumption.jsx`
- `src/app/pages/Homes.jsx`
- `src/app/pages/Login.jsx`
- `src/app/pages/Notifications.jsx`
- `src/app/pages/Reports.jsx`
- `src/app/pages/Settings.jsx`
- `src/modules/auth/pages/LoginPage.jsx`
- `src/modules/consumption/pages/DashboardPage.jsx`
- `src/new-file.jsx`

Qué falta / recomendaciones:
- Revisar imports que contengan extensiones explícitas a `.ts`/`.tsx` y actualizarlos si quedan referencias.
- Ejecutar `pnpm install` (recomiendo usar `pnpm`) o `npm install --legacy-peer-deps` para instalar dependencias.
- Iniciar servidor con `pnpm dev` o `npm run dev`.

Cómo ejecutar (local):
```bash
# instalar dependencias (recomiendo pnpm)
pnpm install

# iniciar servidor de desarrollo
pnpm dev
```

Notas:
- Mantengo los archivos TypeScript originales en el repositorio; he añadido las versiones `.js`/`.jsx` al mismo árbol. Si deseas, puedo eliminar los `.ts`/`.tsx` originales y actualizar todos los imports para usar sólo `.jsx`/`.js`.
- Si quieres que haga la eliminación y la actualización de imports automáticamente, lo hago en el siguiente paso.

  # Frontend con i18n en React Native

  This is a code bundle for Frontend con i18n en React Native. The original project is available at https://www.figma.com/design/aWntmT2AoYHIp1V2OTrAJx/Frontend-con-i18n-en-React-Native.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  