import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError.js';

const csrfCookieName = 'bc_csrf';
const csrfHeaderName = 'x-csrf-token';

const timingSafeTokenEquals = (cookieToken: string, headerToken: string) => {
  const cookieBuffer = Buffer.from(cookieToken, 'utf8');
  const headerBuffer = Buffer.from(headerToken, 'utf8');

  if (cookieBuffer.length !== headerBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(cookieBuffer, headerBuffer);
};

export const requireCsrf = (req: Request, _res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.[csrfCookieName];
  const headerToken = req.header(csrfHeaderName);

  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    !timingSafeTokenEquals(cookieToken, headerToken)
  ) {
    next(new HttpError(403, 'CSRF token inválido'));
    return;
  }

  next();
};
