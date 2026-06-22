const fs = require('fs');

let content = fs.readFileSync('src/routes/admin.ts', 'utf8');

content = content.replace(
`const getProjectStatusId = async (client: Queryable, code: string) => {
  const result = await client.query(
    "SELECT id FROM status_catalog WHERE domain = 'project' AND code = $1 AND is_active = true LIMIT 1",
    [code],
  );
  if (!result.rowCount) throw new HttpError(400, 'Estado de proyecto invalido.');
  return result.rows[0].id as string;
};`,
`const getProjectStatusInfo = async (client: Queryable, code: string) => {
  const result = await client.query(
    "SELECT id, name FROM status_catalog WHERE domain = 'project' AND code = $1 AND is_active = true LIMIT 1",
    [code],
  );
  if (!result.rowCount) throw new HttpError(400, 'Estado de proyecto invalido.');
  return { id: result.rows[0].id as string, name: result.rows[0].name as string };
};`);

content = content.replace(
`const statusId = await getProjectStatusId(pool, body.status);`,
`const { id: statusId } = await getProjectStatusInfo(pool, body.status);`);

content = content.replace(
`      const current = await client.query(
        \`SELECT p.status_id, p.customer_id, sc.code AS status_code
         FROM projects p
         LEFT JOIN status_catalog sc ON sc.id = p.status_id
         WHERE p.id = $1 AND p.deleted_at IS NULL
         FOR UPDATE OF p\`,
        [id],
      );
      if (!current.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
      const oldStatusId = current.rows[0].status_id as string | null;
      const oldStatusCode = current.rows[0].status_code as string | null;
      const statusId = body.status ? await getProjectStatusId(client, body.status) : null;`,
`      const current = await client.query(
        \`SELECT p.status_id, p.customer_id, sc.name AS status_name
         FROM projects p
         LEFT JOIN status_catalog sc ON sc.id = p.status_id
         WHERE p.id = $1 AND p.deleted_at IS NULL
         FOR UPDATE OF p\`,
        [id],
      );
      if (!current.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
      const oldStatusId = current.rows[0].status_id as string | null;
      const oldStatusName = current.rows[0].status_name as string | null;
      const statusInfo = body.status ? await getProjectStatusInfo(client, body.status) : null;
      const statusId = statusInfo?.id ?? null;
      const statusName = statusInfo?.name ?? null;`);

content = content.replace(
`      if (oldStatusId && statusId && oldStatusId !== statusId) {
        await client.query(
          \`INSERT INTO project_status_history (
             project_id, old_status, new_status, old_status_id, new_status_id, changed_by
           ) VALUES ($1, $2, $3, $4, $5, $6)\`,
          [id, oldStatusCode, body.status, oldStatusId, statusId, req.admin?.id ?? null],
        );
      }`,
`      if (oldStatusId && statusId && oldStatusId !== statusId) {
        await client.query(
          \`INSERT INTO project_status_history (
             project_id, old_status, new_status, changed_by
           ) VALUES ($1, $2, $3, $4)\`,
          [id, oldStatusName, statusName, req.admin?.id ?? null],
        );
      }`);

fs.writeFileSync('src/routes/admin.ts', content, 'utf8');
console.log('Successfully patched admin.ts');
