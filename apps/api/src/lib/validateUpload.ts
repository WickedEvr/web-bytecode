import fs from 'node:fs/promises';
import { fileTypeFromFile } from 'file-type';
import { HttpError } from '../utils/httpError.js';

const allowedUploadMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export async function validateUpload(filePath: string) {
  const detected = await fileTypeFromFile(filePath);

  if (!detected || !allowedUploadMimeTypes.has(detected.mime)) {
    await fs.rm(filePath, { force: true });
    throw new HttpError(400, 'Archivo no permitido.');
  }

  return detected.mime;
}
