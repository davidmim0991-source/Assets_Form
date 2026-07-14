import multer from 'multer';
import os from 'os';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config/env';

/**
 * Multer configuration for secure uploads.
 * - Files are staged on disk (not RAM) so large uploads don't exhaust memory.
 * - Temp files get random names; the original name is only used (sanitized)
 *   when the file is sent to Google Drive.
 * - Per-file size limit enforced (default 500MB).
 * - Executable/script uploads are rejected.
 */

const TEMP_DIR = path.join(os.tmpdir(), 'onboarding-uploads');
fs.mkdirSync(TEMP_DIR, { recursive: true });

const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.msi', '.bat', '.cmd', '.com', '.scr', '.ps1', '.sh', '.js', '.mjs',
  '.jar', '.vbs', '.dll', '.app', '.apk', '.php', '.py', '.rb', '.pl',
]);

const storage = multer.diskStorage({
  destination: TEMP_DIR,
  filename: (_req, _file, cb) => {
    cb(null, crypto.randomBytes(16).toString('hex'));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxUploadMb * 1024 * 1024,
    files: 100,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (BLOCKED_EXTENSIONS.has(ext)) {
      cb(new Error(`File type "${ext}" is not allowed`));
      return;
    }
    cb(null, true);
  },
});

/** Upload fields accepted by the submission endpoint, mapped to Drive folders. */
export const submissionUpload = upload.fields([
  { name: 'logo', maxCount: 10 },
  { name: 'testimonials', maxCount: 30 },
  { name: 'images', maxCount: 50 },
  { name: 'videos', maxCount: 15 },
  { name: 'documents', maxCount: 30 },
]);

/** Flattens multer's field map into a single array of files. */
export function collectFiles(req: {
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}): Express.Multer.File[] {
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  return Object.values(req.files).flat();
}
