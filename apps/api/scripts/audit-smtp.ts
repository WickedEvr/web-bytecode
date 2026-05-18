import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(apiRoot, '../..');

// Load environment variables
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(apiRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local'), override: true });
dotenv.config({ path: path.join(apiRoot, '.env.local'), override: true });

console.log('=== AUDITORIA DE ENTORNO SMTP ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST || '(No definido)');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '(No definido)');
console.log('SMTP_SECURE:', process.env.SMTP_SECURE || '(No definido)');
console.log('SMTP_USER:', process.env.SMTP_USER || '(No definido)');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : '(No definido)');
console.log('=================================\n');

const createTransporter = (port: number, secure: boolean) => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtppro.zoho.com',
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000,
  });
};

async function runAudit() {
  console.log('--- INICIANDO PRUEBA A: Puerto 465 (SSL Implícito) ---');
  const transporterA = createTransporter(465, true);
  try {
    await transporterA.verify();
    console.log('✅ PRUEBA A EXITOSA: Conexión SSL en puerto 465 establecida correctamente.\n');
  } catch (error: any) {
    console.error('❌ PRUEBA A FALLIDA:');
    console.error(`Código de error: ${error.code}`);
    console.error(`Mensaje: ${error.message}\n`);
  }

  console.log('--- INICIANDO PRUEBA B: Puerto 587 (STARTTLS Explícito) ---');
  const transporterB = createTransporter(587, false);
  try {
    await transporterB.verify();
    console.log('✅ PRUEBA B EXITOSA: Conexión STARTTLS en puerto 587 establecida correctamente.\n');
  } catch (error: any) {
    console.error('❌ PRUEBA B FALLIDA:');
    console.error(`Código de error: ${error.code}`);
    console.error(`Mensaje: ${error.message}\n`);
  }
}

runAudit().catch(console.error);
