import crypto from 'node:crypto';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../config/env.js';
import { CLOUDINARY_UPLOAD_FOLDER } from '../config/constants.js';

export type CloudinaryResourceType = 'image' | 'raw';

export type CloudinaryStoredAsset = {
  publicId: string;
  secureUrl: string;
  bytes: number;
  resourceType: CloudinaryResourceType;
};

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

const assertCloudinaryConfigured = () => {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new Error('Cloudinary is not configured.');
  }
};

const resourceTypeForMime = (mimeType: string): CloudinaryResourceType => (
  mimeType === 'application/pdf' ? 'raw' : 'image'
);

const createPublicId = (prefix: string) => {
  const normalizedPrefix = prefix.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '');
  return `${normalizedPrefix || 'evidence'}-${crypto.randomUUID()}`;
};

export async function uploadComplaintEvidenceToCloudinary(input: {
  buffer: Buffer;
  complaintCode: string;
  originalName: string;
  mimeType: string;
}): Promise<CloudinaryStoredAsset> {
  assertCloudinaryConfigured();
  const resourceType = resourceTypeForMime(input.mimeType);

  return new Promise((resolve, reject) => {
    let isSettled = false;
    const fail = (error: unknown) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);
      reject(error);
    };
    const timeout = setTimeout(() => {
      stream.destroy(new Error('Cloudinary upload timed out.'));
      fail(new Error('Cloudinary upload timed out.'));
    }, env.cloudinary.uploadTimeoutMs);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_UPLOAD_FOLDER,
        public_id: createPublicId(input.complaintCode),
        resource_type: resourceType,
        overwrite: false,
        use_filename: false,
        unique_filename: false,
        filename_override: input.originalName,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          fail(error ?? new Error('Cloudinary upload did not return a result.'));
          return;
        }

        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeout);
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          bytes: result.bytes,
          resourceType,
        });
      },
    );

    stream.end(input.buffer);
  });
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: CloudinaryResourceType) {
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}
