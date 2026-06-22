import { pool } from '../db/pool.js';

const HEALTH_TIMEOUT_MS = 8000;

const ping = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Bytecode-Environment-Health/1.0' },
    });
    return response.ok;
  } finally {
    clearTimeout(timeout);
  }
};

export const verifyEnvironmentHealth = async (environmentId: string, environmentUrl: string) => {
  let status: 'active' | 'failed' = 'failed';
  try {
    const parsed = new URL(environmentUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported environment URL protocol.');
    const healthUrl = new URL('/api/health', parsed.origin).toString();
    const candidates = [...new Set([healthUrl, parsed.toString()])];
    for (const candidate of candidates) {
      try {
        if (await ping(candidate)) {
          status = 'active';
          break;
        }
      } catch {
        // Try the environment root when its dedicated health route is unavailable.
      }
    }
  } catch {
    status = 'failed';
  }

  await pool.query(
    `UPDATE project_environments SET status = $2 WHERE id = $1`,
    [environmentId, status],
  );
};

export const triggerEnvironmentVerification = (environmentId: string, environmentUrl: string) => {
  void verifyEnvironmentHealth(environmentId, environmentUrl).catch((error: unknown) => {
    console.error('Environment health verification failed:', error);
  });
};
