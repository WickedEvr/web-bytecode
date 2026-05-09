import { pool } from '../db/pool.js';
import { deleteCloudinaryAsset, type CloudinaryResourceType } from '../lib/cloudinary.js';

const resourceTypeForMime = (mimeType: string): CloudinaryResourceType => (
  mimeType === 'application/pdf' ? 'raw' : 'image'
);

async function cleanupCloudinaryOrphans() {
  const limit = Number(process.env.CLOUDINARY_CLEANUP_LIMIT ?? 50);
  const dryRun = process.env.CLOUDINARY_CLEANUP_DRY_RUN !== 'false';

  const result = await pool.query<{
    id: string;
    storage_key: string;
    mime_type: string;
  }>(
    `
    SELECT fa.id, fa.storage_key, fa.mime_type
    FROM file_assets fa
    LEFT JOIN complaint_evidences ce ON ce.file_asset_id = fa.id
    WHERE fa.storage_provider = 'cloudinary'
      AND fa.deleted_at IS NULL
      AND ce.file_asset_id IS NULL
    ORDER BY fa.created_at ASC
    LIMIT $1
    `,
    [limit],
  );

  let deleted = 0;
  for (const asset of result.rows) {
    const resourceType = resourceTypeForMime(asset.mime_type);

    if (!dryRun) {
      await deleteCloudinaryAsset(asset.storage_key, resourceType);
      await pool.query('UPDATE file_assets SET deleted_at = now(), updated_at = now() WHERE id = $1', [asset.id]);
    }

    deleted += 1;
    console.log(JSON.stringify({
      id: asset.id,
      storageKey: asset.storage_key,
      resourceType,
      dryRun,
    }));
  }

  await pool.end();
  console.log(`Cloudinary orphan cleanup completed. candidates=${result.rowCount ?? 0} deleted=${dryRun ? 0 : deleted}`);
}

cleanupCloudinaryOrphans().catch(async (error) => {
  console.error('Cloudinary orphan cleanup failed:', error);
  await pool.end();
  process.exit(1);
});
