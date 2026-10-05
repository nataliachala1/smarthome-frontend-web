# SMARTHOME-FRONTEND

## Stack local con Docker

El entorno local ejecuta el frontend, el backend NestJS, PostgreSQL, las
migraciones Liquibase, Mosquitto y Mailpit mediante Docker Compose.

1. Instala y abre Docker Desktop.
2. Crea el archivo de configuración local:

   ```powershell
   Copy-Item .env.example .env
   ```

3. En `.env`, reemplaza `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`,
   `IOT_DB_PASSWORD` y `JWT_SECRET` por valores aleatorios largos de letras y
   números. No compartas ni subas `.env` a Git.
4. Desde la raíz del repositorio, levanta el entorno:

   ```powershell
   docker compose up --build
   ```

5. Abre la web en <http://localhost:8080>. La interfaz para revisar correos de
   activación y recuperación está en <http://localhost:8025>.

En este entorno local, los correos se capturan en Mailpit; no se envían a
Gmail y no hace falta configurar una contraseña de aplicación. Registra la
cuenta en la web, abre en Mailpit el enlace recibido y luego inicia sesión.
La API y su documentación se sirven bajo <http://localhost:8080/api/docs>; el
estado de la API y PostgreSQL se puede comprobar en <http://localhost:8080/health>.

Comandos útiles:

```powershell
docker compose logs -f backend
docker compose down
```

`docker compose down` conserva los datos de PostgreSQL. Para borrar la base
local y empezar de cero se puede usar `docker compose down -v`; esto elimina
permanentemente el volumen local de datos.