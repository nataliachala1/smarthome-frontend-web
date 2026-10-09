# Informe de auditoría — SmartHome

**Fecha de corte:** 8 de octubre de 2026
**Alcance:** revisión estática del frontend y backend enlazados
**Estado:** auditoría y plan de corrección; no se modificaron repositorios ni ramas

## 1. Resumen ejecutivo

La revisión encontró una base funcional amplia en ambos repositorios, pero no hay evidencia suficiente para considerar el despliegue reproducible ni la integración lista para producción. Los riesgos más urgentes se concentran en la configuración de correo y Docker Compose, el secreto JWT de ejemplo, la diferencia entre el ciclo de sesión que implementa el backend y el que usa el frontend, y las restricciones de control de dispositivos que no coinciden entre ambas capas.

También hay rutas y funciones que parecen parciales o desconectadas: alertas y favoritos muestran estados vacíos, la pantalla de perfil no consume toda la API de usuarios, el frontend declara una ruta de auditoría sin un controlador correspondiente y no ofrece una página 404. La revisión no ejecutó los repositorios, por lo que los efectos de ejecución indicados abajo son riesgos deducidos del código y requieren confirmación mediante pruebas.

**Conclusión:** antes de liberar, conviene resolver los bloqueos de configuración y despliegue, verificar el esquema/migraciones de base de datos y probar los contratos de autenticación y control de dispositivos de extremo a extremo.

## 2. Repositorios y versión revisada

| Componente | Repositorio | Rama revisada | Commit revisado | Observación |
|---|---|---|---|---|
| Frontend web | [smarthome-frontend-web](https://github.com/nataliachala1/smarthome-frontend-web) | `12-dev` | `c99d191ea63b0f4fc2869921d24010bfcdf7ccd0` | El commit más reciente observado actualiza documentación del README. |
| Backend | [smarthome-backend](https://github.com/nataliachala1/smarthome-backend) | `09-dev` | `8235727620aae63f4bef79813fa3ffcf2f30709b` | Revisión del árbol de esa rama. |

En ambos repositorios, `main` contiene únicamente un README breve y `qa` apunta al mismo commit que `main`, según lo observado durante la auditoría. El código revisado está en las ramas de desarrollo indicadas. No se encontraron estados de CI asociados a los commits consultados. Esto hace necesario confirmar qué rama consume el proceso real de despliegue.

## 3. Alcance y límites de la revisión

La auditoría fue estática y se basó en los archivos visibles de los repositorios y sus contratos documentados. Incluyó configuración, rutas, autenticación, control de dispositivos, clientes API y estructura de pruebas.

No se hizo clon local, compilación, ejecución del frontend o backend, pruebas contra una base de datos, broker MQTT, dispositivos Shelly ni recorrido de usuario en navegador. Tampoco se incluyó el repositorio de base de datos. Por ello:

- Los desajustes observables entre archivos se consideran hallazgos de código.
- Los errores de arranque, las respuestas reales del servidor y el comportamiento con hardware son riesgos que requieren confirmación en ejecución.
- No se pudo certificar que las migraciones disponibles coincidan con el esquema de una instalación real.
- Las puntuaciones de la siguiente sección son estimaciones cualitativas de la auditoría estática; no representan cobertura de pruebas ni una métrica automatizada.

## 4. Evaluación orientativa

| Área | Estimación | Motivo principal |
|---|---:|---|
| Frontend | 65% | Cobertura de pantallas y clientes API amplia, con funciones parciales y verificaciones automatizadas limitadas. |
| Backend | 65% | Módulos de negocio y pruebas presentes; persisten riesgos de configuración, seguridad y despliegue. |
| Integración | 50% | Hay discrepancias de sesión, autorización de control y forma de respuesta; no hubo prueba real entre servicios. |
| UX/UI | 60% | Hay flujos principales, junto con estados vacíos, acciones sin explicación y una ruta de error incompleta. |
| Seguridad | 45% | Riesgo por secreto JWT de ejemplo, token en almacenamiento local, configuración de WebSocket y falta de límite de tasa IP observado. |
| Preparación para producción | 25% | Rama de despliegue, configuración de contenedores, correo, migraciones y CI necesitan verificación o corrección. |

## 5. Hallazgos prioritarios

### H1 — Correo: configuración requerida no coincide con Compose

**Prioridad:** alta; verificar antes de desplegar.
**Backend:** `src/modules/auth/infrastructure/email/gmail-email-sender.ts`
**Configuración relacionada:** `docker-compose.yml` del frontend y `.env.example` del backend.

El constructor del emisor de correo requiere `SMTP_USER` y `SMTP_APP_PASSWORD` mediante `ConfigService.getOrThrow`. El transporte selecciona Gmail de forma fija. El servicio backend en Compose define `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` y `SMTP_FROM`, pero no esas dos variables requeridas. El ejemplo de entorno del backend tampoco documenta la configuración SMTP necesaria. Además, el emisor no utiliza el host y puerto que Compose configura.

**Impacto probable:** si ese servicio se instancia durante el arranque, el backend puede fallar al iniciar por variables ausentes. Aunque inicie, el emulador de correo local configurado en Compose no será utilizado por este emisor.

**Corrección propuesta:** hacer que el transporte use las variables SMTP configuradas, añadir valores explícitos y seguros al ejemplo de entorno y documentar un flujo local (por ejemplo, Mailpit) y uno de producción. Añadir una prueba de configuración/arranque sin enviar correos reales.

### H2 — Secreto JWT de ejemplo débil y sin validación de fortaleza

**Prioridad:** alta.
**Archivos:** `.env.example` y `src/main.ts` del backend.

El ejemplo contiene `JWT_SECRET=change-me-in-production`. La validación observada comprueba que la variable exista, pero no que se haya reemplazado el valor conocido ni que tenga longitud/entropía suficientes.

**Impacto:** una instalación desplegada con el valor de ejemplo permitiría firmar o falsificar tokens con una clave pública y predecible.

**Corrección propuesta:** rechazar valores de ejemplo conocidos en producción, exigir un secreto generado con fortaleza suficiente y proporcionar instrucciones para generarlo y guardarlo como secreto de entorno. No incluir secretos reales en el repositorio.

### H3 — Compose apunta a una versión de backend distinta y falta el Dockerfile esperado

**Prioridad:** alta para reproducibilidad del despliegue.
**Archivo:** `docker-compose.yml` del frontend; árbol revisado del backend `09-dev`.

Compose usa el contexto `./smarthome-backend-08-dev`. El backend solicitado y revisado está en `09-dev`. En el árbol de esa rama no se observó un Dockerfile, aunque Compose espera construir una imagen con Dockerfile. La configuración también referencia carpetas externas, entre ellas `./smarthome-database-dev` y `./docker/mosquitto.conf`; el README del frontend indica que deben existir carpetas hermanas.

**Impacto:** el despliegue depende de una estructura local concreta y puede construir una versión anterior o fallar al no encontrar el contexto/Dockerfile. La configuración actual no permite reproducir el stack únicamente desde los dos repositorios enlazados.

**Corrección propuesta:** acordar una estructura de despliegue versionada, apuntar a la rama/versión de backend aprobada, incluir o referenciar de forma reproducible el Dockerfile y documentar las dependencias externas. Verificar un arranque limpio en una máquina sin estado local.

### H4 — Ramas de desarrollo y ramas de publicación no están alineadas

**Prioridad:** alta antes de una liberación.
**Observación:** `main` y `qa` son README-only y `qa` comparte SHA con `main`, mientras el código revisado está en `12-dev` y `09-dev`.

**Impacto:** si el despliegue o las revisiones automáticas toman `main` o `qa`, no estarán consumiendo la aplicación auditada. No se observaron checks de CI asociados a los commits consultados.

**Corrección propuesta:** documentar el flujo de ramas y el origen real del despliegue; promover el código mediante PR; activar checks obligatorios de compilación, pruebas y análisis antes de fusionar.

### H5 — Backend implementa refresh/logout; frontend no completa el ciclo

**Prioridad:** alta para consistencia de autenticación.
**Frontend:** `src/.../auth.api.ts`, `AuthContext.tsx`, `api-client.ts` (rutas observadas en la auditoría).
**Backend:** rutas `POST /api/v1/auth/refresh` y `POST /api/v1/auth/logout`.

El backend implementa refresh con rotación mediante cookie HttpOnly y endpoint de logout. El cliente frontend auditado no ofrece wrappers para refresh/logout. El frontend guarda el access token en `localStorage`; ante un 401 limpia la sesión local y redirige a login. El logout de la interfaz borra estado local y desconecta el socket, pero no revoca la sesión en el servidor.

**Impacto:** una sesión puede terminar con reautenticación forzada aunque el refresh siga vigente, y el logout no invalida el token/sesión del backend. El almacenamiento local también expone el access token a código JavaScript ejecutado por XSS.

**Corrección propuesta:** integrar refresh con manejo concurrente de 401, consumir logout para revocar la sesión, coordinar cookie/credenciales y mantener el access token en memoria si el diseño del producto lo permite. Probar rotación, expiración, logout, varias solicitudes simultáneas y revocación.

### H6 — Permisos de control de dispositivos difieren entre frontend y backend

**Prioridad:** alta; afecta una función central y puede explicar controles restringidos.
**Frontend:** `Devices.tsx`, `DeviceDetailPage.tsx).
**Backend:** controlador y caso de uso de control de dispositivos.

El frontend solo muestra el control cuando `home.createdBy === user.id`; además lo deshabilita si `connectivityStatus` no es `ONLINE`. El backend documenta acceso para `OWNER` o `MEMBER`, pero exige también que el dispositivo esté activo, online y tenga `manufacturerDeviceId` y protocolo `MQTT`.

**Impacto:** un MEMBER autorizado por el backend no ve el control en la UI. Un OWNER que no sea creador tampoco lo verá. Cuando el dispositivo no es controlable, la interfaz no explica cuál condición falta. La auditoría estática no permite determinar el estado real de un dispositivo Shelly.

**Corrección propuesta:** acordar una sola regla de autorización basada en rol/permisos del backend; presentar en la UI la razón concreta por la que el control no está disponible; devolver errores diferenciados para dispositivo offline, no provisionado o protocolo incompatible. Probar OWNER, MEMBER y usuarios sin acceso.

### H7 — Contrato de respuesta del control no coincide con el tipo frontend

**Prioridad:** media-alta.
**Frontend:** `devices.api.ts`.
**Backend:** endpoint de comando de dispositivo.

El frontend tipa la respuesta como `{ accepted: boolean }`. El backend observado devuelve `id`, `homeId`, `command`, `status: 'COMMAND_PUBLISHED'`, `previousIsOn` y `connectivityStatus`.

**Impacto:** el tipo del frontend no describe el contrato entregado por el servidor. Puede ocultar información útil y provocar errores si la interfaz depende de `accepted`.

**Corrección propuesta:** definir un contrato compartido/documentado y actualizar tipos y estados de UI. Añadir prueba de contrato para respuesta aceptada, rechazo y fallo de publicación MQTT.

### H8 — Migración y esquema de base de datos no están certificados

**Prioridad:** alta como pendiente de liberación.
**Referencia disponible:** `ALCANCE_2026_09_08.md`; el repositorio de base de datos no estaba entre los enlaces.

El documento indica que se necesitaba una migración antes de la versión actual y que el changeSet 65 se probó de forma aislada, pero todavía no se había aplicado a la base local `smarthome_db` en el momento que describe.

**Impacto:** no es posible confirmar que la base instalada acepte la versión actual del backend o que migraciones y modelos estén alineados.

**Corrección propuesta:** revisar el repositorio de base de datos, aplicar las migraciones desde una copia limpia y una base ya existente, y validar rollback/compatibilidad antes de publicar.

### H9 — Cliente de auditoría sin endpoint backend observado

**Prioridad:** media.
**Frontend:** `audit.api.ts`.
**Backend:** no se observó controlador de auditoría correspondiente.

El wrapper frontend apunta a `/audit`; en el backend auditado no aparece una ruta/controlador correspondiente. No se encontró una pantalla activa que dependa de ese wrapper.

**Impacto:** cualquier llamada al wrapper respondería previsiblemente con 404.

**Corrección propuesta:** implementar el endpoint si es parte del alcance; de otro modo, retirar el wrapper no utilizado y documentar la función como pendiente.

### H10 — Canales y seguridad de WebSocket necesitan el mismo ciclo de sesión que HTTP

**Prioridad:** media-alta.
**Backend:** `RealtimeGateway`.

La configuración observada permite `cors.origin: true`. El gateway valida el JWT, pero no verifica `sessionVersion` ni el estado de la cuenta como el guard HTTP. La revocación de sesión que aplica en HTTP podría no invalidar de inmediato una conexión socket ya autenticada.

**Impacto:** el comportamiento de origen y revocación puede ser más permisivo/inconsistente que el de las peticiones HTTP.

**Corrección propuesta:** permitir solo orígenes configurados y validar estado de cuenta/sesión también en WebSocket, incluyendo estrategia para desconectar sockets cuando se revoca una sesión.

### H11 — Protección contra abuso por IP no observada

**Prioridad:** media-alta para exposición pública.
**Backend:** dependencia `@nestjs/throttler` presente; no se observó su registro en `AppModule`.

La dependencia de limitación de tasa aparece instalada, pero no se observó activación global. Se observó bloqueo de cuenta basado en usuario; no se identificó límite de solicitudes por IP.

**Impacto:** endpoints de acceso y recuperación de contraseña podrían quedar expuestos a automatización o abuso por volumen.

**Corrección propuesta:** configurar límites por IP/usuario para login, registro y recuperación; probar respuestas 429, ventanas y desbloqueo. Ajustar proxies de confianza al entorno de despliegue.

### H12 — Funciones parciales, pantallas vacías y navegación incompleta

**Prioridad:** media.
**Frontend:** rutas y páginas del frontend.

- `/alerts` y `/favorites` muestran estados vacíos estáticos y no se observaron endpoints backend asociados.
- El perfil usa datos de `AuthContext`; existe API backend `/users/me`, preferencias y desactivación de cuenta, pero el frontend no ofrece cliente de usuario completo en la superficie auditada.
- La sección de cuenta tiene partes de sesiones, seguridad, actividad e idioma estáticas o no conectadas.
- `/reports` redirige a consumo.
- `/access` gestiona miembros e invitaciones salientes; la API ofrece listado/aceptar/rechazar invitaciones entrantes que la página no usa.
- La ruta comodín `*` redirige al dashboard y no presenta una página 404.
- Los controles de dispositivo no describen por qué están deshabilitados.

**Impacto:** el usuario puede interpretar como error o falta de permiso una función que no está implementada/conectada, o no encontrar el motivo de una acción no disponible.

**Corrección propuesta:** etiquetar o completar las funciones parciales; conectar las APIs de usuario e invitaciones que estén dentro del alcance; agregar estados vacíos explicativos y una página 404; presentar el estado que bloquea el control.

### H13 — Calidad y pruebas frontend insuficientemente demostradas

**Prioridad:** media-alta para integración continua.
**Frontend:** `package.json` y árbol revisado.

Los scripts observados incluyen desarrollo, build y typecheck, pero no scripts de test o lint; no se observaron archivos de prueba frontend en el árbol revisado. El backend sí tiene pruebas unitarias y e2e, pero el resultado de CI no estaba disponible.

**Impacto:** los contratos y flujos de UI pueden cambiar sin una puerta automática que detecte regresiones.

**Corrección propuesta:** incorporar lint y pruebas de los flujos críticos de frontend; ejecutar pruebas e2e de backend contra dependencias controladas; exigir los checks en PR.

### H14 — Posible dato sensible en historial/documentación

**Prioridad:** media; validar historial.
**Frontend:** `AUDITORIA_FRONTEND_SMARTHOME.md`.

El archivo contiene una dirección de correo y un marcador de redacción para `SMTP_APP_PASSWORD`; en la versión inspeccionada no se veía una contraseña SMTP real. Si en versiones anteriores se publicó una credencial verdadera, el marcador actual no la revoca.

**Corrección propuesta:** revisar el historial de Git y rotar cualquier secreto que haya sido expuesto. Añadir escaneo de secretos al proceso de PR.

## 6. Rutas frontend observadas

### Públicas

- `/login`
- `/register`
- `/activate-account`
- `/resend-activation`
- `/forgot-password`
- `/reset-password`

### Privadas

- `/` redirige a `/dashboard`
- `/dashboard`
- `/homes`
- `/homes/:homeId/dashboard`
- `/homes/:homeId/consumption`
- `/homes/:homeId/devices`
- `/homes/:homeId/devices/add`
- `/homes/:homeId/devices/add/discover`
- `/homes/:homeId/devices/add/ip`
- `/homes/:homeId/devices/:deviceId`
- `/homes/:homeId/devices/:deviceId/edit`
- `/reports` redirige a consumo
- `/notifications`
- `/profile/settings` y `/settings` redirigen a `/profile#profile-settings`
- `/alerts`
- `/favorites`
- `/access`
- `/profile`
- `/account/:page` contempla personal, seguridad, sesiones, actividad, cierre de sesiones e idioma
- `/help`
- `/about`
- `*` redirige al dashboard (no es una página 404)

Nginx contiene fallback SPA, pero no se probó una carga directa de cada ruta ni la navegación con sesión real.

## 7. Matriz resumida de integración

| Dominio | Estado observado | Riesgo o pendiente |
|---|---|---|
| Auth: registro, login, activación, reenvío, recuperación y reset | Las rutas y payloads básicos parecen alineados | Confirmar con pruebas de contrato y flujo completo. |
| Auth: refresh y logout | Backend implementa; frontend no expone integración | La sesión puede no renovarse ni revocarse desde la UI. |
| Homes e invitaciones | La mayoría de rutas y operaciones parecen alineadas | La pantalla de acceso no usa todas las operaciones de invitaciones entrantes disponibles. |
| Devices | Rutas/métodos principales parecen alineados | Regla de roles frontend/backend difiere; tipo de respuesta de control no coincide. |
| Shelly: descubrimiento, identificación y provisión | Rutas observadas parecen alineadas | Requiere prueba con hardware/red local; no ejecutada. |
| Consumo | Hay resumen, serie diaria y listas para hogar; resumen de dispositivo | El frontend no envuelve todas las rutas de detalle/serie de dispositivo. |
| Notificaciones | Listar, contador no leídas, marcar todas/una, descartar parecen alineados | Verificar realtime y estado después de mutaciones. |
| Usuarios | Backend tiene `/users/me`, preferencias y desactivación | UI/perfil no aprovecha completamente esas operaciones. |
| Auditoría | Frontend apunta a `/audit`; controlador backend no observado | Posible 404 si se llama. |
| Realtime | Namespace y token parecen compatibles | Revalidación de sesión y orígenes requieren alineación. |

## 8. Plan de corrección propuesto

El orden reduce el riesgo de depurar funciones de producto sobre una base que no puede arrancar o desplegarse.

### Fase 1 — Desbloquear configuración y publicación

1. Alinear configuración SMTP con el transporte real y Compose.
2. Rechazar el secreto JWT de ejemplo en producción y documentar la generación de secretos.
3. Alinear Compose con una versión backend aprobada y una imagen reproducible.
4. Confirmar el flujo de ramas y la rama que realmente se despliega.
5. Verificar migraciones y esquema de la base de datos.

**Criterios de salida:** arranque limpio reproducible; correo de prueba local llega al emulador; backend rechaza JWT placeholder en producción; migración aplicada en bases limpia y existente; rama/revisión de despliegue identificada.

### Fase 2 — Cerrar contratos de integración

1. Integrar refresh y logout, incluyendo rotación y expiración.
2. Acordar permisos de dispositivo en UI/API.
3. Alinear el tipo de respuesta del comando de dispositivo.
4. Implementar o retirar el cliente de auditoría.
5. Completar operaciones de invitaciones entrantes dentro del alcance.

**Criterios de salida:** pruebas de contrato pasan entre frontend y backend; los roles autorizados y no autorizados se verifican; logout invalida la sesión; cada endpoint usado por la UI tiene un controlador correspondiente.

### Fase 3 — Corregir estados y recorridos de usuario

1. Explicar visualmente por qué una acción de dispositivo está bloqueada.
2. Mostrar confirmación y estado pendiente/resultado al publicar comandos.
3. Conectar o marcar explícitamente las funciones parciales.
4. Incorporar página 404 y estados vacíos accionables.

**Criterios de salida:** no hay acciones deshabilitadas sin explicación; las pantallas incompletas no aparentan estar conectadas; rutas inválidas presentan un error claro.

### Fase 4 — Endurecer seguridad

1. Revisar historial y rotar credenciales expuestas si las hubiera.
2. Mantener access tokens fuera de `localStorage` si el diseño de sesión lo permite.
3. Hacer que HTTP y WebSocket validen el mismo estado de sesión/cuenta.
4. Restringir orígenes permitidos de WebSocket.
5. Activar límites por IP/usuario en endpoints de autenticación.

**Criterios de salida:** pruebas de expiración/revocación y origen no permitido pasan; límites de tasa comprobados; escaneo de secretos no encuentra credenciales activas.

### Fase 5 — Calidad y liberación

1. Añadir lint y pruebas frontend para flujos de autenticación, hogares, dispositivos y notificaciones.
2. Ejecutar suites unitarias/e2e backend y pruebas de contrato.
3. Configurar checks obligatorios de CI para PR.
4. Documentar despliegue, variables, migraciones, health checks y recuperación.

**Criterios de salida:** build y suites requeridas pasan en CI; despliegue se puede reproducir desde instrucciones limpias; no hay diferencias conocidas entre la rama auditada y la versión liberada.

## 9. Casos de prueba de aceptación recomendados

- Arranque de stack completo con configuración de desarrollo, sin secretos de producción.
- Arranque de backend en modo producción con JWT placeholder: debe fallar con mensaje claro.
- Registro, activación, login, refresh rotado, expiración, logout y nuevo login.
- Logout en una sesión con socket activo: HTTP y WebSocket deben perder autorización.
- OWNER creador, OWNER no creador, MEMBER autorizado y usuario no miembro al controlar dispositivo.
- Dispositivo online provisionado, offline, inactivo y sin identificador de fabricante.
- Comando MQTT aceptado y rechazado, con respuesta y estado visual correctos.
- Aceptación/rechazo de invitación entrante y salida de invitación.
- Migración desde base vacía y desde una copia de esquema previo.
- Navegación directa a cada ruta privada y a una ruta desconocida.
- Límites por IP para login y recuperación de contraseña.
- Build, typecheck, lint, unitarias y e2e en CI.

## 10. Cierre

La auditoría identifica riesgos concretos que conviene resolver antes de publicar, pero no afirma que el sistema falle en ejecución: esa conclusión requiere build, arranque y pruebas integradas. El paso de mayor valor es reproducir el despliegue con la rama y configuración que se planean liberar, verificar el esquema de base de datos y luego cerrar autenticación y control de dispositivos con pruebas entre frontend y backend.

**Estado de cambios:** este informe no modifica código, configuración, ramas ni contenido de los repositorios auditados.
