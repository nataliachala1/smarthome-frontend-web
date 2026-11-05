# SmartHome — Frontend web

Aplicación web de SmartHome, desarrollada con **React 18, TypeScript y Vite 6**. El código ejecutable, sus pruebas y la configuración de despliegue están dentro de `web/`.

## Requisitos

- Node.js 22 y npm para desarrollar y validar.
- Backend SmartHome accesible para probar autenticación, dispositivos y funciones en tiempo real.
- Docker, opcional, para construir la imagen de producción.

## Desarrollo local (PowerShell)

```powershell
git clone https://github.com/nataliachala1/smarthome-frontend-web.git
cd smarthome-frontend-web\web
Copy-Item .env.example .env.local
npm ci
npm run dev
```

El servidor de Vite se inicia con el puerto que indique la consola (normalmente 5173). En `web/.env.local` ajusta `VITE_BACKEND_URL` a la dirección del backend **alcanzable desde el navegador y el equipo local**; el valor de ejemplo es `http://localhost:3000`.

Variables públicas usadas por la web:

| Variable | Propósito |
| --- | --- |
| `VITE_API_URL` | Base de la API, por defecto `/api/v1` |
| `VITE_BACKEND_URL` | Destino del proxy de Vite durante desarrollo |
| `VITE_REALTIME_URL` | Namespace de Socket.IO, por defecto `/realtime` |
| `VITE_REALTIME_BACKEND_URL` | Origen alternativo opcional para el proxy de Socket.IO |
| `VITE_APP_ENV` | Identificación del entorno de frontend |

**No guardar secretos en variables `VITE_*`**: Vite puede incluir su contenido en los archivos públicos del navegador. Los archivos `.env` y `.env.local` están excluidos de Git.

## Validaciones

Ejecutar desde `web/`:

```powershell
npm ci
npm run lint
npm run typecheck
npm run test:contracts
npm run build
```

El flujo `.github/workflows/ci-deploy.yml` también comprueba la compilación Docker y ejecuta una prueba de humo del contenedor. La aprobación de CI no sustituye las pruebas de extremo a extremo con backend y un dispositivo Shelly reales.

## Imagen Docker y proxy

Desde la raíz:

```powershell
docker build -t smarthome-frontend-web -f web/Dockerfile web
```

La imagen utiliza Nginx sin privilegios y expone el puerto 8080. `web/nginx.conf` define el fallback para rutas SPA y el proxy de `/api/`, `/health` y `/socket.io/` al servicio `backend:3000`. Por ello, arrancar el contenedor aislado no proporciona por sí solo un backend funcional.

## Docker Compose integrado: atención a dependencias externas

El `docker-compose.yml` de la raíz es una **referencia de laboratorio local**, no una pila autónoma incluida en este repositorio. Para utilizarlo deben existir las rutas externas que declara:

- `./smarthome-backend-08-dev`
- `./smarthome-database-dev`
- `./docker/mosquitto.conf`

No ejecutar `docker compose up --build` esperando que funcione desde un clon aislado. Una vez preparado el entorno integrado y un `.env` basado en `.env.example` con claves propias, se puede validar con `docker compose config` antes de iniciarlo. `docker compose down -v` **elimina los volúmenes locales** y sus datos.

## Documentación central

La documentación canónica está en [smart-home-doc](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc), especialmente [arquitectura web](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc/blob/main/docs/10-arquitectura/frontend-web.md). Los informes históricos de auditoría siguen disponibles en el historial y en esta rama de origen hasta que se completen las copias verificadas en el repositorio documental; no se deben borrar antes de ese traslado.

## Ramas y entregas

Proponer cambios mediante Pull Requests contra `dev`, ejecutar CI y revisar el diff antes de fusionar. No fusionar PR de reversión de funcionalidades sin evaluación. El trabajo de limpieza no debe modificar los contratos ni activar despliegues.
