import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { notifyAdmins } from '../services/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

await fs.mkdir(env.uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, env.uploadDir),
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      callback(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: {
    fileSize: env.maxUploadMb * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    callback(null, allowedMimeTypes.includes(file.mimetype));
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

router.post(
  '/contact-submissions',
  asyncHandler(async (req, res) => {
    const body = contactSchema.parse(req.body);
    const result = await pool.query(
      `
      INSERT INTO contact_submissions (nombre, cargo, email, celular, empresa, ruc, servicio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
      `,
      [body.nombre, body.cargo, body.email, body.celular, body.empresa, body.ruc, body.servicio],
    );

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
  }),
);

router.post(
  '/complaints',
  upload.single('archivoAdjunto'),
  asyncHandler(async (req, res) => {
    const body = complaintSchema.parse(req.body);
    const file = req.file;
    const code = createComplaintCode();

    try {
      const result = await pool.query(
        `
        INSERT INTO complaints (
          code, nombres, apellidos, domicilio, tipo_doc, numero_doc, prefijo_telefono, telefono, email,
          person_type, good_type, monto_cuantificable, descripcion, nombre_unidad, opcion_bien,
          claim_type, tipo_reclamo, detalle, pedido, attachment_original_name, attachment_mime_type,
          attachment_size, attachment_path
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21,
          $22, $23
        )
        RETURNING id, code, created_at
        `,
        [
          code,
          body.nombres,
          body.apellidos,
          body.domicilio,
          body.tipoDoc,
          body.numeroDoc,
          body.prefijoTelefono,
          body.telefono,
          body.email,
          body.personType,
          body.goodType,
          body.montoCuantificable,
          body.descripcion,
          body.nombreUnidad,
          body.opcionBien,
          body.claimType,
          body.tipoReclamo,
          body.detalle,
          body.pedido,
          file?.originalname ?? null,
          file?.mimetype ?? null,
          file?.size ?? null,
          file?.path ?? null,
        ],
      );

      await notifyAdmins('Nuevo reclamo o queja', {
        codigo: code,
        cliente: `${body.nombres} ${body.apellidos}`,
        email: body.email,
        telefono: `${body.prefijoTelefono} ${body.telefono}`,
        tipo: body.claimType,
        motivo: body.tipoReclamo,
        adjunto: file?.originalname ?? 'Sin adjunto',
      });

      res.status(201).json({ id: result.rows[0].id, code: result.rows[0].code, createdAt: result.rows[0].created_at });
    } catch (error) {
      if (file?.path) {
        await fs.rm(file.path, { force: true });
      }
      throw error;
    }
  }),
);

export default router;
