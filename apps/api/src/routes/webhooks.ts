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
  const githubEvent = req.headers['x-github-event'];

  if (githubEvent === 'deployment_status' || githubEvent === 'ping' || githubEvent === 'deployment') {
    console.log(`[GitHub Webhook] Ignored informational event: ${githubEvent}`);
    return res.status(202).json({ message: `Event ${githubEvent} ignored safely` });
  }

  if (githubEvent !== 'push') {
    res.status(202).json({ ok: true, ignored: true });
    return;
  }

  const payload = req.body as GithubPushPayload;
  if (!payload.ref) {
    res.status(202).json({ ok: true, ignored: true, reason: 'branch_missing' });
    return;
  }
  const githubRepo = payload.repository?.html_url;
  if (!githubRepo) throw new HttpError(400, 'Repositorio de GitHub ausente.');

  const project = await findProjectByRepository(payload.repository);
  if (!project.rowCount) {
    res.status(202).json({ ok: true, ignored: true, reason: 'project_not_mapped' });
    return;
  }

  const commits = payload.commits?.length ? payload.commits : payload.head_commit ? [payload.head_commit] : [];
  const branchName = payload.ref.replace('refs/heads/', '');
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
         author?.email ?? null, branchName, commit.url ?? null, commit.timestamp ?? null],
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

  const environmentType = branchName === 'main' ? 'production' : branchName === 'develop' ? 'staging' : null;
  let environmentsVerifying = 0;
  if (environmentType) {
    const environments = await pool.query(
      `UPDATE project_environments
       SET status = 'verifying', error_details = NULL
       WHERE project_id = $1 AND type = $2
       RETURNING id, type, url, api_url`,
      [project.rows[0].id, environmentType],
    );
    environmentsVerifying = environments.rowCount ?? 0;
    for (const environment of environments.rows) {
      triggerEnvironmentVerification(environment.id, environment.type, environment.url, environment.api_url);
    }
  }

  res.status(202).json({ ok: true, inserted, environmentsVerifying });
}));

export default router;
