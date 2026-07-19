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
    red: { ok: false, msg: 'Red/Backend inaccesible', suggestion: 'Verifica logs de Docker/PM2 en el VPS' },
    config: { ok: false, msg: 'Configuración faltante', suggestion: 'Verificar variables en .env del VPS' },
    aislamiento: { ok: false, msg: 'Base de datos no aislada', suggestion: 'Clonar esquema localmente o contenedor efímero de BD' },
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
  
  const getRequestOptions = (controller: AbortController): RequestInit => ({
    method: 'GET',
    redirect: 'follow',
    signal: controller.signal,
    headers: { 'user-agent': 'Bytecode-Environment-Audit/1.0', accept: 'application/json' },
  });

  // Intentos de conexión (Retry) para lidiar con el cold-start de los entornos efímeros en el VPS
  const maxRetries = 3;
  let health: Response | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 segundos por intento
    
    try {
      health = await fetch(`${baseUrl}/api/health`, getRequestOptions(controller)).catch(() => null);
    } finally {
      clearTimeout(timeout);
    }

    if (health?.ok) break; // Si respondió bien, salimos del loop de intentos
    
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 4000)); // Esperar 4s antes del siguiente intento
    }
  }

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

  // Comprobación de configuración interna (aislamiento, db, estáticos)
  const configController = new AbortController();
  const configTimeout = setTimeout(() => configController.abort(), 10000);
  let configResponse: Response | null = null;

  try {
    configResponse = await fetch(`${baseUrl}/api/internal/config`, getRequestOptions(configController)).catch(() => null);
  } finally {
    clearTimeout(configTimeout);
  }

  if (!configResponse?.ok) {
    report.errors.push(report.layers.config.msg);
    return report;
  }

  let config: { dbUrl?: unknown; isStaticOnly?: unknown };
  try {
    config = (await configResponse.json()) as { dbUrl?: unknown; isStaticOnly?: unknown };
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
};
