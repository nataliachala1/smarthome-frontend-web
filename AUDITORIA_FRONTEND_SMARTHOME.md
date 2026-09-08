# Auditoria integral del frontend - Smart Home

**Proyecto:** Smart Home - SENA 3145555  
**Artefacto auditado:** `SMARTHOME-WEB.zip`  
**Version de esta auditoria:** 2.0 alineada  
**Fecha:** 2026-09-03  
**Estado:** Documento corregido para utilizarse como plan oficial de saneamiento y reconstruccion del frontend.

---

# 0. Regla de alineacion del proyecto

Esta version reemplaza la auditoria anterior. La auditoria previa contenia recomendaciones heredadas del SRS 2025 que ya no pertenecen al alcance actual, principalmente MFA/2FA, refresh token obligatorio y operaciones de negocio offline.

Para cualquier decision del frontend se utiliza el siguiente orden de autoridad:

1. **SRS Smart Home v2.0 - 26/08/2026.**
2. **Documento de alcance actualizado - 26/08/2026.**
3. **Base de datos final/corregida y sus reglas reales de integridad, RLS y seguridad.**
4. **Backend NestJS + Prisma actualmente implementado y su contrato HTTP/WebSocket.**
5. **Tecnologias oficiales del proyecto.**
6. SRS 2025 exclusivamente como referencia historica; no puede originar nuevas funcionalidades.

## Regla principal

El frontend **no debe inventar funcionalidades, estados, campos, permisos ni flujos que no existan en el SRS v2.0 y que no tengan soporte coherente en backend/base de datos**.

La interfaz debe ser una representacion del dominio real del sistema:

```text
React + TypeScript
        |
        | HTTP/HTTPS + JWT
        v
      NestJS
        |
        v
      Prisma
        |
        v
   PostgreSQL + RLS

Dispositivo IoT
     |
    MQTT
     v
   NestJS
     |
 WebSocket
     v
 Frontend
```

El navegador **nunca se conecta directamente a PostgreSQL ni a MQTT**.

---

# 1. Linea base funcional vigente

Smart Home cubre exclusivamente **energia electrica residencial**.

## Incluido

- Aplicacion web responsiva.
- Aplicacion Android como otra plataforma cliente del mismo backend.
- Registro de usuario.
- Login con correo y contrasena.
- JWT con expiracion.
- Recuperacion de contrasena.
- Bloqueo temporal por intentos fallidos.
- Desactivacion y reactivacion de cuenta.
- Actualizacion de perfil y contrasena.
- Roles globales `SYSTEM_ADMIN` y `USER`.
- Roles de hogar `OWNER`, `MEMBER`, `GUEST`.
- Multiples hogares por usuario.
- Hogares compartidos.
- Membresias con estados `PENDING`, `ACTIVE`, `REVOKED`, `LEFT`.
- Dispositivos electricos IoT.
- Shelly 1PM Gen4 como dispositivo fisico de referencia, sin acoplar el producto exclusivamente a Shelly.
- MQTT entre dispositivo y backend.
- Monitoreo de estado del dispositivo.
- Control remoto cuando el dispositivo lo permita.
- Configuracion de dispositivo.
- Horarios automaticos.
- Umbrales/reglas de consumo.
- Telemetria electrica.
- Potencia instantanea.
- Energia total acumulada.
- Energia incremental por intervalo.
- Voltaje.
- Corriente.
- Frecuencia.
- Temperatura cuando el dispositivo la entregue.
- Historicos de consumo y telemetria.
- Costos aproximados.
- Reportes.
- Alertas.
- Notificaciones `UNREAD`, `READ`, `DISMISSED`.
- WebSocket backend -> cliente.
- Internacionalizacion.
- Tema claro/oscuro.
- Zona horaria y preferencias regionales.
- Auditoria.
- Backup/restore para `SYSTEM_ADMIN`, como operacion real de infraestructura/backend, no como simulacion del cliente.
- Integracion con asistente de voz como RF de prioridad media; solo debe exponerse en frontend cuando exista contrato real de backend para esa integracion.

## RF eliminadas del alcance vigente y no reutilizables

- Tarifas electricas con vigencia historica.
- Desactivacion del hogar.
- Consultar recomendaciones.
- Configurar recomendaciones.
- Modo offline.
- Zona de hogar.
- Configurar notificaciones.
- Forzar sincronizacion manual.

## Fuera del alcance actual y prohibido volver a introducir

- Agua.
- Gas.
- Paneles solares.
- Machine learning predictivo avanzado.
- MFA / 2FA.
- SMS de autenticacion.
- OAuth / Google Login.
- Refresh token como requisito obligatorio.
- Blacklist compleja de JWT.
- Gestion avanzada de sesiones persistentes.
- Almacenamiento de JWT en PostgreSQL.
- Redis/BullMQ como dependencia obligatoria del funcionamiento principal actual.
- MQTT directo desde el navegador.
- Acceso directo del frontend a PostgreSQL.
- Eliminacion fisica de historicos desde la aplicacion.

---

# 2. Estado actual verificado del backend que condiciona el frontend

El frontend debe integrarse progresivamente con el backend real que se esta construyendo, no con contratos imaginarios.

## Stack vigente

```text
Node.js
TypeScript
NestJS 11.x
Prisma 7.10.x
PostgreSQL 16.x
Liquibase
Docker
JWT
MQTT
WebSocket
Jest
```

## Reglas de backend/base de datos que el frontend debe respetar

- Liquibase es el unico propietario de las migraciones.
- Prisma introspecta y accede a la base; no se usa `prisma db push` ni Prisma Migrate para modificar el esquema.
- NestJS concentra la logica de negocio.
- PostgreSQL es la fuente de verdad persistente.
- PostgreSQL aplica integridad, FK, UNIQUE, CHECK, particionado y RLS.
- El backend HTTP usa una cuenta restringida equivalente a `smarthome_backend`, miembro de `smarthome_app`, sin `BYPASSRLS`.
- La identidad funcional se propaga a PostgreSQL por transaccion para que RLS vuelva a validar el acceso.
- La autorizacion contextual parte de `home_member`.
- Los historicos de consumo, telemetria, alertas, notificaciones y auditoria no se borran desde el cliente.
- Usuario, hogar, dispositivo y membresia se desactivan logicamente.

## Superficie de backend ya ejercitada durante el desarrollo

Se ha trabajado y probado al menos con:

```text
POST /api/v1/auth/login
GET  /api/v1/homes
```

El frontend debe usar el contrato real de Swagger/backend a medida que cada modulo quede implementado. **No se deben fijar en este documento URLs de endpoints no verificadas**.

Para los modulos que aun no tengan endpoint final, la tarea del frontend es dejar arquitectura, tipos y UI preparados, pero no inventar respuestas mock en la version final.

---

# 3. Dictamen ejecutivo del frontend auditado

El frontend **NO esta listo para ser el frontend final de Smart Home**. Actualmente funciona como prototipo visual con logica local y datos falsos.

La prioridad no es agregar mas pantallas. La prioridad es:

```text
1. sanear repositorio;
2. eliminar funcionalidades fuera de alcance;
3. migrar a TypeScript;
4. consolidar arquitectura;
5. crear design system;
6. integrar auth real;
7. integrar homes reales;
8. continuar modulo por modulo segun backend disponible.
```

## Estado por area

| Area | Estado | Diagnostico actualizado |
|---|---|---|
| Compilacion/despliegue | Critico | Hay imports sensibles a mayusculas/minusculas y Docker/Nginx no estan correctamente alineados. |
| Integracion backend | Critico | Los datos de negocio no provienen del backend real. |
| Autenticacion | Critico | Login/registro/recuperacion son mocks; existe 2FA falso que debe **eliminarse**, no implementarse. |
| Datos de negocio | Critico | Hogares, dispositivos, consumo, reportes y notificaciones son locales/hardcodeados. |
| Tiempo real | Critico | No existe WebSocket integrado. |
| Autorizacion | Critico | La UI no modela `SYSTEM_ADMIN/USER` ni `OWNER/MEMBER/GUEST`. |
| Arquitectura | Alto | Estructuras duplicadas y mezcla de carpetas. |
| TypeScript | Alto | Se regreso de TS/TSX a JS/JSX. |
| Design system | Alto | 81 colores HEX y varias identidades visuales compitiendo. |
| Accesibilidad | Alto | Contraste, tamanos pequenos y navegacion responsive insuficientes. |
| i18n | Alto | Cuatro locales incompletos, claves faltantes y textos hardcodeados. |
| Offline | Medio | Existe deteccion superficial. El alcance solo requiere cache/preferencias recientes, no cola de operaciones. |
| Testing | Critico | No hay tests del frontend. |
| Higiene Git | Critico | `node_modules`, `dist`, PDFs y ejecutables estan versionados. |

## Metricas observadas

- 51.536 archivos de `web/node_modules` versionados.
- 3 archivos de `web/dist` versionados.
- 4 PDFs dentro de `web/src/imports` sin uso de runtime.
- `devtunnel.exe` versionado.
- 5 archivos JS/JSX no alcanzables desde `main.jsx`.
- 2 imports alcanzables con casing incorrecto: `card`/`badge` frente a `Card.jsx`/`Badge.jsx`.
- 0 tests.
- 81 colores HEX unicos.
- `text-gray-400`: 67 usos.
- `text-[10px]`: 24 usos.
- `text-[11px]`: 17 usos.
- 99 llamadas `t(...)`, con 36 claves unicas ausentes en `es.json`.

---

# 4. P0 - bloqueadores que deben resolverse primero

## P0.1 Eliminar autenticacion falsa y flujos fuera de alcance

**Archivo principal detectado:** `web/src/app/contexts/AuthContext.jsx`.

Actualmente contiene comportamiento de demo:

- `mockUser`.
- `mock-jwt-token`.
- IDs con `Math.random()`.
- `verify2FA()` con codigo fijo `12456`.
- `enable2FA()`.
- `forgotPassword()` simulado.

### Accion correcta

Eliminar:

```text
verify2FA
enable2FA
codigo 12456
pantallas/opciones 2FA
Google OAuth falso
refresh token obligatorio
session manager ficticio
```

Implementar solo el flujo vigente:

```text
Registro -> backend
Login -> JWT
JWT expirado -> volver a autenticacion
Logout -> eliminar/dejar de usar JWT local
Recuperacion -> token temporal por correo
Cambio de contrasena
Desactivacion
Reactivacion
Bloqueo temporal -> mostrar respuesta del backend
```

### Importante sobre logout

No se debe exigir revocacion inmediata del JWT por blacklist ni endpoint de session revocation, porque el SRS v2.0 define que el cliente elimina/deja de utilizar la credencial local y el JWT expira naturalmente.

### Importante sobre almacenamiento del token

El frontend debe minimizar exposicion y limpiar el JWT al cerrar sesion. La estrategia exacta de almacenamiento debe seguir el contrato real del backend y la politica final de seguridad; **no se debe introducir refresh token solo para resolver persistencia**.

---

## P0.2 Crear una unica capa de API

El cliente HTTP existente no forma parte del flujo real y `axios` ni siquiera esta correctamente declarado/consumido.

### Arquitectura objetivo

```text
src/shared/api/
  api-client.ts
  errors.ts
  auth.api.ts
  homes.api.ts
  devices.api.ts
  consumption.api.ts
  notifications.api.ts
  reports.api.ts
  settings.api.ts
  audit.api.ts
```

Reglas:

- componentes visuales no llaman `fetch`/Axios directamente;
- todos los requests pasan por un cliente comun;
- agregar `Authorization: Bearer <jwt>` solo desde una capa central;
- transformar errores HTTP a errores de aplicacion;
- 401 -> limpiar credencial y volver a login cuando corresponda;
- 403 -> mostrar acceso denegado, no esconderlo como error generico;
- no inferir permisos solo por ocultar botones; el backend sigue siendo autoridad;
- usar el contrato de Swagger como referencia de payloads.

TanStack Query es adecuado para estado de servidor, cache e invalidacion, pero es una decision de implementacion del frontend, no un nuevo requisito funcional.

---

## P0.3 Corregir build Linux/Docker

`DashboardPage.jsx` importa:

```text
../../../components/ui/card
../../../components/ui/badge
```

mientras los archivos reales son:

```text
Card.jsx
Badge.jsx
```

Corregir casing y agregar pipeline Linux para evitar que Windows oculte el fallo.

---

## P0.4 Separar el frontend de la base de datos

El `docker-compose.yml` del frontend no debe crear una PostgreSQL paralela con credenciales/modelo generico.

La base oficial existe en su propio repositorio y es administrada con Liquibase.

### El repositorio frontend puede contener

- Dockerfile para construir/servir la SPA.
- Nginx.
- Variables de frontend.

### No debe contener como responsabilidad propia

- migraciones SQL;
- base PostgreSQL alternativa;
- seeds de negocio;
- usuarios DB;
- RLS;
- MQTT broker salvo que exista una composicion de infraestructura externa claramente separada.

---

## P0.5 Corregir variables Vite y Nginx

`VITE_*` se resuelve al compilar el bundle.

En despliegue se recomienda same-origin cuando la infraestructura lo permita:

```text
Frontend -> /api/v1 -> Nginx -> NestJS
Frontend -> WebSocket -> Nginx -> NestJS
```

No duplicar la URL del backend en cada componente.

---

## P0.6 Configurar fallback SPA

Nginx debe resolver rutas del `BrowserRouter` mediante:

```nginx
try_files $uri $uri/ /index.html;
```

Tambien debe soportar `Upgrade`/`Connection` para WebSocket cuando funcione como reverse proxy.

---

# 5. Higiene de repositorio

## Eliminar de Git

- `web/node_modules/`.
- `web/dist/`.
- `devtunnel.exe`.
- caches de Vite.
- logs.
- temporales.

## Sacar de `src`

Los PDFs/documentacion no son assets de runtime. Moverlos a un repositorio/carpeta de documentacion o eliminarlos de este repo si ya existen en la fuente documental oficial.

## `.gitignore` minimo

```gitignore
node_modules/
dist/
coverage/
.vite/
.env
.env.*
!.env.example
*.log
.DS_Store
Thumbs.db
*.exe
```

No ignorar automaticamente configuraciones compartidas del IDE si el equipo decide versionarlas conscientemente.

---

# 6. Stack del frontend y arquitectura objetivo

El frontend actual ya usa React/Vite. Se recomienda mantener esa linea y normalizarla:

```text
React
TypeScript
Vite
React Router
Tailwind CSS
Jest
Testing Library
WebSocket client compatible con el gateway NestJS
```

No es necesario introducir frameworks UI adicionales si Tailwind/componentes propios cubren el sistema.

## 6.1 TypeScript es obligatorio para esta reconstruccion

Razones:

- contratos de API;
- roles;
- estados de membresia;
- estados de dispositivo;
- payloads de telemetria;
- eventos WebSocket;
- filtros de reportes;
- notificaciones;
- configuraciones por hogar.

Configurar `strict: true`.

## 6.2 Estructura recomendada

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  features/
    auth/
    homes/
    memberships/
    zones/
    devices/
    consumption/
    recommendations/
    notifications/
    reports/
    settings/
    admin/
      audit/
      backups/
  shared/
    api/
    auth/
    components/
      ui/
      layout/
    hooks/
    i18n/
    lib/
    realtime/
    styles/
    types/
  main.tsx
```

## 6.3 Regla de responsabilidades

```text
page        = composicion
component   = UI
hook        = orquestacion de UI/estado
api         = HTTP
realtime    = WebSocket
schema      = validacion cliente
types       = contrato tipado
backend     = reglas de negocio y autorizacion
PostgreSQL  = integridad + RLS + persistencia
```

---

# 7. Navegacion y AppShell

## Problemas actuales

- sidebar incompleto;
- Dashboard enlaza a ruta incorrecta;
- no hay estado activo confiable;
- usuario demo hardcodeado;
- sidebar movil deficiente;
- navbar vacio/duplicado;
- buscador/campana repetidos en paginas.

## AppShell objetivo

### Elementos globales

- selector de hogar activo;
- navegacion segun permisos;
- estado de conexion del backend/WebSocket;
- notificaciones no leidas;
- menu del usuario real;
- tema;
- breadcrumb/titulo;
- drawer movil.

### Navegacion base para `USER`

```text
Dashboard
Hogares
Dispositivos
Consumo
Reportes
Recomendaciones
Notificaciones
Configuracion
```

### Navegacion adicional para `SYSTEM_ADMIN`

```text
Auditoria
Backup/Restore  (solo si existe endpoint operativo real)
```

La navegacion no debe mostrar opciones administrativas globales a `USER`.

Dentro de un hogar los botones deben responder al rol contextual.

---

# 8. Auditoria funcional por modulo

# 8.1 Autenticacion y cuenta

## Debe existir

| RF | Frontend esperado |
|---|---|
| RF1.1 | Registro con nombre, correo, contrasena y `username` solo si el backend finalmente lo usa. |
| RF1.2 | Login correo/contrasena y manejo de errores/bloqueo. |
| RF1.3 | UI global diferenciada para `SYSTEM_ADMIN` y `USER`. |
| RF1.4 | Logout local de JWT + redireccion a login. |
| RF1.5 | Desactivacion de cuenta con confirmacion y manejo de regla del ultimo OWNER. |
| RF1.6 | Reactivacion segun flujo real del backend. |
| RF1.7 | Actualizacion de perfil y contrasena. |
| RF1.8 | Forgot/reset password por token temporal. |
| RF1.9 | Mostrar correctamente bloqueo temporal y tiempo/mensaje devuelto por backend. |

## Debe eliminarse

- tipo de documento;
- numero de documento;
- fecha de nacimiento;
- verificacion de mayoria de edad;
- confirmacion de registro por email como requisito obligatorio;
- MFA;
- 2FA;
- Google OAuth;
- SMS;
- refresh token obligatorio;
- pantalla de sesiones activas si no existe en el backend Smart Home actual.

## Validacion de contrasena

La UI puede ofrecer feedback inmediato, pero la regla final la valida NestJS. No duplicar reglas antiguas del SRS 2025.

---

# 8.2 Hogares

**Pantalla actual:** `Homes.jsx` funciona con datos mock/locales.

## Debe soportar

- listar hogares permitidos al usuario;
- crear hogar;
- seleccionar hogar activo;
- modificar hogar si el rol lo permite;
- gestionar miembros;
- mostrar rol del usuario dentro del hogar;
- estados loading/empty/error;
- confirmacion de acciones de impacto.

## Regla de autorizacion

| Accion | OWNER | MEMBER | GUEST |
|---|---:|---:|---:|
| Consultar hogar | Si | Si | Si |
| Invitar/revocar miembros | Si | No | No |
| Cambiar roles | Si | No | No |

## Estrato

No se debe forzar `estrato` en la UI por herencia del SRS anterior si el contrato final de backend/base ya no lo utiliza. El formulario debe reflejar el DTO vigente.

## Direccion

No mostrar direcciones inventadas si la entidad actual de hogar no las almacena.

---

# 8.3 Membresias del hogar

Este modulo falta en el frontend actual y es parte central del SRS v2.0.

## UI requerida para OWNER

- listado de miembros;
- rol actual;
- estado `PENDING/ACTIVE/REVOKED/LEFT`;
- invitar miembro;
- cambiar rol;
- revocar miembro;
- feedback de invitacion pendiente;
- impedir acciones que dejen al hogar sin OWNER activo.

## MEMBER/GUEST

Solo deben visualizar informacion que el backend autorice. No exponer controles de propiedad.

La UI nunca debe asumir autorizacion basandose en un `homeId` manipulable por URL: NestJS + RLS deben seguir validando.

---

# 8.4 Dispositivos

El alcance vigente no incluye zonas de hogar ni tarifas eléctricas. El módulo debe centrarse en el dispositivo y su contexto de hogar.

---

# 8.5 Dispositivos

La pantalla actual usa arrays hardcodeados y cambia `on/off` solo en estado local.

## Debe mostrar datos reales

- nombre;
- tipo/categoria;
- zona;
- ciclo de vida activo/desactivado;
- conectividad online/offline;
- estado electrico on/off cuando aplique;
- ultima lectura;
- telemetria reciente;
- alertas relacionadas;
- configuracion permitida por rol.

## Roles

| Accion | OWNER | MEMBER | GUEST |
|---|---:|---:|---:|
| Ver dispositivo | Si | Si | Si |
| Controlar | Si | Si | No |
| Configurar | Si | Limitado segun backend | No |
| Registrar | Si | No | No |
| Desactivar/reactivar | Si | No | No |

El significado exacto de "configuracion limitada" de MEMBER debe provenir del caso de uso implementado en NestJS, no de una lista inventada en React.

## Control on/off

Flujo correcto:

```text
Usuario pulsa ON
  -> HTTP/WebSocket command hacia NestJS
  -> NestJS autoriza
  -> MQTT hacia dispositivo
  -> dispositivo confirma/telemetria cambia
  -> NestJS actualiza
  -> WebSocket al cliente
  -> UI refleja estado confirmado
```

No cambiar el estado definitivo de la tarjeta antes de recibir confirmacion. Puede mostrarse `pending` temporalmente.

---

# 8.7 Shelly 1PM Gen4 y telemetria

El frontend no debe conocer ni parsear el payload MQTT crudo.

NestJS normaliza la informacion y el cliente consume DTOs estables.

## Variables UI

- `power_w` -> W/kW, potencia instantanea.
- `energy_total_kwh` -> kWh acumulado.
- `energy_delta_kwh` -> kWh del intervalo.
- voltaje -> V.
- corriente -> A.
- frecuencia -> Hz.
- temperatura -> °C/°F segun preferencia regional cuando exista valor.
- estado.
- timestamp de lectura.

## Conexion del Shelly

La fuente de verdad operativa definida para la integracion es el estado MQTT que el backend obtiene del dispositivo. El frontend recibe un estado normalizado; **no debe mostrar ni depender de `cloud.connected`**.

## Metadata de fabricante

Campos como generacion, identificador de fabricante, aplicacion/modelo, Matter o autenticacion pueden mostrarse en una seccion tecnica cuando el backend los exponga, pero no deben dominar el modelo visual general de dispositivos.

---

# 8.8 Horarios y umbrales

A diferencia de MFA/offline, esta funcionalidad **si permanece dentro del alcance**.

El frontend debe contemplar, cuando los endpoints esten disponibles:

### Horarios

- dispositivo;
- dias/fecha segun modelo real;
- hora;
- accion encender/apagar;
- activo/inactivo;
- zona horaria del hogar/usuario;
- editar/desactivar.

### Umbrales/reglas

- dispositivo/hogar segun modelo;
- tipo de regla;
- limite de consumo/potencia segun contrato;
- activo/inactivo;
- accion/alerta asociada cuando exista.

No crear un formato diferente al definido en las tablas/DTOs finales.

---

# 8.9 Consumo y dashboard

## Problema actual

Datos y graficas son estaticos.

## Error de dominio detectado

Texto actual equivalente a:

```text
Consumo en vivo 2.27 kWh
```

es ambiguo/incorrecto para una magnitud instantanea.

### Presentacion correcta

```text
Potencia actual    2.27 kW
Energia hoy        15.8 kWh
Energia mes        xx.x kWh
Costo estimado     $ ...
```

## Reglas obligatorias

- nunca sumar `energy_total_kwh` como si fuera consumo por intervalo;
- los agregados usan la metrica incremental correcta;
- mostrar timestamp/ultima actualizacion;
- marcar datos stale si no llega telemetria reciente;
- filtros por hogar y dispositivo;
- rangos dia, semana, mes, ano;
- costo calculado por backend cuando exista regla vigente;
- grafica responsive.

El backend/base de datos, no React, define el calculo oficial de agregados de negocio.

---

# 8.10 Reportes e historicos

Eliminar textos genericos heredados como:

- "Seguimiento del consumo de sus clientes";
- "Estadisticas del producto";
- anos fijos sin razon;
- fecha fija;
- valores sin unidad.

## Reporte Smart Home

Filtros permitidos por contrato:

- hogar;
- dispositivo;
- rango temporal;
- comparacion de periodos.

Resultados:

- energia;
- potencia relevante/agregada cuando corresponda;
- costo estimado;
- tendencia;
- dispositivos de mayor consumo.

Exportacion CSV/PDF **solo si existe requisito/endpoint real**. No se debe agregar una funcion de exportacion simplemente porque sea comun en dashboards.

---

# 8.11 Recomendaciones

El alcance vigente no incluye recomendaciones ni configuracion de recomendaciones. No se debe exponer este flujo en el frontend ni definirlo como requisito funcional.

---

# 8.12 Alertas y notificaciones

## Modelo vigente

```text
UNREAD
READ
DISMISSED
```

## Flujo

```text
Telemetria/evento
  -> NestJS evalua regla
  -> persiste alerta/notificacion
  -> WebSocket
  -> frontend
```

## Frontend

- REST para carga inicial/historico;
- WebSocket para nuevas notificaciones;
- contador no leidas;
- marcar `READ`;
- `DISMISSED` oculta visualmente sin borrar el registro;
- filtros solo si estan soportados por API;
- enlace al hogar/dispositivo relacionado cuando el backend entregue la relacion.

No usar hard delete de notificaciones como accion normal.

---

# 8.13 Configuracion, idioma, tema y region

## Tema

Eliminar duplicacion entre `ThemeContext` y estados locales.

Un unico provider:

```text
light
dark
system
```

Persistir segun el mecanismo definido por `config.user_preference`/backend o cache local cuando proceda.

## Idiomas

El SRS v2.0 vigente exige cuatro idiomas: **espanol, ingles, frances y aleman**. La UI debe implementar esos cuatro recursos de idioma de forma completa, mantener paridad de claves entre locales y no dejar cadenas funcionales hardcodeadas. Fechas, horas, numeros y moneda deben adaptarse al locale y a las preferencias regionales del usuario.

Actualmente existen cuatro locales pero estan incompletos. Corregir:

- claves faltantes;
- namespaces;
- persistencia;
- cambio en runtime;
- `lang` del documento;
- pluralizacion;
- fechas/numeros/unidades.

## Zona horaria

Los timestamps persistentes provienen del backend en formato coherente/UTC. El frontend los presenta en la zona horaria configurada.

No guardar timestamps reinterpretados como hora local sin zona.

## Moneda

Usar `Intl.NumberFormat` y preferencia regional. En el contexto colombiano, COP debe ser la presentacion por defecto mientras no exista otra preferencia del usuario/hogar.

---

# 8.14 Offline/conectividad - correccion frente a la auditoria anterior

La auditoria anterior recomendaba IndexedDB, cola de comandos, idempotencia y resolucion de conflictos. **Eso queda retirado**.

## Alcance correcto

El frontend puede:

- detectar perdida de conexion;
- mostrar banner offline;
- conservar tema/idioma/preferencias;
- mostrar datos recientes cacheados como lectura;
- indicar la fecha de ultima actualizacion;
- deshabilitar acciones que requieren backend.

## No debe

- encolar control de dispositivos;
- encolar creacion de hogar;
- encolar registro de dispositivo;
- encolar cambio de tarifa;
- reproducir operaciones despues;
- implementar merge/conflict resolution.

Un solo `ConnectivityProvider` es suficiente. El `OfflineContext` y `OfflineBanner` actuales no deben duplicar listeners.

---

# 8.15 Auditoria y administracion

La auditoria es una funcion de `SYSTEM_ADMIN`.

## Frontend admin

Debe existir cuando el backend exponga el contrato:

- tabla paginada;
- filtro por fecha;
- usuario/actor;
- modulo/evento;
- resultado;
- detalle sanitizado.

## Nunca mostrar

- contrasenas;
- hashes;
- JWT;
- recovery token original;
- credenciales MQTT;
- secretos de integraciones;
- payloads sensibles completos.

El cliente no puede editar ni borrar eventos de auditoria.

---

# 8.16 Backup y restore

El SRS v2.0 conserva backup/restore para `SYSTEM_ADMIN`, pero la base de datos determino correctamente que la restauracion real es una operacion de infraestructura.

### Regla para frontend

No crear una falsa restauracion basada en un `setTimeout`, archivo local o cambio de estado React.

Solo implementar UI si el backend/infraestructura ofrece un contrato real que pueda:

- listar backups/metadatos autorizados;
- iniciar una restauracion real;
- consultar estado/progreso;
- devolver resultado y errores.

Hasta entonces, el frontend no debe simularla.

---

# 8.17 Asistente de voz

RF3.7 sigue en el SRS v2.0 con prioridad media.

Sin embargo, el modelo de base ha eliminado artefactos heredados como `voice_assistant_token`, y el backend actual no debe ser forzado a una implementacion inventada.

### Decision de frontend

- mantenerlo en la matriz de alcance como RF pendiente;
- no mostrar un flujo falso de Alexa;
- no almacenar secretos/tokens en React;
- implementar solo cuando exista contrato backend y mecanismo seguro de integracion.

Esto mantiene concordancia simultanea con SRS, base y backend.

---

# 9. Tiempo real y WebSocket

El tiempo real hacia el usuario es responsabilidad de WebSocket.

## Casos principales

- telemetria/estado de dispositivo;
- confirmacion de control;
- nuevas alertas;
- nuevas notificaciones;
- cambios de estado relevantes.

## Arquitectura cliente

```text
src/shared/realtime/
  socket-client.ts
  events.ts
  use-realtime.ts
```

## Reglas

- autenticar la conexion segun mecanismo del gateway NestJS;
- una conexion compartida por sesion, no una por componente;
- reconexion con estrategia limitada;
- limpiar listeners al desmontar;
- deduplicar por ID/evento cuando REST + WebSocket puedan traer el mismo objeto;
- REST sigue siendo fuente para carga inicial/historico;
- WebSocket no sustituye todos los endpoints CRUD.

---

# 10. Estado del servidor y estado local

## Server state

Hogares, miembros, dispositivos, consumo y notificaciones provienen del backend.

Se recomienda una capa de server-state (por ejemplo TanStack Query) para:

- cache;
- invalidacion;
- loading;
- error;
- refetch;
- optimistic UI solo en casos seguros.

## Local UI state

Usar estado local/context para:

- sidebar abierto/cerrado;
- modal;
- formulario no enviado;
- tema antes de persistir;
- filtros visuales.

No almacenar copias permanentes de entidades de negocio en `localStorage` como si fueran la base de datos.

---

# 11. Seguridad del frontend

El frontend no reemplaza autorizacion del backend.

## Obligatorio

- no hardcodear credenciales;
- no registrar tokens en consola;
- limpiar JWT en logout;
- manejar expiracion;
- no mostrar secretos;
- escapar/renderizar contenido sin `dangerouslySetInnerHTML` salvo sanitizacion real;
- CSP y headers desde Nginx cuando se despliegue;
- HTTPS en entornos no locales;
- no confiar en rol enviado desde el cliente para autorizar;
- deshabilitar/ocultar UI segun permisos para UX, pero esperar que NestJS/RLS vuelvan a validar.

## No implementar

- refresh token por cuenta propia;
- blacklist;
- MFA;
- OAuth;
- session table UI;
- JWT persistido en BD.

---

# 12. Design system: colores

El frontend actual tiene demasiadas paletas paralelas.

## Diagnostico

Se detectaron al menos 81 valores HEX y mezcla de:

- azul;
- morado;
- indigo;
- verde;
- grises inconsistentes;
- fondos y bordes sin tokens.

Esto debe reemplazarse por **tokens semanticos**, no por valores dispersos.

## Paleta recomendada para Smart Home

### Marca

```text
Primary 600  #1866C1
Primary 500  #2C78CF
Primary 100  #DCEBFA
Secondary    #87CEEB
```

El azul debe ser la identidad principal. El celeste funciona como apoyo, no como CTA sobre fondo blanco sin revisar contraste.

### Neutros

```text
Background light   #F7F9FC
Surface light      #FFFFFF
Text primary       #172033
Text secondary     #586174
Border             #D9E0EA
```

En dark mode usar tokens equivalentes, no invertir colores manualmente por componente.

### Estados semanticos

```text
Success  = verde
Warning  = ambar
Danger   = rojo
Info     = azul
```

El verde no debe competir como color corporativo principal.

## Regla

No usar:

```text
bg-[#...]
text-[#...]
border-[#...]
```

en componentes de negocio salvo una excepcion documentada.

Usar variables/tokens centralizados.

---

# 13. Tipografia

## Problemas

- demasiados `text-[10px]` y `text-[11px]`;
- pesos `font-black` frecuentes;
- escalas distintas entre pantallas;
- baja legibilidad en dashboards.

## Fuente

**Inter** es adecuada para un dashboard tecnico por legibilidad y cifras. Si el equipo no quiere dependencia de fuente web, usar un system stack consistente.

No mezclar varias familias sin una razon de marca.

## Escala sugerida

```text
Display      32/40  700
H1           28/36  700
H2           22/30  650/700
H3           18/26  600
Body         16/24  400
Body small   14/20  400
Label        13/18  500/600
Caption      12/16  400
```

Evitar texto funcional por debajo de 12 px.

Los valores principales de potencia/energia pueden usar numerales tabulares si la fuente lo soporta.

---

# 14. Accesibilidad

El SRS exige usabilidad/accesibilidad. El objetivo minimo debe ser WCAG 2.1 AA.

## Corregir

- contraste de texto secundario;
- contraste de botones;
- focus visible;
- `aria-label` en botones icon-only;
- `aria-current` en navegacion;
- labels de formularios asociados;
- mensajes de error relacionados con campos;
- navegacion por teclado;
- dialogos con focus trap;
- tablas con encabezados;
- graficas con alternativa textual/resumen;
- no depender solo de color para online/offline/error;
- respetar `prefers-reduced-motion`.

El verde `#00B074` con texto blanco no debe mantenerse como CTA sin validar contraste.

---

# 15. Responsive

La app web debe funcionar correctamente en movil, tablet y escritorio.

## Breakpoints funcionales

### Movil

- sidebar -> drawer;
- KPIs en 1 columna/2 columnas;
- tablas -> scroll o cards segun caso;
- controles touch >= 44x44 px;
- graficas con altura minima legible.

### Tablet

- sidebar colapsable;
- grid intermedio.

### Desktop

- sidebar persistente;
- dashboard multicolumna.

No crear una segunda UI completamente distinta para movil si puede resolverse de forma responsive.

---

# 16. Formularios y validacion

Utilizar una estrategia consistente (por ejemplo React Hook Form + schema de validacion) sin duplicar reglas en cada input.

## Reglas

- validacion cliente = UX;
- validacion backend = autoridad;
- mapear errores de DTO/campos;
- no revelar si un recurso de otro hogar existe cuando backend responde restriccion;
- confirmacion para desactivaciones;
- deshabilitar submit durante request;
- evitar doble envio.

---

# 17. Testing y calidad

Actualmente hay **0 tests**.

## Scripts minimos

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "test": "jest",
    "test:ci": "jest --runInBand"
  }
}
```

## Cobertura prioritaria

### Unit/component

- login form;
- logout;
- permission rendering;
- selectors por hogar;
- formularios;
- formateo W/kWh/COP;
- estados `UNREAD/READ/DISMISSED`;
- tema/i18n.

### Integracion frontend

- 401 -> login;
- 403 -> acceso denegado;
- OWNER vs MEMBER vs GUEST;
- carga/creacion de hogares con API mock de contrato;
- comando de dispositivo pending/success/error;
- WebSocket event actualiza cache;
- offline deshabilita operaciones de negocio.

### E2E cuando el backend este listo

- login real;
- listar hogares;
- crear hogar;
- cambiar hogar activo;
- permisos cruzados;
- control de dispositivo de prueba;
- notificacion en tiempo real.

No se necesita perseguir 100% de coverage; deben cubrirse los flujos de riesgo.

---

# 18. Dependencias

## Eliminar si siguen sin uso

- MUI.
- Emotion.
- Popper.
- cualquier libreria duplicada con Tailwind/componentes existentes.

## Mantener/agregar solo con necesidad real

- cliente HTTP (`fetch` wrapper o Axios, uno solo);
- TanStack Query si se adopta;
- libreria de graficas si la pantalla la necesita;
- i18n existente bien configurado;
- cliente WebSocket compatible con NestJS;
- librerias de testing.

Evitar agregar dependencias para resolver problemas que ya cubre la plataforma web.

---

# 19. Docker y despliegue

## Frontend

- build multi-stage;
- `npm ci`;
- Node LTS soportado;
- Nginx no-root si la imagen seleccionada lo permite;
- SPA fallback;
- proxy API/WebSocket si se usa same-origin;
- headers de seguridad;
- cache correcto de assets hasheados;
- `index.html` sin cache agresiva.

## No mezclar con DB

La base se levanta desde el repositorio de base de datos mediante su Docker/Liquibase. El frontend no debe convertirse en propietario de PostgreSQL.

---

# 20. `index.html`

Actualmente contiene metadatos heredados/genericos.

Debe quedar:

- `lang` sincronizado con idioma activo;
- titulo Smart Home;
- descripcion energetica correcta;
- favicon/logo real;
- meta viewport;
- theme-color si se define;
- sin referencias a React Native si este artefacto es la web React/Vite.

Ejemplo conceptual:

```html
<title>Smart Home | Monitoreo energetico</title>
```

---

# 21. Elementos concretos que deben eliminarse del frontend actual

## Fuera de alcance

- 2FA completo.
- codigo `12456`.
- opcion para habilitar 2FA.
- Google login falso.
- refresh token obligatorio.
- gestion avanzada de sesiones.
- cola offline/pending commands.
- resolucion de conflictos offline.
- agua/gas.

## Datos/demo

- `Usuario Demo`.
- `user@smarthome.com`.
- hogar inventado.
- dispositivos hardcodeados.
- recomendaciones hardcodeadas.
- notificaciones hardcodeadas.
- historicos hardcodeados.
- fechas fijas.
- EUR hardcodeado.
- `2.0TD`.
- "tarifa valle".
- "Estadisticas del producto".
- "Seguimiento del consumo de sus clientes".
- "Cocinaaa".
- arrays de consumo usados como datos reales.

## Tecnico

- `node_modules` en Git.
- `dist` en Git.
- PDFs de documentacion dentro de `src`.
- `.exe` versionados.
- archivos duplicados muertos.
- i18n duplicado.
- Layout duplicado.
- Login duplicado.
- Dashboard duplicado.
- dependencias no usadas.

---

# 22. Elementos que se deben conservar/refactorizar

- React/Vite como base web.
- Tailwind si se normaliza mediante tokens.
- React Router.
- i18n como concepto.
- ThemeProvider como concepto, unificado.
- componentes UI reutilizables que pasen accesibilidad.
- estructura visual aprovechable de dashboard, si se reemplazan datos/terminologia.
- deteccion simple de conectividad.
- responsive como objetivo.

Conservar no significa mantener el codigo exacto: debe migrarse a TypeScript y alinearse al dominio.

---

# 23. Matriz de alineacion frontend - backend - base de datos

| Dominio | Frontend | Backend NestJS | PostgreSQL |
|---|---|---|---|
| Auth | formularios/JWT/logout UX | hash, login, bloqueo, recuperacion, autorizacion | usuarios, roles, recovery hash, auditoria |
| Roles globales | mostrar UI permitida | validar `SYSTEM_ADMIN/USER` | rol persistente/constraints |
| Hogar | selector y CRUD permitido | casos de uso y reglas OWNER | `home`, RLS, FK |
| Membresia | invitaciones/roles | validar transiciones | `home_member`, estados, RLS |
| Dispositivo | mostrar/control/config | MQTT/control/autorizacion | metadata/config/historico |
| Telemetria | visualizar | normalizar MQTT | lectura particionada/raw diagnostica |
| Consumo | graficas/filtros | agregados/costos | historicos/materialized views si aplican |
| Alerta | visualizar contexto | generar | historial |
| Notificacion | centro + WebSocket | persistir/publicar | `UNREAD/READ/DISMISSED` |
| Preferencias | tema/idioma/region | guardar segun contrato | `config` |
| Auditoria | consulta SYSTEM_ADMIN | filtrar/autorizar | `identity_audit`, inmutable para app |
| Backup/restore | UI solo si hay API real | orquestar infraestructura | no simular restore con CRUD normal |

---

# 24. Plan de correccion definitivo

## Fase 0 - congelar y sanear

- [ ] Crear rama de saneamiento.
- [ ] Conservar ZIP/commit original como evidencia.
- [ ] Eliminar `node_modules`, `dist`, `.exe`, PDFs de runtime.
- [ ] Corregir `.gitignore`.
- [ ] Dejar un solo `package.json`/lockfile.
- [ ] Corregir casing Linux.
- [ ] Corregir Docker/Nginx.
- [ ] Eliminar codigo fuera de alcance: 2FA/OAuth/refresh/offline queue.

**Salida:** build reproducible y repo limpio.

## Fase 1 - TypeScript + arquitectura

- [ ] Migrar JS/JSX -> TS/TSX.
- [ ] `strict: true`.
- [ ] Estructura por features.
- [ ] Cliente API comun.
- [ ] Error handling comun.
- [ ] Providers unificados.
- [ ] Eliminar duplicados.

**Salida:** shell tecnico sin datos falsos de negocio.

## Fase 2 - design system

- [ ] Tokens de color.
- [ ] Tipografia.
- [ ] spacing/radius/shadows.
- [ ] AppShell responsive.
- [ ] componentes accesibles.
- [ ] dark/light/system.
- [ ] i18n funcional.

**Salida:** interfaz visualmente consistente.

## Fase 3 - Auth real

- [ ] Registro segun DTO real.
- [ ] Login real.
- [ ] JWT.
- [ ] Logout local correcto.
- [ ] expiracion/401.
- [ ] forgot/reset.
- [ ] cambio de contrasena.
- [ ] desactivacion/reactivacion.
- [ ] bloqueo temporal.
- [ ] roles globales.

**No incluir:** MFA, OAuth, refresh obligatorio.

## Fase 4 - Homes real

- [ ] Integrar endpoints ya existentes del modulo Homes.
- [ ] listar hogares.
- [ ] crear/modificar.
- [ ] seleccionar hogar.
- [ ] desactivar/reactivar.
- [ ] zonas.
- [ ] miembros.
- [ ] roles contextuales.
- [ ] tarifa.

## Fase 5 - Devices

- [ ] lista real.
- [ ] registro.
- [ ] zona.
- [ ] editar.
- [ ] desactivar/reactivar.
- [ ] control on/off.
- [ ] estado pending/ack/error.
- [ ] horarios.
- [ ] umbrales.
- [ ] permisos OWNER/MEMBER/GUEST.

## Fase 6 - Telemetria + consumo + WebSocket

- [ ] DTO electrico normalizado.
- [ ] potencia W/kW.
- [ ] energy total/delta.
- [ ] V/A/Hz/temp.
- [ ] historico REST.
- [ ] tiempo real WebSocket.
- [ ] graficas reales.
- [ ] filtros hogar/zona/dispositivo.
- [ ] stale data.
- [ ] tarifa/costo.

## Fase 7 - Recomendaciones, alertas y notificaciones

- [ ] carga real.
- [ ] configuracion por hogar.
- [ ] notificaciones WebSocket.
- [ ] `UNREAD/READ/DISMISSED`.
- [ ] no hard delete.

## Fase 8 - Configuracion

- [ ] idioma.
- [ ] tema.
- [ ] zona horaria.
- [ ] formatos regionales.
- [ ] preferencias de notificacion/recomendacion segun backend.

## Fase 9 - Admin

- [ ] auditoria `SYSTEM_ADMIN`.
- [ ] backup/restore solo si existe operacion real del backend/infraestructura.
- [ ] asistente de voz cuando exista contrato real.

## Fase 10 - cierre de calidad

- [ ] Jest/Testing Library.
- [ ] lint.
- [ ] typecheck.
- [ ] build Linux.
- [ ] accesibilidad.
- [ ] responsive.
- [ ] pruebas de roles.
- [ ] pruebas de WebSocket.
- [ ] E2E con backend.
- [ ] eliminar todos los mocks restantes.

---

# 25. Dependencias entre frontend y backend: regla de avance

Para evitar volver a desalinear capas:

```text
1. BD define estructura/integridad via Liquibase.
2. Prisma introspecta.
3. NestJS implementa caso de uso/DTO/endpoint.
4. Swagger confirma contrato.
5. Frontend integra.
6. Tests validan flujo extremo a extremo.
```

El frontend puede preparar componentes antes del paso 4, pero **no debe declarar una funcionalidad terminada con datos mock**.

---

# 26. Definition of Done por pantalla funcional

Una pantalla no esta terminada hasta cumplir todos:

- [ ] No tiene datos hardcodeados de negocio.
- [ ] Usa TypeScript sin `any` injustificado.
- [ ] Consume endpoint real o se marca explicitamente pendiente.
- [ ] Maneja loading.
- [ ] Maneja empty.
- [ ] Maneja error.
- [ ] Respeta `SYSTEM_ADMIN/USER`.
- [ ] Respeta OWNER/MEMBER/GUEST cuando aplica.
- [ ] Backend vuelve a autorizar.
- [ ] No permite hard delete prohibido.
- [ ] Unidades correctas.
- [ ] Moneda/formato regional correctos.
- [ ] i18n completo.
- [ ] light/dark.
- [ ] responsive.
- [ ] accesible por teclado.
- [ ] test relevante.
- [ ] build Linux pasa.

---

# 27. Checklist de exclusiones para evitar regresiones de alcance

Antes de aprobar un PR de frontend, buscar y rechazar referencias funcionales a:

```text
MFA
2FA
SMS authentication
Google OAuth
refresh token obligatorio
token blacklist
session management avanzado
offline queue
pending command replay
conflict resolution
agua
gas
EUR hardcodeado
2.0TD
tarifa valle
MQTT en browser
PostgreSQL desde browser
```

Una aparicion en documentacion historica no cuenta; una implementacion runtime si debe bloquear el PR.

---

# 28. Prioridades reales

## P0

- repo limpio;
- build;
- TypeScript;
- auth sin mocks/fuera de alcance;
- capa API;
- roles;
- Docker/Nginx.

## P1

- hogares;
- zonas;
- membresias;
- tarifa;
- dispositivos;
- control;
- telemetria;
- consumo;
- WebSocket;
- notificaciones.

## P2

- recomendaciones;
- reportes avanzados;
- configuraciones completas;
- auditoria admin;
- backup/restore UI real;
- asistente de voz cuando backend este disponible.

La prioridad P2 no significa fuera de alcance; significa implementar despues de cerrar los flujos P0/P1 y sus dependencias backend.

---

# 29. Criterio final de aprobacion del frontend

El frontend podra considerarse apto para Smart Home cuando:

```text
[ ] No queden funcionalidades heredadas del SRS 2025 fuera del alcance v2.0.
[ ] No queden mocks de negocio en rutas finales.
[ ] React este migrado a TypeScript.
[ ] Auth use el backend real y JWT vigente.
[ ] Logout cumpla el modelo simplificado del SRS v2.0.
[ ] Roles globales y contextuales controlen la UI.
[ ] Homes/zones/members/tariffs provengan del backend.
[ ] Devices provengan del backend.
[ ] El navegador no use MQTT.
[ ] Telemetria use DTO normalizado.
[ ] Potencia y energia se representen correctamente.
[ ] WebSocket actualice los datos en tiempo real.
[ ] Notificaciones respeten UNREAD/READ/DISMISSED.
[ ] Los historicos no puedan eliminarse desde UI.
[ ] Offline solo ofrezca cache/preferencias/lectura reciente.
[ ] Design system tenga una sola identidad visual.
[ ] Colores cumplan contraste.
[ ] Tipografia sea legible.
[ ] i18n este completo.
[ ] Tema y region sean persistentes.
[ ] Responsive funcione en movil/tablet/desktop.
[ ] WCAG 2.1 AA sea validado en flujos principales.
[ ] Jest/lint/typecheck/build pasen.
[ ] Docker/Nginx sean reproducibles.
[ ] Integracion E2E con NestJS/PostgreSQL/RLS sea validada.
```

---

# 30. Conclusion

El problema del frontend actual no es solamente estetico. La mayor deuda es de **alineacion de dominio y arquitectura**.

La version final debe obedecer una sola cadena de verdad:

```text
SRS v2.0
   -> alcance actualizado
      -> PostgreSQL/Liquibase
         -> Prisma
            -> NestJS
               -> contrato HTTP/WebSocket
                  -> React/TypeScript
```

Cualquier componente que no pueda trazarse de forma razonable a esa cadena debe revisarse antes de permanecer en el producto.

La correccion mas importante frente a la auditoria anterior es que **no se implementaran MFA/2FA, OAuth, refresh token obligatorio, modo offline, configuracion de notificaciones, sincronizacion manual ni recomendaciones**. En cambio, deben reforzarse los elementos que si son estructurales del producto vigente: hogares compartidos, roles contextuales, IoT electrico, Shelly como referencia desacoplada, horarios, umbrales, telemetria normalizada, consumo correcto, WebSocket, RLS, soft delete y auditoria.

Este documento debe utilizarse como checklist de refactor e integracion del frontend y actualizarse unicamente cuando cambie formalmente el SRS, el modelo de base de datos o el contrato del backend.


---

# 31. Fuentes de verdad utilizadas para esta auditoria

Esta version corregida se construyo tomando como jerarquia de referencia:

1. **SRS Smart Home v2.0 - 26/08/2026**, como fuente funcional principal y vigente.
2. **Documentacion de alcance actualizado Smart Home**, para las decisiones que sustituyen requisitos heredados del SRS anterior.
3. **Modelo y revisiones vigentes de PostgreSQL/Liquibase**, para no proponer pantallas, estados, eliminaciones o entidades incompatibles con la persistencia real.
4. **Guia actual de integracion NestJS + Prisma + PostgreSQL + RLS**, para respetar la separacion de responsabilidades y el modelo de autorizacion real.
5. **Cambios de telemetria Shelly 1PM Gen4 y decisiones IoT**, usando Shelly como dispositivo fisico de referencia sin acoplar el frontend al payload del fabricante.
6. **Estado actual del frontend auditado**, incluyendo estructura, dependencias, componentes, estilos, mocks, rutas, Docker, i18n y problemas de integracion observados.

El SRS anterior se considera solamente material historico. Cuando contradice al SRS v2.0 o al alcance actualizado, **no se utiliza para definir funcionalidades del frontend**.
