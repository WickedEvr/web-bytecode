import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';
import { HttpError } from '../utils/httpError.js';
import { SystemRoles } from '../config/roles.js';

export const requireProjectOwnership = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const isRestrictedDeveloper = req.admin?.roles.includes(SystemRoles.DEVELOPER) && 
      !req.admin?.roles.includes(SystemRoles.SUPER_ADMIN) && 
      !req.admin?.roles.includes(SystemRoles.ADMIN);

    if (isRestrictedDeveloper) {
      const projectId = req.params.id;
      if (!projectId) return next(new HttpError(400, 'Project ID missing'));

      const assignmentCheck = await pool.query(
        'SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2',
        [projectId, req.admin?.id]
      );
      if (assignmentCheck.rowCount === 0) {
        throw new HttpError(403, 'No tienes permiso para interactuar con un proyecto no asignado.');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const blockDeveloperFromProjectSection = (sectionName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const isRestrictedDeveloper = req.admin?.roles.includes(SystemRoles.DEVELOPER) && 
      !req.admin?.roles.includes(SystemRoles.SUPER_ADMIN) && 
      !req.admin?.roles.includes(SystemRoles.ADMIN);
    
    if (isRestrictedDeveloper) {
      return next(new HttpError(403, `No tienes permiso para interactuar con la seccion de ${sectionName}.`));
    }
    next();
  };
};

export const requireQuoteOwnership = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const isPartnerDesigner = req.admin?.roles.includes(SystemRoles.PARTNER_DESIGNER) && 
      !req.admin?.roles.includes(SystemRoles.SUPER_ADMIN) && 
      !req.admin?.roles.includes(SystemRoles.ADMIN);
    
    if (isPartnerDesigner) {
      const quoteId = req.params.id;
      if (!quoteId) return next(new HttpError(400, 'Quote ID missing'));
      
      const ownerCheck = await pool.query(
        'SELECT 1 FROM quotes WHERE id = $1 AND created_by = $2',
        [quoteId, req.admin?.id]
      );
      
      if (ownerCheck.rowCount === 0) {
        throw new HttpError(403, 'No tienes permiso para ver o modificar una cotizacion que no has generado.');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
