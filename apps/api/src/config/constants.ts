export const COOKIE_NAME = 'bc_admin';
const sameSiteEnv = process.env.COOKIE_SAME_SITE;
export const COOKIE_SAME_SITE = (sameSiteEnv === 'lax' || sameSiteEnv === 'strict' || sameSiteEnv === 'none')
  ? sameSiteEnv
  : (process.env.NODE_ENV === 'production' ? 'none' : 'lax');
export const COOKIE_SECURE = process.env.NODE_ENV === 'production';
export const MAX_UPLOAD_MB = 10;
export const CLOUDINARY_UPLOAD_FOLDER = 'complaints-attachments';
