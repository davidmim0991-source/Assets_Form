import path from 'path';

/**
 * Sanitizes an uploaded filename before sending it to Google Drive.
 * - Strips directory components (defeats path traversal attempts).
 * - Removes control characters and characters that are problematic in Drive/OS.
 * - Preserves Hebrew, Latin letters, digits, spaces, dots, dashes, underscores.
 * - Caps the length while keeping the file extension.
 */
export function sanitizeFilename(original: string): string {
  const base = path.basename(original || 'file');
  const ext = path.extname(base).slice(0, 12);
  const name = base.slice(0, base.length - ext.length);

  const clean = (s: string) =>
    s
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x7f]/g, '')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  let cleanName = clean(name);
  const cleanExt = clean(ext);
  if (cleanName === '') cleanName = 'file';
  if (cleanName.length > 150) cleanName = cleanName.slice(0, 150);

  return `${cleanName}${cleanExt}`;
}

/**
 * Sanitizes a business name for use inside a Drive folder name,
 * e.g. "0001 - David's Pizza".
 */
export function sanitizeFolderName(businessName: string): string {
  const clean = businessName
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (clean === '' ? 'Client' : clean).slice(0, 120);
}
