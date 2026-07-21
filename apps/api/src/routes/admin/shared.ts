import { z } from 'zod';
import crypto from 'node:crypto';

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(9),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createBusinessCode = (prefix: string) => `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
