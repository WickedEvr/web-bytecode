# Arquitectura empresarial de base de datos Bytecode

Fecha de analisis: 2026-05-06  
Proyecto revisado: `web-bytecode`

## Entregables

- PostgreSQL 15+ final production target: `docs/database/postgresql_enterprise_schema.sql`
- MySQL 8+ diagram-generation mirror: `docs/database/mysql_enterprise_schema.sql`
- Documento tecnico: este archivo

Los scripts representan una arquitectura objetivo profesional. No son una
migracion destructiva del esquema actual. Para produccion se debe aplicar por
fases: crear tablas nuevas, migrar datos, validar conteos e integridad, cambiar
la API y finalmente retirar columnas legacy.

## DATABASE INTEGRITY CORRECTIONS v2.0

Esta revision agrega controles de integridad que refuerzan la ejecucion real de
los DDL en PostgreSQL y MySQL 8+, especialmente en tablas con referencias
administrativas, mensajes de casos, adjuntos y expedientes legales.

Correcciones criticas aplicadas:

- Se agrego un seed de usuario interno `system@internal` en `admin_users` para
  resolver el arranque del modelo cuando `created_by` y `updated_by` apuntan a
  la misma tabla.
- Se mantuvieron `created_by` y `updated_by` como `NULL` permitidos para que el
  primer usuario administrativo y procesos de sistema puedan existir sin una
  referencia previa.
- Se agrego `ck_contact_messages_sender_consistency` para asegurar que cada
  mensaje tenga exactamente el emisor esperado segun `sender_type`.
- Se agregaron indices faltantes para mejorar busquedas por cliente,
  organizaciones, respuestas, bienes reclamados, eventos de tiempo y
  notificaciones por entidad.
- Se agrego el trigger `trg_contact_attachments_validate_message` para impedir
  que un adjunto de contacto apunte a un mensaje de otro caso.
- Se nombro explicitamente la unicidad 1:1 de `complaint_details.complaint_id`
  como `uq_complaint_details_complaint`.

Resolucion de FK circular en `admin_users`:

`admin_users.created_by` y `admin_users.updated_by` referencian
`admin_users(id)` para trazabilidad administrativa. Esa relacion es valida, pero
el primer registro no puede depender de un usuario inexistente. La solucion es
mantener ambas columnas como nullable y crear un usuario tecnico de sistema con
`created_by = NULL` y `updated_by = NULL`. Ese usuario permite que seeds,
migraciones y procesos internos tengan una identidad estable sin romper la
integridad referencial.

Check constraints para `sender_type`:

`contact_case_messages` ahora valida tres escenarios:

- `customer`: exige `customer_id` y prohibe `admin_user_id`.
- `admin`: exige `admin_user_id` y prohibe `customer_id`.
- `system`: prohibe ambos identificadores porque el emisor es automatico.

Indices agregados y proposito:

- `idx_customer_documents_customer`: historial documental por cliente.
- `idx_contact_case_messages_customer`: mensajes enviados por cliente y fecha.
- `idx_complaint_time_events_complaint`: trazabilidad de eventos legales por
  reclamo y tipo de evento.
- `idx_complaint_responses_complaint_type`: busqueda de respuestas por reclamo
  y tipo.
- `idx_complaint_goods_complaint`: acceso directo al bien o servicio reclamado.
- `idx_customer_addresses_customer`: direccion primaria e historial de
  direcciones por cliente.
- `idx_customer_organizations_organization`: contactos relacionados a una
  organizacion.
- `idx_notification_events_entity`: notificaciones asociadas a una entidad y su
  estado de entrega.

Trigger de validacion en attachments:

`trg_contact_attachments_validate_message` ejecuta una validacion antes de
insertar en `contact_case_attachments`. Si `message_id` no es nulo, confirma que
el mensaje pertenezca al mismo `contact_case_id`. Esto evita evidencias
cruzadas entre casos y mantiene consistente el expediente de contacto.

Nota sobre soft-deletes en registros legales:

Los registros legales de `complaints`, `complaint_details`,
`complaint_responses` y `complaint_evidences` no deben borrarse fisicamente. La
arquitectura conserva triggers de proteccion contra `DELETE`; los cierres,
anulaciones o archivados deben representarse por estado, fechas de cierre,
historial y, cuando corresponda, `deleted_at` solo para entidades no legales.

| Cambio | Tabla(s) | Tipo | Impacto |
|--------|----------|------|---------|
| Usuario tecnico de sistema | `admin_users` | Seed data | Permite bootstrap sin romper FKs circulares |
| Consistencia de emisor | `contact_case_messages` | CHECK constraint | Evita mensajes con emisor ambiguo o doble |
| Unicidad 1:1 nombrada | `complaint_details` | UNIQUE constraint | Documenta y protege un detalle por reclamo |
| Indices operativos faltantes | Varias tablas de cliente, contacto, reclamo y notificaciones | Performance | Mejora filtros frecuentes y joins administrativos |
| Validacion de adjunto/mensaje | `contact_case_attachments`, `contact_case_messages` | Trigger | Evita adjuntos vinculados a mensajes de otro caso |
| Proteccion legal contra delete | `complaints`, `complaint_details`, `complaint_responses`, `complaint_evidences` | Trigger | Preserva trazabilidad legal y evidencia |

## AGENCY DELIVERY MODULE AND JSON INTEGRITY v3.0

Esta revision agrega el modulo operativo de agencia para controlar proyectos de
software y sus hitos de entrega. Tambien endurece los campos JSON usados por
CMS, auditoria, configuracion y reportes para que acepten solamente objetos JSON
estrictos (`{}`), evitando arrays, escalares o valores nulos que puedan romper
consumidores del frontend.

Nuevas tablas:

- `projects`: expediente operativo de proyecto vinculado a `customers`,
  `organizations` y `service_catalog`. Controla codigo unico, servicio,
  estado de ciclo de vida, URLs de repositorio/produccion, fechas, presupuesto
  y moneda.
- `project_milestones`: hitos de entrega y pago por proyecto. Cada hito depende
  de `projects` con `ON DELETE CASCADE` para mantener consistencia cuando se
  elimina un proyecto no legal.

Estados normalizados por constraint:

- `projects.status`: `planning`, `in_development`, `qa`, `deployed`,
  `maintenance`.
- `project_milestones.status`: `pending`, `completed`, `delayed`,
  `cancelled`.

Restricciones JSON object-only:

- `cms_blocks.content`
- `admin_audit_logs.before_data`
- `admin_audit_logs.after_data`
- `system_settings.setting_value`
- `saved_reports.query_config`

PostgreSQL usa `jsonb_typeof(column_name) = 'object'`; MySQL usa
`JSON_TYPE(column_name) = 'OBJECT'`. El archivo PostgreSQL sigue siendo el
target productivo final; MySQL se mantiene como espejo para diagramacion y debe
permanecer sincronizado en nombres, tablas y relaciones.

## PROJECT DELIVERY FINANCIAL TRACEABILITY v4.0

Esta revision completa el modulo de proyectos con trazabilidad financiera por
hito y con indices estrategicos para las consultas operativas mas frecuentes.
No se agregan tablas de autenticacion de clientes ni portal de cliente; el
alcance sigue limitado a gestion administrativa interna.

Nueva tabla:

- `milestone_payments`: pagos aplicados a hitos de proyecto. Registra monto,
  moneda, metodo de pago, referencia transaccional, comprobante opcional en
  `file_assets`, fecha efectiva de pago, estado financiero y `deleted_at` para
  anulacion logica. Depende de `project_milestones` con `ON DELETE RESTRICT`
  para impedir borrar hitos que ya tienen pagos registrados, y conserva
  comprobantes con `ON DELETE SET NULL`.

Estados financieros de pago:

- `milestone_payments.status`: `valid`, `refunded`, `voided`.

Indices agregados al modulo de proyectos:

- `idx_projects_customer`: listado e historial de proyectos por cliente.
- `idx_projects_status`: tablero administrativo por estado de entrega.
- `idx_projects_service`: analisis de proyectos por servicio vendido.
- `idx_project_milestones_project`: consulta de hitos por proyecto.
- `idx_project_milestones_status`: seguimiento de hitos pendientes, completados
  o demorados.
- `idx_milestone_payments_milestone`: consulta de pagos por hito y validacion
  rapida de bloqueo de eliminacion.

| Cambio | Tabla(s) | Tipo | Impacto |
|--------|----------|------|---------|
| Pagos por hito | `milestone_payments`, `project_milestones`, `file_assets` | Nueva tabla | Permite trazabilidad financiera y adjuntar recibos por hito |
| Proteccion financiera | `milestone_payments`, `project_milestones` | FK RESTRICT | Impide borrar hitos con pagos registrados |
| Estado y soft-delete financiero | `milestone_payments` | CHECK + auditoria | Permite marcar pagos validos, reembolsados o anulados sin borrado fisico |
| Indices de proyectos | `projects`, `project_milestones`, `milestone_payments` | Performance | Mejora dashboard, filtros por cliente/servicio/estado y seguimiento de hitos/pagos |
| Sin portal cliente | N/A | Alcance | Evita introducir autenticacion o usuarios de clientes fuera del alcance actual |

## Analisis del proyecto actual

El checkout tiene frontend React/Vite en `src/` y API Express/PostgreSQL en
`apps/api`. El esquema real actual nace en `apps/api/src/db/migrate.ts`.

Tablas actuales detectadas:

- `admin_users`: usuarios administrativos basicos con `email`, `name`,
  `password_hash`, `role`, actividad y ultimo login.
- `contact_submissions`: formulario publico de contacto con datos de persona,
  empresa, RUC, servicio requerido, estado y notas internas.
- `complaints`: libro de reclamaciones con codigo legal, datos del reclamante,
  datos del bien/servicio, detalle, pedido, adjunto, estado y notas internas.
- `admin_audit_logs`: bitacora simple de acciones admin.

Flujos visibles:

- `/contacto`: captura nombre, cargo, email, celular, empresa, RUC y servicio.
- `/reclamaciones`: captura identificacion del consumidor, documento,
  telefono, email, bien contratado, tipo de queja/reclamo, detalle, pedido,
  aceptacion legal y adjunto.
- `/admin`: login, listado de contactos/reclamos, detalle, cambio de estado,
  notas internas y descarga de adjuntos.
- `/api/admin/stats`: conteos por estado para contactos y reclamos.

Estados actuales:

- `new`
- `read`
- `in_progress`
- `responded`
- `closed`

Problemas estructurales actuales:

- Contactos y reclamos son tablas aisladas; no existe una entidad maestra
  `customers` que permita responder "este cliente contacto y tambien reclamo".
- El estado vive como texto libre en cada tabla; esto dificulta control,
  reportes, traducciones y flujos por dominio.
- El admin solo tiene `role` textual, sin permisos granulares.
- Los adjuntos estan acoplados a `complaints`; no hay repositorio documental
  reutilizable.
- La auditoria no guarda `before_data`, `after_data`, IP, user agent ni
  historial de cambios criticos por campo.
- No existe trazabilidad legal completa: vencimientos, ampliaciones, respuestas,
  evidencias, asignaciones, historial de estados y eventos de tiempo.
- Los catalogos que el frontend simula o codifica en arrays deberian vivir en
  base de datos: paises, tipos de documento, servicios, prioridades, motivos,
  estados y canales.

## Principios de diseno

- Normalizacion relacional: clientes, documentos, organizaciones, casos,
  evidencias, respuestas, estados y permisos estan separados.
- Integridad referencial estricta: el historial legal usa `ON DELETE RESTRICT`;
  entidades de soporte usan `SET NULL` cuando perder la referencia no debe
  destruir la evidencia.
- Soft delete general: `deleted_at` para entidades operativas y de catalogo.
- Auditoria transversal: `created_at`, `updated_at`, `deleted_at`,
  `created_by`, `updated_by` en tablas mantenibles.
- Trazabilidad legal: los reclamos no se eliminan fisicamente; los scripts
  incluyen triggers que bloquean deletes sobre registros legales criticos.
- Escalabilidad: indices compuestos por estado, asignado, cliente y fecha para
  las consultas frecuentes del admin y dashboard.
- Catalogos reutilizables: estados, prioridades, canales, paises, documentos y
  servicios no se duplican por modulo.

## Modulos propuestos

### Seguridad y control

Tablas:

- `admin_users`
- `roles`
- `permissions`
- `admin_user_roles`
- `role_permissions`
- `admin_sessions`

Esto reemplaza el `role` textual como fuente unica de autorizacion. Se mantiene
el campo `role` en `admin_users` por compatibilidad conceptual, pero la
autorizacion real debe venir de roles y permisos.

Relaciones:

- Un admin puede tener muchos roles.
- Un rol tiene muchos permisos.
- Un permiso puede pertenecer a muchos roles.
- Una sesion pertenece a un admin.

### Catalogos

Tablas:

- `countries`
- `document_types`
- `status_catalog`
- `priority_catalog`
- `service_catalog`
- `channel_catalog`

Estos catalogos soportan formularios dinamicos y eliminan constantes dispersas
en frontend/backend. `status_catalog` usa `domain` para separar estados de
casos, CMS u otros modulos sin crear tablas redundantes.

### Clientes y organizaciones

Tablas:

- `customers`
- `customer_documents`
- `organizations`
- `customer_organizations`
- `customer_addresses`

`customers` es la entidad maestra. Un mismo cliente puede tener varios
documentos, pertenecer a una organizacion y generar multiples contactos y
reclamos. Esto permite busquedas por nombre, DNI, RUC, email o telefono.

Relaciones:

- `customers` 1:N `customer_documents`
- `customers` N:M `organizations` mediante `customer_organizations`
- `customers` 1:N `customer_addresses`
- `customers` 1:N `contact_cases`
- `customers` 1:N `complaints`
- `customers` 1:N `projects`

### Proyectos y entregas de agencia

Tablas:

- `projects`
- `project_milestones`
- `milestone_payments`

`projects` representa el contrato operativo de desarrollo de software, app o
servicio tecnico. Se vincula al cliente, organizacion opcional y catalogo de
servicio para conectar ventas, soporte y entrega. `project_milestones` divide
el proyecto en hitos con vencimientos, estado y porcentaje de pago.
`milestone_payments` registra cobros reales, referencias, estados financieros y
recibos por hito sin crear cuentas ni autenticacion para clientes.

Relaciones:

- Un cliente puede tener muchos proyectos.
- Una organizacion puede agrupar muchos proyectos.
- Un servicio catalogado puede originar muchos proyectos.
- Un proyecto tiene muchos hitos.
- Un hito puede tener muchos pagos y no puede eliminarse si existen pagos.
- Un comprobante en `file_assets` puede respaldar muchos pagos.

### Contacto

Tablas:

- `contact_categories`
- `contact_cases`
- `contact_case_messages`
- `contact_case_attachments`
- `contact_case_status_history`
- `contact_case_assignments`

El formulario publico se modela como un caso administrativo, no como un registro
plano. Permite asignacion interna, prioridad, estado, SLA, historial de
conversacion, adjuntos y notas internas.

Relaciones:

- Un cliente crea muchos casos de contacto.
- Un caso puede tener muchos mensajes.
- Un caso puede tener muchos adjuntos.
- Un caso puede tener muchas asignaciones historicas.
- Un caso tiene muchos cambios de estado.

### Libro de reclamaciones

Tablas:

- `complaint_types`
- `complaint_reasons`
- `complaints`
- `complaint_goods`
- `complaint_details`
- `complaint_evidences`
- `complaint_responses`
- `complaint_status_history`
- `complaint_time_events`
- `complaint_assignments`

Este modulo esta pensado como expediente legal. `complaints` contiene el
encabezado y plazos; `complaint_details` contiene el relato y pedido;
`complaint_goods` separa el bien/servicio; `complaint_evidences` vincula
archivos; `complaint_responses` guarda acuses, ampliaciones y respuesta final;
`complaint_time_events` registra vencimientos y tiempos; `complaint_status_history`
preserva trazabilidad.

Decisiones legales:

- `complaints`, detalles, respuestas y evidencias usan `ON DELETE RESTRICT`.
- Los triggers bloquean eliminacion fisica de registros legales.
- `legal_response_due_at`, `extended_response_due_at`, `responded_at` y
  `closed_at` permiten medir cumplimiento de plazo.
- `legal_acceptance` requiere `legal_acceptance_at` cuando esta activo.
- Las respuestas finales se guardan como registros independientes, no como una
  nota sobrescrita.

### Gestion documental

Tabla:

- `file_assets`

Centraliza adjuntos de reclamos, contactos, banners y documentos futuros.
Guarda proveedor, llave de almacenamiento, URL publica opcional, MIME, tamano y
checksum. Esto evita duplicar columnas de archivo por modulo.

### Notificaciones

Tablas:

- `notification_templates`
- `notification_events`
- `admin_notifications`

Permiten enviar acuses, alertas de vencimiento, notificaciones internas y
respuestas por email, SMS, WhatsApp, in-app o webhook.

### Auditoria y logs

Tablas:

- `admin_audit_logs`
- `data_change_history`
- `system_logs`

`admin_audit_logs` registra acciones administrativas con contexto tecnico.
`data_change_history` guarda cambios criticos por campo. `system_logs` permite
operacion, soporte y observabilidad basica.

### Panel administrativo, reportes y CMS

Tablas:

- `saved_reports`
- `dashboard_widgets`
- `system_settings`
- `cms_pages`
- `cms_blocks`
- `banners`
- `menu_items`

Aunque el panel actual solo tiene contactos y reclamos, estas tablas preparan
un admin empresarial: menus controlados por permisos, dashboard configurable,
parametros del sistema, contenido dinamico y banners.

Los campos JSON de `cms_blocks`, `admin_audit_logs`, `system_settings` y
`saved_reports` se restringen a objetos JSON estrictos. Esta decision permite
que el frontend lea configuraciones y payloads con una forma estable, sin tener
que defenderse contra arrays, strings, numeros o booleanos donde espera mapas de
propiedades.

## Diagrama logico textual

```text
admin_users
  1:N admin_sessions
  N:M roles via admin_user_roles
  1:N admin_audit_logs
  1:N admin_notifications

roles
  N:M permissions via role_permissions

permissions
  1:N menu_items

countries
  1:N document_types
  1:N customers
  1:N customer_addresses

customers
  1:N customer_documents
  1:N customer_addresses
  N:M organizations via customer_organizations
  1:N contact_cases
  1:N complaints
  1:N projects

organizations
  N:M customers via customer_organizations
  1:N contact_cases
  1:N complaints
  1:N projects

service_catalog
  1:N contact_cases
  1:N projects

projects
  1:N project_milestones

project_milestones
  1:N milestone_payments

status_catalog
  1:N contact_cases
  1:N contact_case_status_history
  1:N complaints
  1:N complaint_status_history
  1:N cms_pages

priority_catalog
  1:N contact_categories
  1:N contact_cases
  1:N complaints

channel_catalog
  1:N customers
  1:N contact_cases
  1:N complaints

contact_cases
  1:N contact_case_messages
  N:M file_assets via contact_case_attachments
  1:N contact_case_status_history
  1:N contact_case_assignments

complaints
  1:N complaint_goods
  1:1 complaint_details
  N:M file_assets via complaint_evidences
  1:N complaint_responses
  1:N complaint_status_history
  1:N complaint_time_events
  1:N complaint_assignments

file_assets
  N:M contact_cases via contact_case_attachments
  N:M complaints via complaint_evidences
  1:N milestone_payments
  1:N banners

cms_pages
  1:N cms_blocks
  1:N banners

saved_reports
  1:N dashboard_widgets
```

## Consultas que optimiza el modelo

Historia completa de cliente:

```sql
SELECT c.id, c.display_name, c.primary_email, cc.case_code, cp.complaint_code
FROM customers c
LEFT JOIN contact_cases cc ON cc.customer_id = c.id
LEFT JOIN complaints cp ON cp.customer_id = c.id
WHERE c.id = :customer_id
ORDER BY COALESCE(cp.submitted_at, cc.created_at) DESC;
```

Busqueda por documento:

```sql
SELECT c.*
FROM customers c
JOIN customer_documents d ON d.customer_id = c.id
WHERE d.document_number = :document_number
  AND d.deleted_at IS NULL;
```

Reclamos por vencer:

```sql
SELECT complaint_code, customer_id, assigned_to, legal_response_due_at
FROM complaints
WHERE closed_at IS NULL
  AND legal_response_due_at <= now() + interval '48 hours'
ORDER BY legal_response_due_at ASC;
```

Dashboard por estado:

```sql
SELECT s.code, s.name, count(*) AS total
FROM complaints c
JOIN status_catalog s ON s.id = c.status_id
WHERE s.domain = 'case'
GROUP BY s.code, s.name
ORDER BY min(s.sort_order);
```

## Indices principales

- `idx_contact_cases_status_created`: listado del admin por estado y fecha.
- `idx_contact_cases_assignee_status`: bandeja de trabajo por usuario.
- `idx_contact_cases_customer_created`: historial de contactos por cliente.
- `idx_complaints_status_due`: monitoreo legal y alertas de vencimiento.
- `idx_complaints_customer_created`: historial de reclamos por cliente.
- `idx_complaints_assignee_status`: carga operativa por responsable.
- `idx_customer_documents_number`: busqueda por DNI, CE o RUC.
- `idx_projects_customer`: historial de proyectos por cliente.
- `idx_projects_status`: tablero de proyectos por fase operativa.
- `idx_projects_service`: analisis de demanda por servicio.
- `idx_project_milestones_project`: hitos por proyecto.
- `idx_project_milestones_status`: seguimiento de hitos por estado.
- `idx_milestone_payments_milestone`: pagos registrados por hito.
- `idx_admin_audit_entity`: reconstruccion de actividad sobre un registro.
- `idx_data_change_entity`: auditoria fina por entidad y campo.
- Full-text / GIN sobre `customers.display_name`: busqueda por nombre.

## Estrategia de seguridad

- RBAC real con `roles`, `permissions`, `admin_user_roles` y
  `role_permissions`.
- Sesiones persistidas por hash, con expiracion y revocacion.
- Auditoria administrativa con IP, user agent, datos antes/despues y entidad.
- Datos legales protegidos contra eliminacion fisica.
- Tablas de parametros con `is_sensitive` para evitar exposicion accidental.
- Adjuntos centralizados con checksum y proveedor para trazabilidad documental.

## Estrategia de escalabilidad

- Mantener `customers` como eje de correlacion para evitar duplicacion masiva.
- Particionar en el futuro `admin_audit_logs`, `system_logs` y
  `notification_events` por mes si crecen rapido.
- Archivar casos cerrados antiguos con `deleted_at` solo en modulos no legales.
- Separar almacenamiento de archivos en proveedor externo y guardar solo
  metadata en `file_assets`.
- Crear vistas materializadas o snapshots para dashboards de alto trafico si
  los agregados por estado empiezan a ser costosos.
- Usar paginacion por cursor en admin cuando los listados superen decenas de
  miles de registros.

## Estrategia de migracion segura desde el esquema actual

1. Crear catalogos, `customers`, `organizations`, documentos y archivos sin
   tocar tablas legacy.
2. Poblar catalogos base: estados, canales, servicios, tipos de documento,
   tipos de reclamo y prioridades.
3. Crear clientes desde `contact_submissions` usando email, RUC, nombre y
   empresa como claves de conciliacion.
4. Crear clientes desde `complaints` usando tipo/numero de documento, email,
   telefono y nombre completo.
5. Resolver duplicados antes de imponer unicidad fuerte.
6. Migrar contactos a `contact_cases`, conservando `contact_submissions.id` en
   una tabla auxiliar o columna temporal de referencia durante el rollout.
7. Migrar reclamos a `complaints`, `complaint_details`, `complaint_goods`,
   `complaint_evidences` y `complaint_status_history`.
8. Validar conteos: contactos legacy vs casos nuevos; reclamos legacy vs
   expedientes nuevos; adjuntos legacy vs `file_assets`.
9. Cambiar endpoints de lectura del admin a las tablas nuevas.
10. Cambiar endpoints de escritura publica a las tablas nuevas.
11. Mantener tablas legacy en modo solo lectura durante una ventana de
    verificacion.
12. Retirar tablas legacy solo con backup, rollback documentado y aprobacion.

Rollback recomendado:

- Mantener tablas legacy sin modificar durante la fase de doble escritura o
  migracion.
- Registrar tabla de mapeo `legacy_id -> new_id` para cada modulo.
- Si falla el cambio de API, volver endpoints a tablas legacy y conservar
  tablas nuevas para diagnostico.
- No ejecutar `DROP TABLE` en la misma ventana del cutover.

## Adaptacion a la aplicacion

Cambios backend esperados:

- Reemplazar inserts directos a `contact_submissions` por una transaccion que
  haga upsert de `customers`, `organizations`, `customer_documents` y cree
  `contact_cases`.
- Reemplazar inserts directos a `complaints` por una transaccion que cree el
  expediente completo y calcule `legal_response_due_at`.
- Reemplazar `status text` por `status_id`, resolviendo por `domain/code`.
- Actualizar admin para cargar bandejas desde `contact_cases` y `complaints`
  nuevas.
- Usar `file_assets` para adjuntos y descargas.
- Registrar cambios de estado en tablas de historial, no solo en auditoria.

Cambios frontend esperados:

- Cargar paises, tipos de documento, servicios y motivos desde catalogos.
- Mostrar timeline de reclamo y contacto.
- Separar notas internas de respuestas enviadas al cliente.
- Agregar filtros por responsable, prioridad, vencimiento, estado y busqueda
  global por cliente/documento.

## Decision central

La base de datos no debe modelar "formularios recibidos"; debe modelar
clientes, casos y expedientes. El formulario de contacto se convierte en un
caso comercial/soporte. El libro de reclamaciones se convierte en un expediente
legal con plazos, evidencias, respuestas y trazabilidad. Esa diferencia evita
perder historia, permite reportes reales y prepara el admin para crecer sin
recrear el esquema cada vez que aparezca una nueva seccion.
