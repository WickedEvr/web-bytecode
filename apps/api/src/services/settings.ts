import { pool } from '../db/pool.js';
import { env } from '../config/env.js';

export async function getSmtpConfig() {
  const res = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = $1', ['smtp_config']);
  const dbConfig = res.rows[0]?.setting_value;
  return {
    host: dbConfig?.host || env.smtp.host,
    port: dbConfig?.port || env.smtp.port,
    secure: dbConfig?.secure ?? env.smtp.secure,
    user: dbConfig?.user || env.smtp.user,
    pass: dbConfig?.pass || env.smtp.pass,
  };
}

export async function getCloudinaryConfig() {
  const res = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = $1', ['cloudinary_config']);
  const dbConfig = res.rows[0]?.setting_value;
  return {
    cloudName: dbConfig?.cloud_name || env.cloudinary.cloudName,
    apiKey: dbConfig?.api_key || env.cloudinary.apiKey,
    apiSecret: dbConfig?.api_secret || env.cloudinary.apiSecret,
  };
}
