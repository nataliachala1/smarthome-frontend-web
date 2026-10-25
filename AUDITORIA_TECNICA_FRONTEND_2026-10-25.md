# Auditoría técnica del frontend SmartHome

**Fecha:** 2026-10-25

**Repositorio:** `nataliachala1/smarthome-frontend-web`

**Idioma:** español
**Estado:** auditoría de primera pasada con correcciones en una rama aislada. No se fusionó ningún PR ni se modificaron las ramas `main`, `dev` o el PR #3.

## 1. Alcance y línea base

Se revisaron las referencias remotas publicadas y el grafo local disponible; la rama `dev` en `387673bd5f52bdf675686fa49ae00aa60464e0ed`, base del código auditado; configuración de React, TypeScript, Vite, ESLint, autenticación, cliente HTTP, tiempo real, rutas, navegación, emparejamiento Shelly, Docker/Nginx, Compose, documentación, pruebas y lockfiles. El código fuente de `dev` contiene 58 archivos bajo `web/src` y solo un archivo de pruebas, `web/test/shelly-pairing-contract.test.mjs`.

La rama local de reconciliación se preparó desde `c2166bbeb8bf78cf48e761519115a2e9a2b55b2e`. Ese commit tiene como padres directos el commit inicial de `main` (`5680d4ae3046112ada83216e88423a65c902b383`) y `dev` (`387673bd5f52bdf675686fa49ae00aa60464e0ed`). Así conserva ambos historiales sin fingir un ancestro común. El único conflicto al crearla fue el README; el árbol inicial de la aplicación quedó igual al de `dev` y se conservó el contenido funcional de ese README junto con el título de `main`.

Las correcciones descritas abajo están preparadas en esta misma rama como commits nuevos pendientes de publicar. El PR de reconciliación aún no existe: la integración de GitHub respondió `403 Resource not accessible by integration` al intentar crearlo. El commit inicial de reconciliación y ambos padres permanecen intactos.

## 2. Inventario Git y PR

`main` y `dev` no tienen ancestro común. `main` contiene un solo commit; `dev`, 26 commits que no pertenecen a `main`. `qa` apunta al mismo commit inicial de `main`. No existe `03-dev` en el inventario remoto actual.

| Rama remota | HEAD auditado | Protegida |
|---|---:|---:|
| `01-dev` | `10e4658` | No |
| `02-dev` | `7b6b5c0` | No |
| `04-dev` | `3a46002` | No |
| `05-dev` | `c481551` | No |
| `06-dev` | `818b27e` | No |
| `07-dev` | `b9393b1` | No |
| `08-dev` | `84c9c18` | No |
| `09-dev` | `dcab779` | No |
| `10-dev` | `3e60396` | No |
| `11-dev` | `f10c22a` | No |
| `12-dev` | `0de43bb` | No |
| `dev` | `387673b` | No |
| `main` | `5680d4a` | No |
| `qa` | `5680d4a` | No |
| `reconciliation/dev-to-main-2026-10-25` | `c2166bb` antes de estas correcciones | No |
| `revert-2-12-dev` | `105d667` | No |

La API de GitHub reportó `protected: false` para las 16 ramas y la lista de rulesets del repositorio está vacía. Es un hallazgo confirmado, no una recomendación ya aplicada.

Comparaciones de commits (`base...head`, cantidad única de commits de cada lado): `01-dev→02-dev 0/2`, `02-dev→04-dev 0/3`, `04-dev→05-dev 0/1`, `05-dev→06-dev 0/1`, `06-dev→07-dev 0/1`, `07-dev→08-dev 0/1`, `08-dev→09-dev 0/14`, `09-dev→10-dev 12/0`, `10-dev→11-dev 0/1`, `11-dev→12-dev 0/10`, `12-dev→dev 0/2`, `dev→revert-2-12-dev 0/1`. La secuencia no es una cadena lineal: por ejemplo, `10-dev` está 12 commits detrás de `09-dev`.

| PR | Estado verificado | Dictamen |
|---|---|---|
| #1 `12-dev → 09-dev` | Cerrado y fusionado | Integra el commit `0de43bb`. |
| #2 `12-dev → dev` | Cerrado y fusionado | Integra el mismo commit `0de43bb`; `dev` añade después dos commits. |
| #3 `revert-2-12-dev → dev` | Abierto, no fusionado, una confirmación por delante | El HEAD `105d667` es `Revert "12 dev"`; el diff de GitHub afecta 59 archivos, con 3.380 adiciones y 10.562 eliminaciones. |

### Dictamen del PR #3

El título y descripción dicen que integran mejoras de `12-dev`, pero el commit revierte la integración que el PR #2 ya llevó a `dev`. El diff elimina o reduce autenticación y páginas, módulos Shelly, APIs tipadas, tiempo real, configuración de entorno y Compose; además añade/reemplaza documentación antigua. La auditoría extensa que añade describe archivos JS, mocks y 2FA que no corresponden al estado actual de `dev`, que usa TSX y APIs reales; es documentación desfasada, no evidencia de que ese sea el estado vigente. Fusionarlo tal como está dejaría fuera trabajo vigente aunque sus commits sigan siendo recuperables por el historial. GitHub lo marca como integrable, pero eso no evalúa la intención ni la regresión funcional. No se editó, cerró ni fusionó el PR #3; debe seguir abierto hasta que su autor o responsable confirme la intención.

La rama local actual `08-dev` está limpia y en el mismo commit que `origin/08-dev` (0/0). El stash `stash@{0}` con el respaldo del cambio local de `vite.config.ts` sigue presente y no se aplicó ni eliminó.

## 3. Hallazgos y correcciones

Severidad: **Crítica**, **Alta**, **Media**, **Baja**. “Confirmado” describe evidencia del código; “riesgo” indica que no se observó explotación o que falta validar el contrato externo.

| ID / prioridad | Archivo y evidencia | Hallazgo y estado | Corrección mínima | Aceptación |
|---|---|---|---|---|
| F-01 / Alta | En `dev`, `web/index.html` refería `/src/main.jsx`; solo existe `web/src/main.tsx`. Build Vite 6.4.3 completó y generó el bundle, por lo que la discrepancia no bloqueó esta versión de Vite. | Confirmado como inconsistencia; **no** como bloqueo de compilación. El HTML también tenía `lang="en"` y título de React Native. | Corregido en la rama: script exacto `/src/main.tsx`, `lang="es"` y título SmartHome. | Build de producción y carga de URL directa en navegador; comprobar título y nombre accesible del documento. |
| F-02 / Crítica | En el baseline `dev`, `web/.github/workflows/ci-deploy.yml:27-30` ejecuta `npm run lint`, `npm run typecheck` y `npm run build`; `web/package.json` no tenía script `lint`. `web/eslint.config.mjs:1-4` importaba cuatro paquetes no declarados. | Fallo de CI confirmado: el job se detenía en el comando `lint`. | Preparados script `lint`, dependencias compatibles en `web/package.json` y lockfile. La instalación completa y lint no se pudieron ejecutar localmente por `ENOSPC`. | En runner limpio, `npm ci`, `npm run lint`, typecheck, tests y build pasan. |
| F-03 / Alta | Baseline `ci-deploy.yml:3-5` solo escuchaba `push` a `dev`; el mismo job validaba y publicaba a GHCR. | Confirmado: los PR no recibían este workflow y un cambio mezclaba validación con publicación. | Preparados eventos PR a `dev`/`main`, job de validación separado y publicación limitada a `push` a `dev`; el job Dokploy sigue con `if: false`. | PR ejecuta solo validaciones; push a `dev` publica después de validarlas; PR no inicia sesión en GHCR ni publica. Confirmar el primer run real tras disponer del PR. |
| F-04 / Alta | `web/src/app/contexts/AuthContext.tsx:45-67,89-92`; `web/src/shared/api/api-client.ts:65,98-110`; `web/src/shared/realtime/realtime-client.ts:9,17-25`. | Confirmado que el access token queda en `localStorage` y se usa en Bearer y en la autenticación Socket.IO. Es un **riesgo**: XSS podría exfiltrarlo; no se confirmó una vulnerabilidad XSS concreta. | Coordinar con backend la estrategia JWT/cookies/CSRF y pruebas de expiración, refresh concurrente y logout. No se cambió almacenamiento ni contrato a ciegas. | Pruebas integradas de login, expiración, refresh concurrente, logout y protección ante XSS/CSRF según contrato aprobado. |
| F-05 / Media | `AuthContext.tsx:58-70` consulta `/auth/me`, pero luego prefiere el objeto `user` persistido y parseado desde `localStorage`. `auth.api.ts:11-14` solo define `userId` y `role` para `/auth/me`. | Confirmado que los datos de perfil pueden quedar obsoletos; la autoridad de autorización debe seguir en backend. No se demuestra bypass de autorización en servidor. | Usar identidad/perfil vigente del backend; acordar los campos necesarios y validar JSON en runtime. | Tras cambiar nombre/rol en backend, UI muestra datos nuevos y API deniega acciones prohibidas aunque se altere storage. |
| F-06 / Media | `web/src/shared/api/api-client.ts:10-16,134-165` parsea JSON y devuelve `payload as T`. | Confirmado que TypeScript no valida la forma del JSON en ejecución; los tipos API no garantizan contratos. | Añadir validación runtime en respuestas críticas y errores HTTP, sin duplicar esquemas innecesarios. | Tests con respuesta válida, inválida, 204, HTML/proxy y errores 401/403. |
| F-07 / Media | `web/vite.config.ts:34-48` usaba `process.env.VITE_BACKEND_URL`; `web/.env.example` no documentaba la variable. | Confirmado: Vite no carga automáticamente valores de `.env` antes de evaluar el archivo de configuración. | Corregido con `loadEnv(mode, __dirname, '')`, default local y variable documentada. | Iniciar Vite con `.env` de prueba y confirmar que los proxies API, health y Socket.IO apuntan al target indicado. |
| F-08 / Alta antes de corregir | Baseline lock fijaba Vite `6.4.3`; `npm audit` reportó alertas altas en Vite y `source-map-js`. | Vulnerabilidad de dependencias confirmada por el audit del lockfile; no equivale a explotación en producción. | `npm audit fix --package-lock-only` subió parches compatibles; el audit final devuelve cero vulnerabilidades. | Repetir `npm ci` y `npm audit` en runner limpio y revisar cada actualización antes del release. |
| F-09 / Media | `web/tsconfig.json` tenía `strict: true` pero anulaba `noImplicitAny` y `strictNullChecks`. `OfflineContext.tsx` creaba contexto sin tipo y no tipaba `children`. | Confirmado; baseline estricto tenía un error con nullability en el contexto offline y 15 errores `noImplicitAny` en `Badge`, `Button`, `Card` e `Input`. | Corregido gradualmente: primero se tipó `OfflineContext` y se activó `strictNullChecks`; después se tiparon los cuatro componentes compartidos y se activó `noImplicitAny`. `strict` permanece en true. | `npm run typecheck` pasa ahora con ambos controles activos. Mantener la regla en nuevos módulos. |
| F-10 / Media | `web/src/app/App.tsx:61-73,306-311,351-359`. | Confirmado: `/reports` redirige por `activeHomeId` guardado en storage y `*` redirige a dashboard; no hay pantalla 404 ni una página propia de reportes en `dev`. | En fase de rutas, validar home contra API, preservar el destino de reportes y crear 404 sin reemplazar pantallas existentes. | Tests de URL directa, home inexistente, usuario sin homes, sesión no inicializada y ruta desconocida. |
| F-11 / Media | `web/src/shared/realtime/realtime-client.ts:5-28`; `web/nginx.conf:29-36`. | El cliente usa `/realtime` como namespace Socket.IO y Nginx proxya el path de transporte `/socket.io/`; esto puede ser correcto, pero no se confirmó el namespace ni la configuración del gateway backend. `transports: ['websocket']` impide fallback polling. | Confirmar namespace, path, auth y soporte WebSocket del backend/proxy; probar reconexión después de renovar sesión. | Prueba integrada con el namespace real, expiración y red interrumpida; validar fallback esperado. |
| F-12 / Media | `web/src/features/devices/pages/ShellyPairingPage.tsx`; `web/src/shared/api/shelly.api.ts:109-121`; único test `web/test/shelly-pairing-contract.test.mjs:4-13`. | Confirmado que las dos pruebas cubren codificación de rutas y formato/aleatoriedad de credenciales, no el ciclo completo. No se confirmó el contrato contra backend. | Mantener la generación criptográfica y probar sesión, identificación, expiración, cancelación, MQTT, completion, red interrumpida y respuestas inválidas con backend real. | Tests de integración verifican transición de estados, idempotencia, expiración y que una identidad manual no complete sin confirmación MQTT autenticada. |
| F-13 / Media | `docker-compose.yml:27,50,57,60,66`; `README.md:58-63`. | Confirmado que Compose requiere repos externos y `docker/mosquitto.conf`, ausentes en este repositorio. README sí advierte el requisito. Mailpit usa `latest`, lo cual resta reproducibilidad. | Mantener prerequisitos claros; fijar Mailpit a una versión y decidir si Compose integrado vive aquí o en repositorio de infraestructura. | `docker compose config` y stack reproducible con repos/config disponibles; build del frontend por separado. |
| F-14 / Media | Build actual con 731 módulos: `web/dist/assets/index-*.js` 871,62 kB sin comprimir y advertencia de Vite por superar 500 kB. | Confirmado como riesgo de rendimiento y descarga inicial, no como fallo de build. | Medir en navegador y dividir carga por rutas/módulos donde tenga impacto. | Lighthouse/Web Vitals en dispositivo representativo antes y después. |
| F-15 / Media | `web/src/components/ui/Input.tsx` mostraba un `<label>` separado del input y sin `htmlFor`. | Defecto de accesibilidad confirmado en el control compartido. | Corregido con `useId`, `id` estable y `htmlFor`; se mantuvo el diseño de las pantallas. | Axe y navegación teclado verifican nombre/relación del campo, error asociado y toggler de contraseña. |
| F-16 / Alta | API de ramas GitHub: las 16 ramas listadas aparecen `protected: false`; rulesets `[]`. | Confirmado: no hay protección ni checks obligatorios. | Proponer reglas para `main` y `dev` después de que CI sea estable: PR obligatorio, checks, bloquear force-push/borrado; no se cambió configuración remota. | Confirmar en GitHub reglas activas y probar que un push directo a rama estable sea rechazado. |
| F-17 / Media | `web/src/features/experience/pages/MobileParityPages.tsx:118-278` exporta varias páginas distintas desde un solo archivo. | Confirmado como carga de mantenimiento, no como error funcional. | Extraer cada página solo al tocar su módulo; conservar componentes y navegación. | Imports existentes y rutas siguen funcionando tras extracción. |

## 4. Validaciones ejecutadas

| Comando / validación | Resultado real | Límite |
|---|---|---|
| `npm run typecheck` después de activar `strictNullChecks` y `noImplicitAny` | Pasó. | Se ejecutó con las dependencias ya presentes en el workspace; no con un `npm ci` limpio. |
| `npm run typecheck -- --noImplicitAny` | Pasó después de tipar los componentes UI compartidos. | La revisión gradual se limitó a errores que produjo el baseline local. |
| `npm run test:contracts` | 2 pasaron, 0 fallaron. | Solo son pruebas unitarias de contrato de Shelly. |
| `npm run build -- --configLoader runner` | Pasó con Vite 6.4.3; 731 módulos, bundle JS 871,62 kB. | Ese `node_modules` corresponde al workspace preexistente; el lock ya resuelve Vite 6.4.5. El build debe repetirse con `npm ci`. |
| Build Vite con loader por defecto en el sandbox | Falló leyendo un directorio de configuración con `Acceso denegado`. | No se atribuye a un error de fuente; el build con `--configLoader runner` pasó. |
| `npm audit` final | `found 0 vulnerabilities`. | El lock fue actualizado; verificarlo otra vez tras instalación limpia. |
| `npm ci` / lint | No ejecutados localmente. | La instalación completa y el runtime ESLint temporal abortaron con `ENOSPC`; no se declara lint aprobado. |
| Docker | No se construyó imagen. | Docker CLI existe, pero el daemon/named pipe devolvió `permission denied`. |
| Navegador, responsive, teclado y axe | No ejecutados. | No se declara conformidad WCAG ni equivalencia visual. |
| Integración auth/API/Shelly con backend | No ejecutada. | El backend y Swagger vigente no están disponibles en este workspace. |
| Secret scan histórico | No ejecutado con gitleaks u otra herramienta; los archivos `.env` reales no forman parte del inventario de archivos rastreados localmente. | Esto no demuestra ausencia de secretos en todas las ramas o commits históricos. |

## 5. Plan de trabajo en orden

1. **Build y CI:** publicar la rama aislada, crear el PR Draft cuando el conector permita, ejecutar `npm ci`, lint, typecheck, tests, build y Docker en Linux. Resolver cualquier error real de lint antes de pedir revisión. Mantener publicación solo en `push` a `dev` y deploy apagado.
2. **Autenticación y contratos:** acordar JWT/cookie, payload real de `/auth/me`, refresh/logout, roles y errores con backend; añadir validación runtime y pruebas de concurrencia/expiración. No simular MFA ni cambiar auth sin contrato.
3. **Shelly y API:** contrastar capabilities, sesión, token de pairing y MQTT contra Swagger/backend; añadir integración y manejo de expiración/reintentos.
4. **Rutas:** inventariar cada enlace de Sidebar/Navbar/páginas, decidir pantalla de reportes, añadir 404 y validar el hogar activo sin borrar pantallas vigentes.
5. **Gobierno de ramas:** mantener PR #3 abierto hasta aclarar intención; activar protección de `main`/`dev` cuando los checks existan. No reescribir ramas ni hacer force-push.
6. **Cierre técnico:** con entorno disponible, construir Docker, validar Compose integrado, Nginx/WebSocket, navegación responsive, contraste, teclado y lector de pantalla; ejecutar escaneo de secretos sobre ramas e historial.

## 6. Pendiente para declarar completa la auditoría

- PR Draft de `reconciliation/dev-to-main-2026-10-25` hacia `main`; el conector devolvió 403 y no se creó.
- `npm ci` limpio y ejecución real de `npm run lint` con las nuevas dependencias.
- Docker build en un daemon funcional y comprobación de imagen/Nginx.
- Validación manual y automatizada de rutas, responsive y accesibilidad.
- Contratos y flujos integrados de auth, API, tiempo real y Shelly con backend disponible.
- Escaneo de secretos y dependencias sobre las referencias/historial requeridos.
- Confirmación del propósito de `qa` y resolución deliberada de ramas de trabajo antiguas; no eliminar ninguna durante esta auditoría.
- Confirmación de reglas de protección aplicadas por el propietario del repositorio.
- Aclaración de la intención del PR #3 por su responsable.

**Conclusión:** la reconciliación preserva las dos historias y la rama actual contiene correcciones incrementales verificadas por typecheck, build con loader runner, tests de contrato y audit del lock. No se debe declarar la auditoría completa ni fusionar hasta cerrar los pendientes anteriores. El PR #3 debe permanecer abierto y sin cambios.
