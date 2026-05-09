# Production runbook

## Daily checks

- Render service is healthy: `GET /health`.
- Neon dashboard has no connection saturation.
- Cloudinary usage is inside plan limits.
- SMTP provider has no bounce or auth errors.
- Admin audit log records logins, updates, downloads and quote creation.

## Deploy checklist

1. Confirm clean build locally:

```bash
npm run build
npm run build -w @bytecode/api
npm run test -w @bytecode/api
npm run test:web-security
```

2. Push to the production branch.
3. Deploy API on Render.
4. Run database migration on Render shell:

```bash
npm run db:migrate -w @bytecode/api
```

5. Deploy frontend on Vercel.
6. Run smoke test from `docs/deployment-production.md`.

## Recovery checklist

- If Render deploy fails, roll back to the previous successful deploy in Render.
- If migration fails, stop deployment and inspect the SQL error before retrying. The migration runs inside the enterprise SQL transaction, so a failing schema execution rolls back.
- If Cloudinary upload succeeds but DB commit fails, the API attempts immediate asset deletion. Run orphan cleanup in dry-run mode after any incident:

```bash
npm run cloudinary:cleanup-orphans -w @bytecode/api
```

- If SMTP fails, records still persist in PostgreSQL and the error is logged. Fix SMTP credentials and resend manually from admin context if needed.
- If login fails only in production, check `COOKIE_SAME_SITE=none`, HTTPS, `CORS_ORIGINS`, and `VITE_API_BASE_URL`.

## Troubleshooting

### CORS blocked

Verify `CORS_ORIGINS` exactly matches the Vercel origin, including protocol and no trailing slash.

### Admin mutations return 403

Confirm the browser sends both cookies and `x-csrf-token`. The frontend reads `bc_csrf` and sends it automatically for non-GET API calls.

### Upload rejected

Only validated images and PDFs are accepted. The API checks MIME type and file signature, not only extension.

### Cotizador insert fails

Confirm `pricing_catalog` was seeded by `docs/database/postgresql_enterprise_schema.sql`. Runtime uses `pricing_catalog.base_price` and stores items in `quote_items.pricing_catalog_id`.

### Healthcheck db disconnected

Check Neon connection string, `DATABASE_SSL=true`, pool limits and Render outbound connectivity.
