import { env } from '../config/env.js';

const HEALTH_TIMEOUT_MS = 8000;
const CONTAMINATION_MESSAGE = 'ALERTA CRÍTICA: Contaminación de datos. Este entorno de pruebas está apuntando a la Base de Datos de Producción.';

export type EnvironmentType = 'production' | 'staging' | 'ephemeral';
type HealthPayload = { status?: unknown; database?: unknown; app_env?: unknown };
type InternalConfigPayload = { dbUrl?: unknown; isStaticOnly?: unknown };

export const verifyEnvironmentHealth = async (
  _environmentId: string,
  type: EnvironmentType,
  url: string,
  apiUrl?: string | null,
) => {
  const targetBase = apiUrl?.trim() || url;
  const parsed = new URL(targetBase);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Protocolo de URL no soportado.');
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
    console.log('Validación de salud omitida: Entorno local detectado.');
    return true;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  const baseUrl = parsed.toString().replace(/\/+$/, '');
  const requestOptions: RequestInit = {
    method: 'GET',
    redirect: 'follow',
    signal: controller.signal,
    headers: {
      'user-agent': 'Bytecode-Environment-Health/3.0',
      accept: 'application/json',
    },
  };

  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`, requestOptions);
    if (!healthResponse.ok) throw new Error('El backend no responde.');

    let health: HealthPayload;
    try {
      health = await healthResponse.json() as HealthPayload;
    } catch {
      throw new Error('El endpoint de salud no devolvió un JSON válido.');
    }
    if (health.status !== 'ok' || health.database !== 'connected') {
      throw new Error(
        `Health Check inválido: status=${String(health.status)}, database=${String(health.database)}, app_env=${String(health.app_env)}`,
      );
    }

    if (type === 'staging' || type === 'ephemeral') {
      if (health.app_env === 'production') throw new Error(CONTAMINATION_MESSAGE);

      const configResponse = await fetch(`${baseUrl}/api/internal/config`, requestOptions);
      if (!configResponse.ok) throw new Error('No se pudo validar la configuración interna del backend.');

      let config: InternalConfigPayload;
      try {
        config = await configResponse.json() as InternalConfigPayload;
      } catch {
        throw new Error('La configuración interna no devolvió un JSON válido.');
      }

      if (config.isStaticOnly === true) {
        console.log('Entorno estático detectado, omitiendo validación de BD.');
      } else if (typeof config.dbUrl !== 'string' || !config.dbUrl.trim() || config.dbUrl === env.databaseUrl) {
        throw new Error(CONTAMINATION_MESSAGE);
      }
    }

    return true;
  } finally {
    clearTimeout(timeout);
  }
};
