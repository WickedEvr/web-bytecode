import crypto from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { triggerEnvironmentVerification } from '../services/environmentHealth.js';

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

type GithubDeploymentStatusPayload = {
  repository?: { html_url?: string; full_name?: string };
  deployment?: { id?: number; environment?: string; task?: string; ref?: string };
  deployment_status?: { state?: string; environment_url?: string | null };
};

const findProjectByRepository = (repository?: { html_url?: string; full_name?: string }) => {
  const htmlUrl = repository?.html_url?.replace(/\/+$/, '') ?? null;
  const fullNameUrl = repository?.full_name ? `https://github.com/${repository.full_name}` : null;
  return pool.query(
    `SELECT id FROM projects
     WHERE deleted_at IS NULL
       AND lower(rtrim(github_repo, '/')) IN (lower($1), lower($2))
     LIMIT 1`,
    [htmlUrl, fullNameUrl],
  );
};

const verifyGithubSignature = (req: Request) => {
  if (!env.githubWebhookSecret) {
    if (env.nodeEnv === 'development') return;
    throw new HttpError(500, 'GitHub webhook secret no configurado.');
  }
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
  const event = req.header('x-github-event');

  if (event === 'deployment_status') {
    const payload = req.body as GithubDeploymentStatusPayload;
    const project = await findProjectByRepository(payload.repository);
    if (!project.rowCount) {
      res.status(202).json({ ok: true, ignored: true, reason: 'project_not_mapped' });
      return;
    }
    const state = payload.deployment_status?.state?.toLowerCase();
    const name = payload.deployment?.environment || payload.deployment?.task ||
      (payload.deployment?.id ? `Deployment ${payload.deployment.id}` : null);
    if (!name) throw new HttpError(400, 'Nombre de entorno ausente.');

    if (state === 'inactive' || state === 'destroyed') {
      const deleted = await pool.query(
        `DELETE FROM project_environments
         WHERE project_id = $1 AND type = 'ephemeral' AND name = $2`,
        [project.rows[0].id, name],
      );
      res.status(202).json({ ok: true, deleted: deleted.rowCount ?? 0 });
      return;
    }

    if (state === 'success') {
      const environmentUrl = payload.deployment_status?.environment_url?.trim();
      if (!environmentUrl) {
        res.status(202).json({ ok: true, ignored: true, reason: 'environment_url_missing' });
        return;
      }
      const environment = await pool.query(
        `INSERT INTO project_environments (project_id, type, name, url, status)
         VALUES ($1, 'ephemeral', $2, $3, 'verifying')
         ON CONFLICT (project_id, type, name)
         DO UPDATE SET url = EXCLUDED.url, status = 'verifying', error_details = NULL
         RETURNING id, url, api_url`,
        [project.rows[0].id, name, environmentUrl],
      );
      triggerEnvironmentVerification(environment.rows[0].id, 'ephemeral', environment.rows[0].url, environment.rows[0].api_url);
      res.status(202).json({ ok: true, environment: name });
      return;
    }

    res.status(202).json({ ok: true, ignored: true, reason: 'deployment_state_not_actionable' });
    return;
  }

  if (event !== 'push') {
    res.status(202).json({ ok: true, ignored: true });
    return;
  }

  const payload = req.body as GithubPushPayload;
  const githubRepo = payload.repository?.html_url;
  if (!githubRepo) throw new HttpError(400, 'Repositorio de GitHub ausente.');

  const project = await findProjectByRepository(payload.repository);
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
