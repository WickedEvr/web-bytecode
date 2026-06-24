import { pool } from '../db/pool.js';
import { verifyEnvironmentHealth, type EnvironmentType } from './environmentHealth.js';

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

    await verifyEnvironmentHealth(
      environment.id,
      environment.type as EnvironmentType,
      environment.url,
      environment.api_url,
    );
    await pool.query(
      `UPDATE project_environments SET status = 'ready', error_details = NULL WHERE id = $1`,
      [environmentId],
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
