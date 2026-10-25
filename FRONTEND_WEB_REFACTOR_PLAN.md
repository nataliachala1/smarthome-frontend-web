# FRONTEND_WEB_REFACTOR_PLAN

## Resumen ejecutivo

El frontend web actual ya tiene una base funcional sólida: autenticación, rutas privadas/públicas, dashboard, hogares, dispositivos, consumo y notificaciones. Sin embargo, la experiencia visual y la arquitectura de navegación no están alineadas con el frontend móvil vigente ni con la identidad visual definida por el producto.

La estrategia recomendada no es una reescritura del frontend, sino una refactorización controlada del shell, layout, navegación, tokens visuales y módulos clave para acercar la web al mismo lenguaje del móvil sin romper flujos ya funcionales.

Principios guía:
- Priorizar el frontend móvil como referencia visual y funcional.
- Mantener la lógica existente de auth, rutas, APIs y Socket.IO.
- Reusar módulos actuales en lugar de duplicarlos.
- Centralizar tokens y colores para evitar variantes de azul y estilos dispersos.
- Refactorizar primero el shell global: Sidebar, Header, layout principal y manejo de tema.
- Resolver capas de routing, permisos y navegación antes de refactorizar vistas internas.

## A. Arquitectura actual

### Stack y estructura
- Frontend React + Vite + TypeScript.
- Enrutamiento con React Router v7.
- UI basada en Tailwind CSS y componentes locales (`components/ui/*`).
- Estilo visual y tokens definidos parcialmente en `src/styles/theme.css`.
- Autenticación en `src/app/contexts/AuthContext.tsx` con almacenamiento local de `token` y `user`.
- Socket.IO para notificaciones y eventos en tiempo real en `src/shared/realtime/realtime-client.ts`.
- API wrapper centralizado en `src/shared/api/api-client.ts` usando `fetch` + localStorage token.

### Patrón general
- `App.tsx` monta `BrowserRouter`, `ThemeProvider`, `OfflineProvider`, `AuthProvider` y el árbol de rutas.
- `DashboardLayout.tsx` crea el shell global con `Sidebar`, `Navbar` y `OfflineBanner`.
- Las páginas se agrupan por feature: `auth`, `dashboard`, `homes`, `devices`, `notifications`, `reports`, `settings`, `consumption`.
- Las llamadas HTTP están aisladas en archivos `*.api.ts` bajo `src/shared/api`.
- El estado global es mínimo y local a cada feature, con contexto para Auth, Offline y Theme.

### Qué funciona bien
- La autenticación y rutas privadas/públicas están bastante bien estructuradas.
- Existen módulos funcionales de dashboard, hogares, dispositivos, notificaciones y consumo.
- La base de layout, cards, botones e inputs ya deja espacio para un shell más consistente.
- El proyecto ya cuenta con un modelo de consumo y un sistema de eventos en tiempo real que encaja con la lógica del producto.

### Qué no funciona del todo bien
- El shell visual no está completamente alineado con la referencia móvil.
- Hay inconsistencias de color, radio, tipografía y densidad visual.
- Hay navegación y feature naming inconsistentes con la lógica de producto.
- Algunas pantallas funcionales existen pero no están conectadas con el menú principal o con el routing esperado.

## B. Estructura de carpetas

```
web/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── OfflineContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── layouts/
│   │       └── DashboardLayout.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── OfflineBanner.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   ├── features/
│   │   ├── auth/pages/
│   │   ├── consumption/pages/Consumption.tsx
│   │   ├── dashboard/pages/DashboardPage.tsx
│   │   ├── devices/pages/
│   │   ├── homes/pages/
│   │   ├── notifications/pages/Notifications.tsx
│   │   ├── reports/pages/Reports.tsx
│   │   └── settings/pages/Settings.tsx
│   ├── i18n/
│   │   └── config.ts
│   ├── shared/
│   │   ├── api/
│   │   │   ├── api-client.ts
│   │   │   ├── audit.api.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── consumption.api.ts
│   │   │   ├── devices.api.ts
│   │   │   ├── homes.api.ts
│   │   │   ├── notifications.api.ts
│   │   │   ├── reports.api.ts
│   │   │   ├── settings.api.ts
│   │   │   └── shelly.api.ts
│   │   └── realtime/
│   │       └── realtime-client.ts
│   ├── styles/
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   ├── main.tsx
│   └── vite-env.d.ts
└── package.json
```

### Observación clave
La estructura es bastante ordenada y modular, pero los módulos de shell y design tokens están dispersos: `Sidebar`, `Navbar`, `DashboardLayout`, `ThemeContext`, `Settings`, `theme.css`, `tailwind.css`, `index.css` y el uso directo de clases hardcodeadas (`bg-[#...]`, `text-[#...]`, `border-[#...]`) se reparten por la base de la app.

## C. Rutas actuales

Rutas públicas:
- `/login`
- `/register`
- `/activate-account`
- `/resend-activation`
- `/forgot-password`
- `/reset-password`

Rutas privadas:
- `/` -> redirige a `/dashboard`
- `/dashboard`
- `/homes`
- `/homes/:homeId/dashboard`
- `/homes/:homeId/devices`
- `/homes/:homeId/devices/add`
- `/homes/:homeId/devices/add/discover`
- `/homes/:homeId/devices/add/ip`
- `/homes/:homeId/devices/:deviceId`
- `/homes/:homeId/devices/:deviceId/edit`
- `/reports`
- `/notifications`
- `/settings`
- `*` -> redirige a `/dashboard`

### Problemas de routing
- La funcionalidad de energía/consumo (`Consumption.tsx`) existe, pero no está conectada en el routing principal.
- El sidebar indica navegación principal con Dashboard, Homes, Reports, Notifications y Settings, pero la estrategia del producto indica una estructura de Shell con Inicio, Hogares, Energía, Perfil.
- El nombre de la ruta de consumo no aparece en el menú global a pesar de haber una feature completa.
- `DashboardPage` y `HomeDashboardPage` escriben en `localStorage` y navegan con rutas sensibles a home actual, pero no existe un patrón centralizado de contexto de hogar activo.

## D. Componentes actuales

### Shell global
- `DashboardLayout.tsx`: layout de aplicación con `Sidebar` y `Navbar`.
- `Sidebar.tsx`: menú lateral con collapse y avatar/acciones del usuario.
- `Navbar.tsx`: header con notificaciones y acciones rápidas.
- `OfflineBanner.tsx`: banner de conexión.

### Componentes UI base
- `Card.tsx`
- `Button.tsx`
- `Input.tsx`
- `Badge.tsx`

### Features principales
- `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `ActivateAccountPage`, `ResendActivationPage`
- `DashboardPage`
- `Homes`
- `HomeDashboardPage`
- `Devices` / `DeviceDetailPage` / `EditDevicePage` / `AddDevicePage` / `DiscoverDevicePage` / `AddDeviceByIpPage`
- `Notifications`
- `Reports`
- `Settings`
- `Consumption`

### Evaluación
Los componentes principales ya existen y son funcionales, pero no están integrados bajo un sistema visual único. El problema principal no es falta de componentes, sino falta de un sistema de tokens y shell compartidos.

## E. APIs actuales

Archivos principales:
- `auth.api.ts`: login, register, activate, resend activation, forgot password, reset password, me.
- `homes.api.ts`: listas, creación, edición, invitaciones, miembros, roles, leave home.
- `devices.api.ts`: listar, crear, actualizar, desactivar, controlar dispositivos.
- `notifications.api.ts`: listado, unread count, marcar como leída, dismiss.
- `consumption.api.ts`: resumen, diario, lecturas, consumo por dispositivo.
- `reports.api.ts`: reportes.
- `settings.api.ts`: ajustes.
- `audit.api.ts`: auditoría.
- `shelly.api.ts`: integración de equipos Shelly.

### Observaciones
- El patrón API está bien encapsulado a través de `apiClient`.
- Se duplican responsabilidades de sesión/estado local entre `AuthContext`, `localStorage` y `apiClient`.
- Hay poca normalización de errores a nivel global (solo `ApiError` con una capa base, pero no una estrategia reutilizable por feature).
- La capa HTTP es sólida para continuar, pero no centraliza metadata de permisos ni estado de sesión de forma más estructurada.

## F. Socket.IO actual

Archivo principal:
- `src/shared/realtime/realtime-client.ts`

Configuración actual:
- Conecta a `http://localhost:3000/realtime`
- Envía el token JWT en `auth.token`
- usa `transports: ['websocket']`

Eventos utilizados:
- `notification.created`
- `notification.unread_count.updated`

Se consumen en:
- `Navbar.tsx`
- `Notifications.tsx`
- `DeviceDetailPage.tsx` (según estructura revisada)

### Observación
El socket está bien integrado y la lógica de eventos ya existe. El punto de mejora no es la tecnología sino la consolidación del estado de notificaciones y la visualización del contador en el shell, con un patrón más predecible y menos disperso.

## G. Contextos y estados globales

Contextos actuales:
- `AuthContext`: sesión, estado autenticado, usuario actual.
- `ThemeContext`: tema claro/oscuro/system.
- `OfflineContext`: estado de conexión.

Estados y persistence local:
- `localStorage.user`
- `localStorage.token`
- `localStorage.theme`
- `localStorage.activeHomeId`
- `i18nextLng`

### Problemas
- Hay más de una fuente de verdad para el tema y la UI (ThemeContext + Settings local state + `document.documentElement.classList`).
- El hogar activo se gestiona con `localStorage` sin un contexto global dedicado.
- El usuario y la sesión se guardan parcialmente disenlazados: auth context, api client y localStorage comparten responsabilidades pero no un mismo contrato.

## H. Autenticación

La autenticación actual está implementada con:
- Login con email/password.
- Registro con validación de confirmación.
- Activación de cuenta.
- Reenvío de activación.
- Olvido y reset de contraseña.
- Verificación de sesión con `/auth/me`.

### Evaluación
La capa de auth es funcional y bastante clara, pero aún hay una oportunidad para consolidar:
- centralizar la sesión y la redirección,
- desacoplar la lógica de persistence,
- unificar el manejo de permisos/roles,
- asegurar que los estados de auth e inicialización estén más predecibles para componentes del shell.

## I. Roles

Los roles aparecen en varias capas:
- `AuthUser.role?: string`
- `CurrentUser.role: string`
- `HomeMember.role: string`
- `Invitation.role: 'MEMBER' | 'GUEST'`
- acciones de usuario en viviendas y permisos por miembro.

### Problemas
- No hay un `RoleGuard` claro ni un mecanismo centralizado para controlar permisos por pantalla.
- Los roles del owner/member/guest se usan parcialmente, pero la UI no refleja una estrategia uniforme de acceso en el menú, páginas y acciones.
- Esto se vuelve más importante cuando se refactoriza el shell y la navegación global.

## J. Tema

Los tokens actuales están definidos parcialmente en `src/styles/theme.css`, con variables CSS globales y un `@theme inline` de Tailwind. Sin embargo, en varios puntos del código se siguen usando valores hardcodeados como:
- `#1866C1`
- `#1b254b`
- `#0f111a`
- `bg-[#...]`, `text-[#...]`, `border-[#...]`

### Paleta oficial sugerida
- PRIMARY: `#0047AB`
- PRIMARY SOFT: `#E8F1FF`
- BACKGROUND: `#F8FAFC`
- CARD: `#FFFFFF`
- TEXT: `#0A192F`
- MUTED: `#64748B`
- BORDER: `#E2E8F0`
- SUCCESS: `#22C55E`
- DANGER: `#FF3B20`
- DARK BACKGROUND: `#101827`
- DARK CARD: `#172033`

### Problema actual
El frontend usa varias variantes de azul y varios tonos de gris incompatibles, lo que produce inconsistencias visuales incluso dentro del mismo layout.

## K. Problemas visuales

1. Colores sembrados por toda la app, no centralizados.
2. Mezcla de backgrounds, cards y dark mode con tonalidades inconsistentes.
3. El shell no refleja aún la identidad del móvil salvo pequeños puntos aislados.
4. Variantes extremas de texto y bordes que hacen que la experiencia se sienta fragmentada.
5. Algunos paneles usan `bg-white`, otros `bg-[#151824]`, otros `bg-[#f4f7fe]`, sin una base visual clara.
6. Los botones principales tienen colores locales, no un sistema unificado.

## L. Problemas de UX

1. La navegación principal no refleja la estructura del producto: falta una orientación clara de Inicio / Hogares / Energía / Perfil.
2. El dashboard no usa un patrón claro de acciones rápidas ni de estado del hogar actual.
3. Hay más de una forma de manejar el tema: `ThemeContext`, `Settings` y clases directas.
4. El usuario no siempre tiene un “contexto” claro del hogar y del estado global de la app.
5. El shell no está aún optimizado para laptop, desktop, tablet y mobile browser con una experiencia consistente.

## M. Problemas de routing

1. Faltan rutas/acciones para "Energía" dentro del flujo principal.
2. Se reparte la navegación entre menú lateral, dashboard y módulos funcionales sin una vía de acceso primaria clara.
3. Existen pantallas importantes pero no se navegan desde el shell principal.
4. El código no centraliza un patrón para "contexto de hogar activo" y `homeId` en varias rutas.
5. La app aún depende de redireccionamientos estáticos y múltiples localStorage writes para escenarios de contexto.

## N. Problemas de endpoints

1. Hay endpoints y servicios implementados (`consumption`, `reports`, `settings`, `audit`), pero no todos están conectados con la navegación principal. Esto genera una sensación de funcionalidad “incompleta”.
2. `settings.api.ts` no usa tipos estrictos para el payload; se puede mejorar con interfaces explícitas.
3. `api-client.ts` centraliza fetch y manejo de error, pero no tiene una estrategia uniforme para permisos, refresh token o manejo de errores de negocio.
4. El cliente real-time no gestiona reconexión ni reconexión segura tras token expirado.
5. La app asume sesiones en localStorage sin un contrato fuerte de invalidación consistente entre todas las pantallas.

## O. Código duplicado

Patrones repetidos:
- Dashboard cards repetidos en `DashboardPage`, `HomeDashboardPage`, `Homes`, `Settings` y demás vistas.
- Mismo patrón de encabezado, acción y card con texto de carga/estado/error repetido.
- Repetición de `localStorage.setItem('activeHomeId', homeId)` en varias features.
- Múltiples `Button`/`Card`/`Input` reutilizados sin un wrapper visual consistente para la marca.
- Tema y preferencias gestionadas en varios sitios en lugar de un único source of truth.
- Estructuras de cards con bordes y radios repetidos, muchas veces usando números y colores directos.

## P. Código posiblemente obsoleto

1. `ThemeContext.tsx` y `Settings.tsx` gestionan el tema de forma parcialmente redundant.
2. `Reports` puede existir como una feature usada o no; la navegación no refleja necesariamente su propósito deseado.
3. `OfflineContext.tsx` existe, pero la UX real de fallback/offline no está claramente integrada en el shell.
4. `Consumption.tsx` está presente como feature funcional, pero no conectada en el menú y en ocasiones parece “invisible” como parte de la experiencia de navegación.
5. `AUDITORIA_FRONTEND_SMARTHOME.md` puede ser un artefacto de diagnóstico previo, pero no sustituye la arquitectura del producto ni el sistema visual final del shell.

## Q. Riesgos de modificar cada módulo

### 1) App / router / layout principal
Riesgo: `ALTO`
- Tiene influencia directa sobre todo el frontend.
- Cambios incorrectos pueden romper autenticación, redirect y navegación.

### 2) Shell: Sidebar / Navbar / DashboardLayout
Riesgo: `ALTO`
- Es la estructura más visible de la app y afecta todas las pantallas.
- Debe hacerse con cuidado para no introducir regresiones en mobile, desktop y tablet.

### 3) ThemeContext / UI tokens / theme.css
Riesgo: `ALTO`
- Si se centralizan mal los tokens, pueden aparecer inconsistencias globales y cambios visuales no deseados.

### 4) Dashboard / HomeDashboard / Homes
Riesgo: `MEDIO-ALTO`
- Son las rutas más nucleares del producto y se usan para navegación de hogar y dispositivos.

### 5) Devices / AddDevice / Discover / EditDevice
Riesgo: `MEDIO`
- La lógica funcional ya existe; la atención debe centrarse en mantener el flujo y ajustar la visualidad del shell.

### 6) Notifications / realtime-client
Riesgo: `MEDIO`
- La integridad del socket y del contador debe mantenerse intacta.

### 7) Consumption / Reports / Settings
Riesgo: `MEDIO`
- Existen como features funcionales; el riesgo es más de integración y cohesión visual que de lógica de negocio.

### 8) AuthContext / api-client
Riesgo: `ALTO`
- La base de acceso, sesión y permisos; un cambio incorrecto compromete la app completa.

## R. Plan de migración

### Fase 1: Auditoría y base visual
- Definir la paleta centralizada con los tokens oficiales del producto.
- Crear una capa de tokens visuales reutilizables para background, cards, text, muted, border, primary, dark variants.
- Eliminar estilos hardcodeados por clase directa en favor de tokens y componentes base estándar.

### Fase 2: Shell global (prioridad máxima)
- Refactorizar el `DashboardLayout` con base visual consistente.
- Reorganizar `Sidebar` con:
  - ancho desktop ~240px,
  - collapsed ~72px,
  - navegación principal: Inicio / Hogares / Energía / Perfil,
  - secundarias ordenadas y no interminables,
  - estados visibles para active, hover, collapsed y dark mode.
- Reubicar header con notificaciones, avatar y contexto de usuario.
- Alinear el shell para laptop, desktop, wide desktop, tablet y mobile browser.

### Fase 3: Alinear routing con la experiencia del producto
- Incorporar la ruta de `Consumption` dentro del shell y la navegación principal.
- Ajustar la navegación para que el flujo se vea como una misma aplicación, no como múltiples módulos.
- Normalizar home context y rutas relacionadas con un patrón único.
- Revisar los guardias de rutas y asegurar que permisos/roles no queden ad hoc.

### Fase 4: Reutilizar y consolidar componentes
- Centralizar Button, Card, Input, Badge y layout shell bajo una estructura coherente.
- Reducir duplicación de cards en dashboards y listados.
- Eliminar variantes visuales de azul, gris y borde que se repiten sin una base común.

### Fase 5: Mejorar gestión de estado global
- Reducir la duplicidad de thema y session state.
- Consolidar `localStorage` y `AuthContext` en un modelo más claro para auth y home active context.
- Mantener eventos de Socket.IO y estados de notificaciones dentro de un flujo único y predecible.

### Fase 6: Pulido de UX y consistencia de producto
- Revisar dashboards, homes, settings y notifications con el mismo lenguaje visual.
- Alinear copy, radii, espaciado, jerarquía tipográfica y densidad visual con la referencia móvil.
- Evitar “múltiples aplicaciones dentro de una misma web” y mantener una identidad única.

### Fase 7: Validación final
- Probar navegación principal, shell responsive, auth flow, home context y notificaciones.
- Verificar que los endpoints existentes sigan funcionando.
- Validar que la experiencia web se sienta como “mismo producto Smart Home, diferente plataforma”, no como un rediseño paralelo.

## Recomendación de implementación

La próxima intervención debe empezar por el shell global y la capa de tokens visuales. Sin esa base, cualquier refactor interno de módulos será temporal y fragmentado.

El orden recomendado es:
1. tokens/tema,
2. shell global,
3. routing principal,
4. dashboard/home,
5. consumo y navegación de energía,
6. pulido de páginas secundarias,
7. validación final.

Este enfoque permite conservar la lógica funcional ya existente, capitalizar la inversión hecha en la app actual y alinear la web con el lenguaje del frontend móvil sin una reescritura desde cero.
