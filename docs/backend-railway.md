# Backend Bytecode en Railway

## Resumen

El backend vive en `apps/api` y está hecho con Node.js, TypeScript, Express y PostgreSQL.

Incluye:

- API pública para el formulario de contacto.
- API pública para el libro de reclamaciones con adjuntos.
- Panel admin en `/admin` dentro del frontend.
- Login admin con cookie `httpOnly`.
- Dos administradores iniciales por variables de entorno.
- Notificaciones por correo SMTP.
- Descarga protegida de adjuntos.
- Auditoría básica de acciones admin.

## Servicios en Railway

Crea dos servicios:

1. PostgreSQL.
2. Backend Node.js conectado a este repositorio.

Para el backend usa:

```bash
npm install && npm run build -w @bytecode/api
```

Start command:

```bash
npm run start -w @bytecode/api
```

Healthcheck:

```txt
/health
```

También se incluye `railway.api.json` como referencia de configuración.

## Variables de entorno del backend

```txt
NODE_ENV=production
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=un-secreto-largo-y-aleatorio
COOKIE_NAME=bc_admin
COOKIE_SAME_SITE=none
CORS_ORIGINS=https://tu-dominio-frontend.com
PUBLIC_API_URL=https://tu-api.up.railway.app
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_MB=10

ADMIN_1_NAME=Admin 1
ADMIN_1_EMAIL=admin1@bytecode.com.pe
ADMIN_1_PASSWORD=contraseña-segura
ADMIN_2_NAME=Admin 2
ADMIN_2_EMAIL=admin2@bytecode.com.pe
ADMIN_2_PASSWORD=contraseña-segura

SMTP_HOST=smtp.tuproveedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario-smtp
SMTP_PASS=password-smtp
MAIL_FROM="Bytecode Web <no-reply@bytecode.com.pe>"
ADMIN_NOTIFICATION_EMAILS=admin1@bytecode.com.pe,admin2@bytecode.com.pe
```

Para producción con frontend en Vercel y API en Railway, `COOKIE_SAME_SITE=none` es importante para que el login del panel funcione entre dominios.

## Volumen para adjuntos

El backend guarda adjuntos en disco. En Railway configura un Volume montado en:

```txt
/data
```

Y deja:

```txt
UPLOAD_DIR=/data/uploads
```

Sin volumen, los archivos podrían perderse al redeploy.

## Migración de base de datos

Después de configurar variables, ejecuta en Railway:

```bash
npm run db:migrate -w @bytecode/api
```

Esto crea tablas y registra/actualiza los dos admins indicados por variables `ADMIN_1_*` y `ADMIN_2_*`.

Para crear o cambiar un admin manualmente:

```bash
npm run admin:create -w @bytecode/api -- admin@bytecode.com.pe "contraseña" "Nombre Admin"
```

## Variable del frontend

En Vercel o en el entorno donde publiques el frontend:

```txt
VITE_API_BASE_URL=https://tu-api.up.railway.app
```

En local:

```txt
VITE_API_BASE_URL=http://localhost:4000
```

## Flujo funcional

Formulario de contacto:

1. Guarda el registro en `contact_submissions`.
2. Lo muestra en `/admin`, pestaña Contactos.
3. Envía correo a `ADMIN_NOTIFICATION_EMAILS` si SMTP está configurado.

Libro de reclamaciones:

1. Guarda el registro en `complaints`.
2. Genera código `REC-YYYYMMDD-XXXXXX`.
3. Guarda adjunto privado en `UPLOAD_DIR`, si existe.
4. Lo muestra en `/admin`, pestaña Reclamos.
5. Envía correo a `ADMIN_NOTIFICATION_EMAILS` si SMTP está configurado.

Panel admin:

1. Login en `/admin`.
2. Listado de contactos y reclamos.
3. Vista detalle.
4. Cambio de estado.
5. Notas internas.
6. Descarga protegida de adjuntos.

