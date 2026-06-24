import { pool } from '../db/pool.js';
import { runEnvironmentAudit, type EnvironmentType } from './environmentHealth.js';

export const verifyEnvironment = async (environmentId: string, projectId?: string) => {
  try {
    const result = await pool.query(
      `SELECT id, type, url, api_url
       FROM project_environments
       WHERE id = $1 AND ($2::uuid IS NULL OR project_id = $2)
       LIMIT 1`,
      [environmentId, projectId ?? null],
    );
    const environment = result.rows[0];
    if (!environment) throw new Error('Entorno no encontrado.');
    if (!environment.url) throw new Error('La URL del entorno todavía no está disponible.');

    const auditReport = await runEnvironmentAudit(
      environment.id,
      environment.type as EnvironmentType,
      environment.api_url?.trim() || environment.url,
    );
    const failedLayers = Object.values(auditReport.layers).filter((layer) => !layer.ok);
    if (failedLayers.length) {
      await pool.query(
        `UPDATE project_environments
         SET status = 'failed', error_details = $2, audit_report = $3
         WHERE id = $1`,
        [environmentId, failedLayers.map((layer) => layer.msg).join(' · '), auditReport],
      );
      return;
    }
    await pool.query(
      `UPDATE project_environments
       SET status = 'ready', error_details = NULL, audit_report = $2
       WHERE id = $1`,
      [environmentId, auditReport],
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await pool.query(
      `UPDATE project_environments SET status = 'failed', error_details = $2 WHERE id = $1`,
      [environmentId, message],
    );
    throw error;
  }
};

export const triggerEnvironmentVerification = (environmentId: string, projectId?: string) => {
  void verifyEnvironment(environmentId, projectId).catch((error: unknown) => {
    console.error('Environment verification failed:', error);
  });
};
