# Auditoría, Contexto y Roadmap de Refactorización de `admin.ts`
**Propósito de este documento:** Servir como inyección de contexto profundo para cualquier Agente de IA o desarrollador que retome la refactorización del monolito `admin.ts`. Al leer este documento, la IA debe comprender exactamente qué bloques de código se movieron, cómo se manejaron las dependencias circulares y cuál es la arquitectura final esperada, sin necesidad de deducirlo desde cero.

---

## 1. El Problema (Estado Inicial)
El archivo `apps/api/src/routes/admin.ts` contiene más de 3,200 líneas de código con múltiples responsabilidades cruzadas.
Para refactorizarlo, no se debe usar un script masivo de corte a ciegas. La técnica validada es extraer dependencias compartidas a un `shared.ts`, y luego extirpar submódulos (Cotizaciones, Proyectos) montándolos en un enrutador maestro.

---

## 2. Fase 1: Creación de la Capa Compartida (`shared.ts`)
Antes de mover cualquier ruta de negocio, se deben extraer las siguientes variables, tipos y funciones de `admin.ts` e insertarlas en `apps/api/src/routes/admin/shared.ts`. De lo contrario, los submódulos fallarán en compilación (`TS2304`).

**Código exacto a consolidar en `shared.ts`:**
```typescript
import { z } from 'zod';
import crypto from 'node:crypto';
import multer from 'multer';
import { Request } from 'express';
import { PoolClient } from 'pg';
import { HttpError } from '../../utils/httpError.js';
import { allowedUploadMimeTypeList } from '../../lib/validateUpload.js';

// Schemas Globales
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(9),
  offset: z.coerce.number().int().min(0).default(0),
});
export const createBusinessCode = (prefix: string) => `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// Tipados de DB
export type Queryable = Pick<PoolClient, 'query'>;

// Middlewares globales (Multer)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile?: boolean) => void) => {
    if (!allowedUploadMimeTypeList.includes(file.mimetype)) {
      callback(new HttpError(400, 'Tipo MIME no permitido.'));
      return;
    }
    callback(null, true);
  },
});

// Queries compartidas por Historiales y Proyectos
export const statusHistorySelect = (historyTable: string, entityColumn: string) => `
  SELECT h.changed_at AS timestamp, u.name AS user_name, u.email AS user_email,
         old_sc.code AS old_status, old_sc.name AS old_status_name,
         new_sc.code AS new_status, new_sc.name AS new_status_name, h.reason
  FROM ${historyTable} h
  LEFT JOIN status_catalog old_sc ON h.old_status_id = old_sc.id
  LEFT JOIN status_catalog new_sc ON h.new_status_id = new_sc.id
  LEFT JOIN admin_users u ON h.changed_by = u.id
  WHERE h.${entityColumn} = $1 ORDER BY h.changed_at DESC
`;

export const getProjectStatusInfo = async (client: Queryable, code: string) => {
  const result = await client.query(
    "SELECT id, name FROM status_catalog WHERE domain = 'project' AND code = $1 AND is_active = true LIMIT 1",
    [code],
  );
  if (!result.rowCount) throw new HttpError(400, 'Estado de proyecto invalido.');
  return { id: result.rows[0].id as string, name: result.rows[0].name as string };
};
```

---

## 3. Fase 2: Extracción de "Quotes" (Cotizaciones)
**Límites de corte en `admin.ts`:** Desde `let pricingCatalogColumns` hasta la línea de cierre del endpoint `router.delete('/quotes/:id' ...);` (aprox. 400 líneas).
**Archivo de destino:** `apps/api/src/routes/admin/quotes.ts`

**Imports requeridos en `quotes.ts`:**
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireNonTerminalState } from '../../middleware/requireNonTerminalState.js';
import { requireQuoteOwnership } from '../../middleware/abac.js';
import { paginationQuerySchema, createBusinessCode } from './shared.js';
import { auditService } from '../../services/audit.js';

export const quotesRouter = Router();
```
**Acción de enlace en `admin.ts`:**
Reemplazar el bloque extraído con: `router.use('/', quotesRouter);`

---

## 4. Fase 3: Extracción de "Projects" (Proyectos)
**Límites de corte en `admin.ts`:** Desde el comentario `// --- Projects Endpoints ---` hasta la línea de cierre del endpoint `router.get('/projects/:id/history' ...);` (aprox. 725 líneas).
**Archivo de destino:** `apps/api/src/routes/admin/projects.ts`

**Imports vitales en `projects.ts` (Incluye integraciones complejas):**
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireNonTerminalState } from '../../middleware/requireNonTerminalState.js';
import { requireProjectOwnership, blockDeveloperFromProjectSection } from '../../middleware/abac.js';
import { paginationQuerySchema, createBusinessCode, upload, statusHistorySelect, getProjectStatusInfo, type Queryable } from './shared.js';
import { auditService } from '../../services/audit.js';
import { triggerEnvironmentVerification } from '../../services/environmentVerification.js';
import { deleteCloudinaryAsset, uploadPortfolioImageToCloudinary, uploadPaymentReceiptToCloudinary, type CloudinaryStoredAsset } from '../../lib/cloudinary.js';
import { validateUpload } from '../../lib/validateUpload.js';

export const projectsRouter = Router();
```
**Acción de enlace en `admin.ts`:**
Reemplazar el bloque extraído con: `router.use('/', projectsRouter);`

---

## 5. Fase Final: Configuración del Enrutador Maestro (`admin.ts`)
Tras extraer los módulos deseados (y aislar el monolito restante en `core.ts`), el nuevo archivo `admin.ts` debe actuar exclusivamente como controlador de tráfico y aplicación de seguridad global.

**Arquitectura final de `apps/api/src/routes/admin.ts`:**
```typescript
import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { quotesRouter } from './admin/quotes.js';
import { projectsRouter } from './admin/projects.js';
import { coreRouter } from './admin/core.js'; // Contiene Clientes, Pagos, etc.

const router = Router();

// Middleware Global de Seguridad
router.use(requireAdmin);

// Micro-módulos Refactorizados
router.use('/', quotesRouter);
router.use('/', projectsRouter);

// Monolito Restante (Deuda Técnica Planificada)
router.use('/', coreRouter);

export default router;
```

## Instrucción Directa para la IA (CLI Agent)
"Si vas a retomar este trabajo, NO USES scripts de `replace` masivos con Regex, ni uses `splice()` calculando las líneas a ciegas. Utiliza inspección visual (`view_file`), extrae los bloques basándote en los imports detallados arriba, y actualiza los punteros con precisión. Tras cada extracción ejecuta `npx tsc --noEmit` obligatoriamente antes de avanzar."
