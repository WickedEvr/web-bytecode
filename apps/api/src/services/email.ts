import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const isEmailEnabled = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass && env.notificationEmails.length);

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

export async function notifyAdmins(subject: string, payload: Record<string, unknown>) {
  if (!transporter) {
    console.log(`Email skipped: ${subject}`);
    return;
  }

  const message = {
    from: env.smtp.from,
    to: env.notificationEmails,
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
  for (let attempt = 0; attempt <= env.smtp.maxRetries; attempt += 1) {
    try {
      await transporter.sendMail(message);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < env.smtp.maxRetries) {
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
