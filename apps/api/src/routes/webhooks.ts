import crypto from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

type GithubCommit = {
  id?: string;
  message?: string;
  url?: string;
  timestamp?: string;
  author?: { name?: string; email?: string; username?: string };
  committer?: { name?: string; email?: string; username?: string };
};

type GithubPushPayload = {
  ref?: string;
  repository?: { html_url?: string; full_name?: string };
  commits?: GithubCommit[];
  head_commit?: GithubCommit | null;
};

const verifyGithubSignature = (req: Request) => {
  if (!env.githubWebhookSecret) return;
  const signature = req.header('x-hub-signature-256');
  if (!signature?.startsWith('sha256=') || !req.rawBody) throw new HttpError(401, 'Firma de webhook invalida.');
  const expected = crypto.createHmac('sha256', env.githubWebhookSecret).update(req.rawBody).digest('hex');
  const received = signature.slice(7);
  if (received.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))) {
    throw new HttpError(401, 'Firma de webhook invalida.');
  }
};

router.post('/github', asyncHandler(async (req: Request, res: Response) => {
  verifyGithubSignature(req);
  if (req.header('x-github-event') !== 'push') {
    res.status(202).json({ ok: true, ignored: true });
    return;
  }

  const payload = req.body as GithubPushPayload;
  const githubRepo = payload.repository?.html_url;
  if (!githubRepo) throw new HttpError(400, 'Repositorio de GitHub ausente.');

  const project = await pool.query(
    'SELECT id FROM projects WHERE github_repo = $1 AND deleted_at IS NULL LIMIT 1',
    [githubRepo],
  );
  if (!project.rowCount) {
    res.status(202).json({ ok: true, ignored: true, reason: 'project_not_mapped' });
    return;
  }

  const commits = payload.commits?.length ? payload.commits : payload.head_commit ? [payload.head_commit] : [];
  const branch = payload.ref?.replace(/^refs\/heads\//, '') ?? null;
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query('BEGIN');
    for (const commit of commits) {
      if (!commit.id || !commit.message) continue;
      const author = commit.author ?? commit.committer;
      const result = await client.query(
        `INSERT INTO project_commits (
           project_id, commit_hash, message, author_name, author_email,
           branch, github_url, committed_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (project_id, commit_hash) DO NOTHING
         RETURNING id`,
        [project.rows[0].id, commit.id, commit.message, author?.name ?? author?.username ?? null,
         author?.email ?? null, branch, commit.url ?? null, commit.timestamp ?? null],
      );
      inserted += result.rowCount ?? 0;
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  res.status(202).json({ ok: true, inserted });
}));

export default router;
