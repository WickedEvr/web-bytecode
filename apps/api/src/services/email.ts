import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';

// 1. DEFINICIÓN DE MÓDULOS Y REMITENTES DINÁMICOS
export type EmailModuleType = 'complaint' | 'quote' | 'contact' | 'system';

export const getSenderConfig = (moduleType: EmailModuleType) => {
  switch (moduleType) {
    case 'complaint':
      return '"Libro de Reclamaciones - Bytecode" <reclamos@bytecode.com.pe>';
    case 'quote':
      return '"Ventas Bytecode" <cotizaciones@bytecode.com.pe>';
    case 'contact':
      return '"Contacto Bytecode" <contacto@bytecode.com.pe>';
    case 'system':
    default:
      return '"Sistema Bytecode" <no-reply@bytecode.com.pe>';
  }
};

const isEmailEnabled = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = isEmailEnabled
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  : null;

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const rowsToHtml = (payload: Record<string, unknown>) =>
  Object.entries(payload)
    .map(([key, value]) => `<tr><td><strong>${escapeHtml(key)}</strong></td><td>${escapeHtml(value)}</td></tr>`)
    .join('');

const wait = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export async function verifyEmailTransport() {
  if (!transporter) return { enabled: false, ok: true };

  try {
    await transporter.verify();
    return { enabled: true, ok: true };
  } catch (error) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      subsystem: 'smtp',
      message: error instanceof Error ? error.message : 'SMTP verification failed.',
    }));
    return { enabled: true, ok: false };
  }
}

export async function getAdminNotificationEmails(roles: string[]): Promise<string[]> {
  const result = await pool.query(
    `
    SELECT DISTINCT u.email 
    FROM admin_users u
    JOIN admin_user_roles aur ON u.id = aur.admin_user_id
    JOIN roles r ON aur.role_id = r.id
    WHERE u.is_active = true 
    AND r.code = ANY($1)
    `,
    [roles]
  );
  return result.rows.map((row) => row.email);
}

// 2. ACTUALIZACIÓN: NOTIFICACIONES INTERNAS (Usa el alias 'system')
export async function notifyAdmins(subject: string, payload: Record<string, unknown>, roles: string[] = ['super_admin', 'support_agent']) {
  if (!transporter) {
    console.log(`Email skipped: ${subject}`);
    return;
  }

  const to = await getAdminNotificationEmails(roles);
  if (to.length === 0) {
    console.log(`Email skipped (no active admins found for roles: ${roles.join(', ')}): ${subject}`);
    return;
  }

  const message = {
    from: getSenderConfig('system'), // <-- Aquí aplicamos el remitente dinámico interno
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h2>${escapeHtml(subject)}</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          ${rowsToHtml(payload)}
        </table>
        <p style="margin-top: 24px;">Panel admin: ${escapeHtml(env.publicApiUrl)}</p>
      </div>
    `,
  };

  let lastError: unknown;
  // ... lógica de envío con retries intacta ...
  for (let attempt = 0; attempt <= (env.smtp.maxRetries || 3); attempt += 1) {
    try {
      await transporter.sendMail(message);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < (env.smtp.maxRetries || 3)) {
        await wait(500 * (attempt + 1));
      }
    }
  }

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    subsystem: 'smtp',
    subject,
    message: lastError instanceof Error ? lastError.message : 'SMTP send failed.',
  }));
}

// 3. NUEVA FUNCIÓN: NOTIFICACIONES A CLIENTES (Lista para usar los alias de Zoho)
export async function notifyCustomer(toEmail: string, subject: string, htmlBody: string, moduleType: EmailModuleType) {
  if (!transporter) {
    console.log(`Customer email skipped: ${subject} to ${toEmail}`);
    return;
  }

  const message = {
    from: getSenderConfig(moduleType), // <-- Aquí aplicamos el remitente dinámico según el contexto (Ej. 'complaint')
    to: toEmail,
    subject,
    html: htmlBody,
  };

  let lastError: unknown;
  for (let attempt = 0; attempt <= (env.smtp.maxRetries || 3); attempt += 1) {
    try {
      await transporter.sendMail(message);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < (env.smtp.maxRetries || 3)) {
        await wait(500 * (attempt + 1));
      }
    }
  }

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    subsystem: 'smtp',
    subject,
    message: lastError instanceof Error ? lastError.message : 'SMTP customer send failed.',
  }));
}