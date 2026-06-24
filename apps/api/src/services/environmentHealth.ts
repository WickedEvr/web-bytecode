import { env } from '../config/env.js';

const AUDIT_TIMEOUT_MS = 8000;

export type EnvironmentType = 'production' | 'staging' | 'ephemeral';
export type AuditLayerKey = 'red' | 'config' | 'aislamiento';
export type AuditLayer = { ok: boolean; msg: string; suggestion: string };
export type EnvironmentAuditReport = {
  layers: Record<AuditLayerKey, AuditLayer>;
  errors: string[];
};

const createReport = (): EnvironmentAuditReport => ({
  layers: {
    red: { ok: false, msg: 'Red/Backend inaccesible', suggestion: 'Verifica logs en Render/Vercel' },
    config: { ok: false, msg: 'Configuración faltante', suggestion: 'Sincronizar variables de entorno' },
    aislamiento: { ok: false, msg: 'Base de datos no aislada', suggestion: 'Ejecutar clonado de BD en Neon' },
  },
  errors: [],
});

export const runEnvironmentAudit = async (
  _environmentId: string,
  type: EnvironmentType,
  apiUrl: string,
): Promise<EnvironmentAuditReport> => {
  const report = createReport();
  let parsed: URL;
  try {
    parsed = new URL(apiUrl);
  } catch {
    report.errors.push('URL del backend inválida.');
    return report;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
    console.log('Auditoría omitida: Entorno local detectado.');
    for (const layer of Object.values(report.layers)) layer.ok = true;
    return report;
  }

  const baseUrl = parsed.toString().replace(/\/+$/, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUDIT_TIMEOUT_MS);
  const requestOptions: RequestInit = {
    method: 'GET',
    redirect: 'follow',
    signal: controller.signal,
    headers: { 'user-agent': 'Bytecode-Environment-Audit/1.0', accept: 'application/json' },
  };

  try {
    const health = await fetch(`${baseUrl}/api/health`, requestOptions).catch(() => null);
    if (!health?.ok) {
      report.errors.push(report.layers.red.msg);
      return report;
    }
    report.layers.red.ok = true;

    if (type !== 'ephemeral' && type !== 'staging') {
      report.layers.config.ok = true;
      report.layers.aislamiento.ok = true;
      return report;
    }

    const configResponse = await fetch(`${baseUrl}/api/internal/config`, requestOptions).catch(() => null);
    if (!configResponse?.ok) {
      report.errors.push(report.layers.config.msg);
      return report;
    }

    let config: { dbUrl?: unknown; isStaticOnly?: unknown };
    try {
      config = await configResponse.json() as { dbUrl?: unknown; isStaticOnly?: unknown };
    } catch {
      report.errors.push(report.layers.config.msg);
      return report;
    }
    report.layers.config.ok = true;

    if (config.isStaticOnly === true) {
      report.layers.aislamiento.ok = true;
      return report;
    }
    if (typeof config.dbUrl === 'string' && config.dbUrl.trim() && config.dbUrl !== env.databaseUrl) {
      report.layers.aislamiento.ok = true;
    } else {
      report.errors.push(report.layers.aislamiento.msg);
    }
    return report;
  } finally {
    clearTimeout(timeout);
  }
};
