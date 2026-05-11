import crypto from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import {
  deleteCloudinaryAsset,
  uploadComplaintEvidenceToCloudinary,
  type CloudinaryStoredAsset,
} from '../lib/cloudinary.js';
import { allowedUploadMimeTypeList, validateUpload, type ValidatedUpload } from '../lib/validateUpload.js';
import { publicFormLimiter } from '../middleware/rateLimiters.js';
import { notifyAdmins } from '../services/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadMb * 1024 * 1024,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile?: boolean) => void) => {
    if (!allowedUploadMimeTypeList.includes(file.mimetype)) {
      callback(new HttpError(400, 'Tipo MIME no permitido.'));
      return;
    }

    callback(null, true);
  },
});

const contactSchema = z.object({
  nombre: z.string().trim().min(2).max(160),
  cargo: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(180),
  celular: z.string().trim().min(6).max(40),
  empresa: z.string().trim().min(2).max(180),
  ruc: z.string().trim().min(6).max(30),
  servicio: z.string().trim().min(2).max(120),
});

const complaintSchema = z.object({
  nombres: z.string().trim().min(2).max(160),
  apellidos: z.string().trim().min(2).max(160),
  domicilio: z.string().trim().min(4).max(240),
  tipoDoc: z.string().trim().min(1).max(30),
  numeroDoc: z.string().trim().min(4).max(40),
  prefijoTelefono: z.string().trim().min(1).max(10).default('+51'),
  telefono: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(180),
  personType: z.string().trim().min(1).max(40),
  goodType: z.string().trim().min(1).max(40),
  montoCuantificable: z.string().trim().max(80).optional().default(''),
  descripcion: z.string().trim().min(2).max(240),
  nombreUnidad: z.string().trim().max(160).optional().default(''),
  opcionBien: z.string().trim().max(120).optional().default(''),
  claimType: z.string().trim().min(1).max(40),
  tipoReclamo: z.string().trim().min(2).max(160),
  detalle: z.string().trim().min(10).max(3000),
  pedido: z.string().trim().min(5).max(2000),
  aceptaTerminos: z.coerce.boolean().refine((value) => value, 'Debe aceptar la declaración.'),
});

const createComplaintCode = () => {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `REC-${datePart}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const normalizeGoodType = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (['producto', 'product'].includes(normalized)) return 'product';
  if (['servicio', 'service'].includes(normalized)) return 'service';
  throw new HttpError(400, 'Tipo de bien no permitido.');
};

const parseClaimedAmount = (value: string) => {
  const normalized = value.replace(/[^\d.,-]/g, '').replace(',', '.').trim();
  if (!normalized) return null;

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new HttpError(400, 'Monto reclamado invalido.');
  }

  return amount;
};

// --- ENDPOINTS PARA CATÁLOGOS ---
router.get('/catalog/countries', asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT id, iso2 as iso, name, dial_code as "dialCode", phone_max_length as "maxLength" FROM countries WHERE is_active = true ORDER BY name ASC');
  res.json({ items: result.rows });
}));

router.get('/catalog/services', asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT id, code, name FROM service_catalog WHERE is_active = true ORDER BY name ASC');
  res.json({ items: result.rows });
}));

router.get('/catalog/document-types', asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT id, code, name FROM document_types WHERE is_active = true ORDER BY name ASC');
  res.json({ items: result.rows });
}));

router.get('/catalog/complaint-types', asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT id, code, name FROM complaint_types WHERE is_active = true ORDER BY name ASC');
  res.json({ items: result.rows });
}));

router.get('/catalog/statuses', asyncHandler(async (req: Request, res: Response) => {
  const domain = req.query.domain ? String(req.query.domain) : 'case';
  const result = await pool.query('SELECT id, code, name FROM status_catalog WHERE domain = $1 AND is_active = true ORDER BY sort_order ASC', [domain]);
  res.json({ items: result.rows });
}));

router.get('/catalog/pricing', asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT id, item_code, name, description, pricing_model, base_price, max_price FROM pricing_catalog WHERE is_active = true ORDER BY name ASC');
  res.json({ items: result.rows });
}));

router.post(
  '/contact-submissions',
  publicFormLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const body = contactSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const customerRes = await client.query(
        `
        INSERT INTO customers (customer_code, first_name, primary_email, primary_phone)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [`CUS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, body.nombre, body.email.toLowerCase(), body.celular]
      );
      const customerId = customerRes.rows[0].id;

      const statusRes = await client.query("SELECT id FROM status_catalog WHERE domain = 'case' AND code = 'new' LIMIT 1");
      if (statusRes.rowCount === 0) throw new Error('Status catalog not initialized');
      const statusId = statusRes.rows[0].id;

      const result = await client.query(
        `
        INSERT INTO contact_cases (case_code, customer_id, status_id, subject, message, internal_notes) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
        `,
        [
          `CAS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, 
          customerId, 
          statusId, 
          body.servicio, 
          `Empresa: ${body.empresa}\nCargo: ${body.cargo}\nRUC: ${body.ruc}`, 
          ''
        ],
      );

      await client.query('COMMIT');

      await notifyAdmins('Nuevo mensaje de contacto', {
        nombre: body.nombre,
        cargo: body.cargo,
        email: body.email,
        celular: body.celular,
        empresa: body.empresa,
        ruc: body.ruc,
        servicio: body.servicio,
      });

      res.status(201).json({ id: result.rows[0].id, createdAt: result.rows[0].created_at });
    } catch (e: unknown) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }),
);

router.post(
  '/complaints',
  publicFormLimiter,
  upload.single('archivoAdjunto'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = complaintSchema.parse(req.body);
    const file: Express.Multer.File | undefined = req.file;
    const code = createComplaintCode();
    let validatedFile: ValidatedUpload | null = null;
    let cloudinaryAsset: CloudinaryStoredAsset | null = null;

    if (file) {
      validatedFile = await validateUpload(file);

      try {
        cloudinaryAsset = await uploadComplaintEvidenceToCloudinary({
          buffer: file.buffer,
          complaintCode: code,
          originalName: validatedFile.originalName,
          mimeType: validatedFile.mimeType,
        });
      } catch (error: unknown) {
        console.error('Cloudinary complaint evidence upload failed:', error);
        throw new HttpError(502, 'No se pudo almacenar el archivo adjunto.');
      }
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const customerRes = await client.query(
        `
        INSERT INTO customers (customer_code, first_name, last_name, primary_email, primary_phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [`CUS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, body.nombres, body.apellidos, body.email.toLowerCase(), `${body.prefijoTelefono} ${body.telefono}`]
      );
      const customerId = customerRes.rows[0].id;

      const statusRes = await client.query("SELECT id FROM status_catalog WHERE domain = 'case' AND code = 'new' LIMIT 1");
      if (statusRes.rowCount === 0) throw new Error('Status catalog not initialized');
      const statusId = statusRes.rows[0].id;

      // Handle complaint_type_id mapping from string code (claimType = queja/reclamo)
      const typeRes = await client.query("SELECT id FROM complaint_types WHERE code = $1 LIMIT 1", [body.claimType.toLowerCase()]);
      const complaintTypeId = (typeRes.rowCount ?? 0) > 0 ? typeRes.rows[0].id : null;
      if (!complaintTypeId) throw new Error('Tipo de reclamo inválido.');

      let fileAssetId = null;
      if (file && validatedFile && cloudinaryAsset) {
        const fileRes = await client.query(
          `
          INSERT INTO file_assets (
            original_name, storage_provider, storage_key, public_url,
            mime_type, byte_size, checksum_sha256
          )
          VALUES ($1, 'cloudinary', $2, $3, $4, $5, $6)
          RETURNING id
          `,
          [
            validatedFile.originalName,
            cloudinaryAsset.publicId,
            cloudinaryAsset.secureUrl,
            validatedFile.mimeType,
            cloudinaryAsset.bytes || file.size,
            validatedFile.checksumSha256,
          ],
        );
        fileAssetId = fileRes.rows[0].id;
      }

      const result = await client.query(
        `
        INSERT INTO complaints (
          complaint_code, customer_id, complaint_type_id, status_id, 
          legal_acceptance, legal_acceptance_at, legal_response_due_at, internal_notes
        )
        VALUES ($1, $2, $3, $4, $5, now(), now() + interval '15 days', '')
        RETURNING id, complaint_code, created_at
        `,
        [code, customerId, complaintTypeId, statusId, body.aceptaTerminos],
      );

      const complaintId = result.rows[0].id;

      await client.query(
        `
        INSERT INTO complaint_details (complaint_id, incident_detail, requested_solution, customer_ip, customer_user_agent)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [complaintId, body.detalle, body.pedido, req.ip, req.headers['user-agent']]
      );

      await client.query(
        `
        INSERT INTO complaint_goods (complaint_id, good_type, description, category, claimed_amount)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [complaintId, normalizeGoodType(body.goodType), body.descripcion, body.tipoReclamo, parseClaimedAmount(body.montoCuantificable)]
      );

      if (fileAssetId) {
        await client.query(
          `INSERT INTO complaint_evidences (complaint_id, file_asset_id) VALUES ($1, $2)`,
          [complaintId, fileAssetId]
        );
      }

      await client.query('COMMIT');

      await notifyAdmins('Nuevo reclamo o queja', {
        codigo: code,
        cliente: `${body.nombres} ${body.apellidos}`,
        email: body.email,
        telefono: `${body.prefijoTelefono} ${body.telefono}`,
        tipo: body.claimType,
        motivo: body.tipoReclamo,
        adjunto: validatedFile?.originalName ?? 'Sin adjunto',
      });

      res.status(201).json({ id: complaintId, code: result.rows[0].complaint_code, createdAt: result.rows[0].created_at });
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (cloudinaryAsset) {
        await deleteCloudinaryAsset(cloudinaryAsset.publicId, cloudinaryAsset.resourceType).catch((cleanupError: unknown) => {
          console.error('Cloudinary cleanup failed after database rollback:', cleanupError);
        });
      }
      throw error;
    } finally {
      client.release();
    }
  }),
);
export default router;
