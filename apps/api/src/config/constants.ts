export const COOKIE_NAME = 'bc_admin';
export const COOKIE_SAME_SITE = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
export const COOKIE_SECURE = process.env.NODE_ENV === 'production';
export const MAX_UPLOAD_MB = 10;
export const CLOUDINARY_UPLOAD_FOLDER = 'complaints-attachments';
