import crypto from 'node:crypto';
import path from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const allowedUploadMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const allowedExtensionsByMimeType = new Map([
  ['application/pdf', new Set(['.pdf'])],
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])],
]);

export type ValidatedUpload = {
  originalName: string;
  mimeType: string;
  checksumSha256: string;
};

export const allowedUploadMimeTypeList = [...allowedUploadMimeTypes];

export function sanitizeOriginalFileName(originalName: string) {
  const baseName = path.basename(originalName).replace(/[^\w.\- ]+/g, '_').trim();
  return baseName || 'evidence';
}

export async function validateUpload(file: Express.Multer.File): Promise<ValidatedUpload> {
  if (!file.buffer?.length) {
    throw new HttpError(400, 'Archivo no disponible.');
  }

  const maxBytes = env.maxUploadMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new HttpError(413, `El archivo supera el limite de ${env.maxUploadMb}MB.`);
  }

  const originalName = sanitizeOriginalFileName(file.originalname);
  const extension = path.extname(originalName).toLowerCase();
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected || !allowedUploadMimeTypes.has(detected.mime)) {
    throw new HttpError(400, 'Archivo no permitido.');
  }

  const allowedExtensions = allowedExtensionsByMimeType.get(detected.mime);
  if (!allowedExtensions?.has(extension)) {
    throw new HttpError(400, 'La extension del archivo no coincide con su contenido.');
  }

  if (!allowedUploadMimeTypes.has(file.mimetype)) {
    throw new HttpError(400, 'Tipo MIME no permitido.');
  }

  return {
    originalName,
    mimeType: detected.mime,
    checksumSha256: crypto.createHash('sha256').update(file.buffer).digest('hex'),
  };
}
