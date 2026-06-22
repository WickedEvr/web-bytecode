import { pool } from '../db/pool.js';

const HEALTH_TIMEOUT_MS = 8000;
const INVALID_JSON_MESSAGE = 'La URL no devolvió un JSON válido (Falta vercel.json o ruta errónea)';
const CONTAMINATION_MESSAGE = 'ALERTA CRÍTICA: Contaminación de datos. Este entorno de pruebas está apuntando a la Base de Datos de Producción.';

type EnvironmentType = 'production' | 'staging' | 'ephemeral';
type HealthPayload = { status?: unknown; database?: unknown; app_env?: unknown };

const persistResult = (environmentId: string, status: 'active' | 'failed', errorDetails: string | null) =>
  pool.query(
    'UPDATE project_environments SET status = $2, error_details = $3 WHERE id = $1',
    [environmentId, status, errorDetails],
  );

export const verifyEnvironmentHealth = async (
  environmentId: string,
  environmentType: EnvironmentType,
  environmentUrl: string,
  apiUrl?: string | null,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const targetBase = apiUrl?.trim() || environmentUrl;
    const parsed = new URL(targetBase);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Protocolo de URL no soportado.');
    const healthUrl = `${parsed.toString().replace(/\/+$/, '')}/api/health`;
    const headers: Record<string, string> = {
      'user-agent': 'Bytecode-Environment-Health/2.0',
      accept: 'application/json',
    };
    if (parsed.hostname.toLowerCase().endsWith('.vercel.app')) {
      const projectResult = await pool.query<{ vercel_bypass_secret: string | null }>(
        `SELECT p.vercel_bypass_secret
         FROM project_environments pe
         JOIN projects p ON p.id = pe.project_id
         WHERE pe.id = $1 AND p.deleted_at IS NULL
         LIMIT 1`,
        [environmentId],
      );
      const bypassSecret = projectResult.rows[0]?.vercel_bypass_secret?.trim();
      if (bypassSecret) headers['x-vercel-protection-bypass'] = bypassSecret;
    }

    const response = await fetch(healthUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers,
    });

    if (response.status !== 200) {
      await persistResult(environmentId, 'failed', `Error HTTP ${response.status}: ${response.statusText}`);
      return;
    }

    let payload: HealthPayload;
    try {
      payload = await response.json() as HealthPayload;
    } catch {
      await persistResult(environmentId, 'failed', INVALID_JSON_MESSAGE);
      return;
    }

    if ((environmentType === 'staging' || environmentType === 'ephemeral') && payload.app_env === 'production') {
      await persistResult(environmentId, 'failed', CONTAMINATION_MESSAGE);
      return;
    }

    if (payload.status !== 'ok' || payload.database !== 'connected') {
      await persistResult(
        environmentId,
        'failed',
        `Health Check inválido: status=${String(payload.status)}, database=${String(payload.database)}, app_env=${String(payload.app_env)}`,
      );
      return;
    }

    await persistResult(environmentId, 'active', null);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await persistResult(environmentId, 'failed', message);
  } finally {
    clearTimeout(timeout);
  }
};

export const triggerEnvironmentVerification = (
  environmentId: string,
  environmentType: EnvironmentType,
  environmentUrl: string,
  apiUrl?: string | null,
) => {
  void verifyEnvironmentHealth(environmentId, environmentType, environmentUrl, apiUrl).catch((error: unknown) => {
    console.error('Environment health verification failed:', error);
  });
};
