# Deployment production guide

Fuente de verdad de base de datos: `docs/database/postgresql_enterprise_schema.sql`.

## 1. Neon

1. Crear proyecto PostgreSQL en Neon.
2. Copiar el connection string pooled.
3. Configurar en Render:
   - `DATABASE_URL=<neon pooled url>`
   - `DATABASE_SSL=true`
   - `DATABASE_POOL_MAX=10`
   - `DATABASE_CONNECTION_TIMEOUT_MS=10000`
   - `DATABASE_IDLE_TIMEOUT_MS=30000`
   - `DATABASE_MAX_USES=7500`
4. Ejecutar migracion una sola vez despues de configurar secrets:

```bash
npm run db:migrate -w @bytecode/api
```

## 2. Render API

Build command:

```bash
npm ci && npm run build -w @bytecode/api
```

Start command:

```bash
npm run start -w @bytecode/api
```

Healthcheck:

```txt
/health
```

Variables obligatorias en produccion:

```txt
NODE_ENV=production
PORT=4000
DATABASE_URL=<neon pooled url>
DATABASE_SSL=true
JWT_SECRET=<64+ random chars>
COOKIE_NAME=bc_admin
COOKIE_SAME_SITE=none
CORS_ORIGINS=https://<frontend-domain>
PUBLIC_API_URL=https://<render-service>.onrender.com
MAX_UPLOAD_MB=10
CLOUDINARY_CLOUD_NAME=<cloud>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
CLOUDINARY_UPLOAD_FOLDER=bytecode/complaints
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_SECURE=false
REQUIRE_SMTP=true
SMTP_USER=<smtp user>
SMTP_PASS=<smtp pass>
SMTP_MAX_RETRIES=2
MAIL_FROM="Bytecode Web <no-reply@bytecode.com.pe>"
ADMIN_NOTIFICATION_EMAILS=admin1@bytecode.com.pe,admin2@bytecode.com.pe
ADMIN_1_NAME=<name>
ADMIN_1_EMAIL=<email>
ADMIN_1_PASSWORD=<strong password>
```

## 3. Cloudinary

Usar una carpeta dedicada por ambiente:

```txt
CLOUDINARY_UPLOAD_FOLDER=bytecode/production/complaints
```

El API sube imagenes como `image` y PDFs como `raw`. Si una transaccion de base de datos falla despues del upload, el API intenta eliminar el asset inmediatamente.

Dry-run de assets huerfanos:

```bash
npm run cloudinary:cleanup-orphans -w @bytecode/api
```

Eliminacion real:

```bash
CLOUDINARY_CLEANUP_DRY_RUN=false npm run cloudinary:cleanup-orphans -w @bytecode/api
```

## 4. Vercel frontend

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

Variable obligatoria:

```txt
VITE_API_BASE_URL=https://<render-service>.onrender.com
```

Despues de publicar, verificar:

- `/` carga sin errores.
- `/admin/login` carga.
- Un login correcto crea cookie `bc_admin` httpOnly y cookie `bc_csrf` visible para el frontend.
- Rutas anidadas bajo `/admin/*` funcionan al refrescar la pagina.

## 5. Smoke test final

1. `GET /health` devuelve `ok: true` y `db: connected`.
2. Crear contacto desde `/contacto`; debe aparecer en Admin > Contactos.
3. Crear reclamo con imagen y con PDF; debe persistir `file_assets` y descargar desde Admin > Reclamos.
4. Crear cotizacion desde Admin > Cotizador; debe insertar `quotes` y `quote_items`.
5. Editar una pagina CMS y validar persistencia.
6. Crear usuario admin de prueba y confirmar que la sidebar respeta su rol.
7. Revisar logs de Render con `x-correlation-id` para cada flujo.
