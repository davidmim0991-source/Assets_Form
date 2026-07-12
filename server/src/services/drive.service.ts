import fs from 'fs';
import { drive } from './googleAuth';
import { withRetry } from '../utils/retry';

/**
 * Google Drive service - all raw Drive operations live here.
 * Every call is wrapped in withRetry so transient failures are retried
 * automatically with exponential backoff.
 * `supportsAllDrives` is always sent so the service works with both
 * regular "My Drive" folders and Shared Drives.
 */

const DRIVE_FLAGS = { supportsAllDrives: true } as const;

/** Escapes a value for use inside a Drive query string. */
function escapeQuery(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export async function createFolder(name: string, parentId: string): Promise<string> {
  const res = await withRetry(
    () =>
      drive.files.create({
        ...DRIVE_FLAGS,
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        },
        fields: 'id',
      }),
    { label: `create folder "${name}"` }
  );
  return res.data.id!;
}

/** Finds a non-trashed file by exact name inside a parent folder. */
export async function findFileByName(
  name: string,
  parentId: string
): Promise<{ id: string } | null> {
  const res = await withRetry(
    () =>
      drive.files.list({
        ...DRIVE_FLAGS,
        includeItemsFromAllDrives: true,
        q: `name = '${escapeQuery(name)}' and '${escapeQuery(parentId)}' in parents and trashed = false`,
        fields: 'files(id, name)',
        pageSize: 1,
      }),
    { label: `find file "${name}"` }
  );
  const file = res.data.files?.[0];
  return file?.id ? { id: file.id } : null;
}

/** Uploads a file from local disk (multer temp file) into a Drive folder. */
export async function uploadFileFromDisk(
  localPath: string,
  filename: string,
  mimeType: string,
  parentId: string
): Promise<string> {
  const res = await withRetry(
    () =>
      drive.files.create({
        ...DRIVE_FLAGS,
        requestBody: { name: filename, parents: [parentId] },
        media: {
          mimeType: mimeType || 'application/octet-stream',
          // A fresh stream must be created per attempt - a consumed stream cannot be retried.
          body: fs.createReadStream(localPath),
        },
        fields: 'id',
      }),
    { label: `upload "${filename}"` }
  );
  return res.data.id!;
}

/** Creates a JSON file in Drive from a plain object (pretty-printed). */
export async function createJsonFile(
  name: string,
  parentId: string,
  data: unknown
): Promise<string> {
  const res = await withRetry(
    () =>
      drive.files.create({
        ...DRIVE_FLAGS,
        requestBody: { name, parents: [parentId], mimeType: 'application/json' },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(data, null, 2),
        },
        fields: 'id',
      }),
    { label: `create JSON "${name}"` }
  );
  return res.data.id!;
}

/** Overwrites the content of an existing Drive file with new JSON. */
export async function updateJsonFile(fileId: string, data: unknown): Promise<void> {
  await withRetry(
    () =>
      drive.files.update({
        ...DRIVE_FLAGS,
        fileId,
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(data, null, 2),
        },
      }),
    { label: `update JSON file ${fileId}` }
  );
}

/** Downloads and parses a JSON file stored in Drive. */
export async function readJsonFile<T>(fileId: string): Promise<T> {
  const res = await withRetry(
    () => drive.files.get({ ...DRIVE_FLAGS, fileId, alt: 'media' }, { responseType: 'text' }),
    { label: `read JSON file ${fileId}` }
  );
  return JSON.parse(res.data as unknown as string) as T;
}

/** Creates an empty Google Doc inside a folder and returns its document id. */
export async function createGoogleDoc(name: string, parentId: string): Promise<string> {
  const res = await withRetry(
    () =>
      drive.files.create({
        ...DRIVE_FLAGS,
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.document',
          parents: [parentId],
        },
        fields: 'id',
      }),
    { label: `create Google Doc "${name}"` }
  );
  return res.data.id!;
}

export function folderWebLink(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}
