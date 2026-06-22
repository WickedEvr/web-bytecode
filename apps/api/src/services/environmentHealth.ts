import { pool } from '../db/pool.js';

const HEALTH_TIMEOUT_MS = 8000;

const pingHealth = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Bytecode-Environment-Health/1.0' },
    });
    if (!response.ok) return false;
    const payload = await response.json() as { status?: unknown; database?: unknown };
    return payload.status === 'ok' && payload.database === 'connected';
  } finally {
    clearTimeout(timeout);
  }
};

export const verifyEnvironmentHealth = async (environmentId: string, environmentUrl: string, apiUrl?: string | null) => {
  let status: 'active' | 'failed' = 'failed';
  try {
    const targetBase = apiUrl?.trim() || environmentUrl;
    const parsed = new URL(targetBase);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported environment URL protocol.');
    const healthUrl = `${parsed.toString().replace(/\/+$/, '')}/api/health`;
    status = await pingHealth(healthUrl) ? 'active' : 'failed';
  } catch {
    status = 'failed';
  }

  await pool.query(
    `UPDATE project_environments SET status = $2 WHERE id = $1`,
    [environmentId, status],
  );
};

export const triggerEnvironmentVerification = (environmentId: string, environmentUrl: string, apiUrl?: string | null) => {
  void verifyEnvironmentHealth(environmentId, environmentUrl, apiUrl).catch((error: unknown) => {
    console.error('Environment health verification failed:', error);
  });
};
