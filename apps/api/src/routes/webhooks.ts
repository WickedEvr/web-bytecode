import crypto from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

type GithubRepository = { html_url?: string; full_name?: string };

type GithubPushPayload = {
  ref?: string;
  after?: string;
  repository?: GithubRepository;
};

type GithubDeploymentStatusPayload = {
  repository?: GithubRepository;
  deployment?: { sha?: string };
  deployment_status?: {
    target_url?: string | null;
    environment?: string;
    state?: string;
  };
};

const findProjectByRepository = (repository?: GithubRepository) => {
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

  if (githubEvent === 'ping') {
    return res.status(202).json({ message: 'Event ping ignored' });
  }
  if (githubEvent !== 'push' && githubEvent !== 'deployment_status') {
    return res.status(202).json({ message: `Event ${githubEvent} ignored` });
  }

  if (githubEvent === 'push') {
    const payload = req.body as GithubPushPayload;
    if (!payload.ref) return res.status(400).json({ error: 'Missing ref' });

    const branchName = payload.ref.replace('refs/heads/', '');
    const sha = payload.after;
    if (branchName === 'main' || branchName === 'master') {
      console.log(`[GitHub Webhook] Ignored production push for branch: ${branchName}`);
      return res.status(200).json({ message: 'Production push ignored; no preview created.' });
    }
    if (!sha) return res.status(400).json({ error: 'Missing commit SHA' });

    const project = await findProjectByRepository(payload.repository);
    if (!project.rowCount) {
      return res.status(202).json({ ok: true, ignored: true, reason: 'project_not_mapped' });
    }
    const projectId = project.rows[0].id;
    await pool.query(
      `INSERT INTO project_environments (project_id, type, name, branch_name, commit_sha, status)
       VALUES ($1, 'ephemeral', $2, $3, $4, 'verifying')
       ON CONFLICT (project_id, type, name)
       DO UPDATE SET commit_sha = EXCLUDED.commit_sha, branch_name = EXCLUDED.branch_name,
                     status = 'verifying', error_details = NULL`,
      [projectId, `Preview: ${branchName}`, branchName, sha],
    );
    return res.status(200).json({ message: 'Preview initialized', branchName, sha });
  }

  const payload = req.body as GithubDeploymentStatusPayload;
  const project = await findProjectByRepository(payload.repository);
  if (!project.rowCount) {
    return res.status(202).json({ ok: true, ignored: true, reason: 'project_not_mapped' });
  }

  const projectId = project.rows[0].id;
  const sha = payload.deployment?.sha;
  const targetUrl = payload.deployment_status?.target_url;
  const environmentType = payload.deployment_status?.environment?.toLowerCase();
  const state = payload.deployment_status?.state?.toLowerCase();

  if (environmentType === 'production') {
    await pool.query(
      `UPDATE project_environments
       SET url = $1, status = 'ready'
       WHERE project_id = $2 AND type = 'production'`,
      [targetUrl, projectId],
    );
    return res.status(200).json({ message: 'Production URL updated, preview creation blocked.' });
  }

  if (environmentType === 'preview' && state === 'success') {
    if (!sha || !targetUrl) {
      return res.status(400).json({ error: 'Missing deployment SHA or target URL' });
    }
    const updated = await pool.query(
      `UPDATE project_environments
       SET url = $1, status = 'ready', error_details = NULL
       WHERE project_id = $2 AND commit_sha = $3 AND type = 'ephemeral'`,
      [targetUrl, projectId, sha],
    );
    return res.status(200).json({ message: 'Preview URL updated', updated: updated.rowCount ?? 0 });
  }

  return res.status(202).json({ message: 'Deployment status ignored' });
}));

export default router;
