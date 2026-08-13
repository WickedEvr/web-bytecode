import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireProjectOwnership = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const isRestrictedDeveloper = req.admin?.roles?.includes('developer') && !req.admin?.roles?.includes('super_admin') && !req.admin?.roles?.includes('admin');
  
  if (isRestrictedDeveloper) {
    const idParam = req.params.id || req.params.projectId;
    if (idParam) {
      const projectId = z.string().uuid().parse(idParam);
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [projectId, req.admin?.id]);
      
      if (assignmentCheck.rowCount === 0) {
        throw new HttpError(403, 'No tienes permiso para acceder a este proyecto o sus recursos.');
      }
    }
  }
  
  next();
});

export const requireQuoteOwnership = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const isRestrictedPartner = req.admin?.roles?.includes('partner_designer') && !req.admin?.roles?.includes('super_admin') && !req.admin?.roles?.includes('admin');
  
  if (isRestrictedPartner) {
    const idParam = req.params.id;
    if (idParam) {
      const quoteId = z.string().uuid().parse(idParam);
      const ownershipCheck = await pool.query('SELECT 1 FROM quotes WHERE id = $1 AND created_by = $2', [quoteId, req.admin?.id]);
      
      if (ownershipCheck.rowCount === 0) {
        throw new HttpError(403, 'No tienes permiso para acceder a esta cotización.');
      }
    }
  }
  
  next();
});
