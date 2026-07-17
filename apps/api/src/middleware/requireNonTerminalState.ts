import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Middleware to block mutations on records that are in a terminal state.
 * @param tableName Table to validate (e.g. 'complaints', 'contact_cases', 'projects')
 * @param idParam Parameter in req.params that contains the ID (default 'id')
 */
export const requireNonTerminalState = (tableName: string, idParam: string = 'id', inBody: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const recordId = inBody ? req.body[idParam] : req.params[idParam];
    if (!recordId) {
      if (inBody) return next();
      return next(new HttpError(400, 'ID de registro requerido.'));
    }

    try {
      const result = await pool.query(
        `SELECT sc.is_terminal 
         FROM ${tableName} t
         JOIN status_catalog sc ON t.status_id = sc.id
         WHERE t.id = $1 AND t.deleted_at IS NULL`,
        [recordId]
      );

      if (result.rowCount === 0) {
        return next(new HttpError(404, 'Registro no encontrado.'));
      }

      if (result.rows[0].is_terminal) {
        return next(new HttpError(403, 'Acción denegada: El registro se encuentra en un estado terminal y es de solo lectura.'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
