import { pool } from '../db/pool.js';

export async function getSmtpConfig() {
  const res = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = $1', ['smtp_config']);
  const dbConfig = res.rows[0]?.setting_value;
  return {
    host: dbConfig?.host,
    port: dbConfig?.port || 587,
    secure: dbConfig?.secure ?? false,
    user: dbConfig?.user,
    pass: dbConfig?.pass,
  };
}

export async function getCloudinaryConfig() {
  const res = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = $1', ['cloudinary_config']);
  const dbConfig = res.rows[0]?.setting_value;
  return {
    cloudName: dbConfig?.cloud_name,
    apiKey: dbConfig?.api_key,
    apiSecret: dbConfig?.api_secret,
  };
}
