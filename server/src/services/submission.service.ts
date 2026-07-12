import fs from 'fs/promises';
import { config } from '../config/env';
import {
  CATEGORY_TO_FOLDER,
  SUBFOLDER_NAMES,
  SubfolderName,
  SubmissionData,
  SubmissionResult,
  UploadCategory,
} from '../types';
import { formatClientNumber, getNextClientNumber } from './counter.service';
import { createFolder, createJsonFile, folderWebLink, uploadFileFromDisk } from './drive.service';
import { createClientInformationDoc } from './docs.service';
import { sanitizeFilename, sanitizeFolderName } from '../utils/sanitize';

/**
 * Submission orchestrator - the heart of the backend.
 *
 * For each submission it:
 *  1. Atomically assigns the next client number (e.g. 0001, 0002...).
 *  2. Creates "<number> - <Business Name>" in the root Drive folder.
 *  3. Creates the full subfolder structure.
 *  4. Routes every uploaded file into the correct subfolder.
 *  5. Writes client.json (the source of truth for the AI Website Builder).
 *  6. Creates the formatted "Client Information" Google Doc.
 */

/** Fallback routing by MIME type for files whose category is unknown. */
function folderForMimeType(mimeType: string): SubfolderName {
  if (mimeType.startsWith('image/')) return 'Images';
  if (mimeType.startsWith('video/')) return 'Videos';
  return 'Documents';
}

function resolveTargetFolder(fieldname: string, mimeType: string): SubfolderName {
  const byCategory = CATEGORY_TO_FOLDER[fieldname as UploadCategory];
  return byCategory ?? folderForMimeType(mimeType);
}

export async function processSubmission(
  data: SubmissionData,
  files: Express.Multer.File[]
): Promise<SubmissionResult> {
  // 1. Assign a unique, strictly increasing client number.
  const numericId = await getNextClientNumber();
  const clientNumber = formatClientNumber(numericId);
  const folderName = `${clientNumber} - ${sanitizeFolderName(data.businessName)}`;

  // 2. Create the main client folder.
  const clientFolderId = await createFolder(folderName, config.driveRootFolderId);

  // 3. Create all subfolders in parallel.
  const subfolderIds = new Map<SubfolderName, string>();
  await Promise.all(
    SUBFOLDER_NAMES.map(async (name) => {
      subfolderIds.set(name, await createFolder(name, clientFolderId));
    })
  );

  // 4. Upload files into their category folders.
  //    Uploads run sequentially to keep memory flat and avoid rate limits;
  //    each individual upload already retries on transient failures.
  const uploadedManifest: Array<{ folder: SubfolderName; filename: string; driveFileId: string }> =
    [];
  try {
    for (const file of files) {
      const target = resolveTargetFolder(file.fieldname, file.mimetype);
      const cleanName = sanitizeFilename(file.originalname);
      const driveFileId = await uploadFileFromDisk(
        file.path,
        cleanName,
        file.mimetype,
        subfolderIds.get(target)!
      );
      uploadedManifest.push({ folder: target, filename: cleanName, driveFileId });
    }
  } finally {
    // Always remove multer temp files, even if an upload ultimately failed.
    await Promise.allSettled(files.map((f) => fs.unlink(f.path)));
  }

  const submissionDate = new Date().toISOString();
  const infoFolderId = subfolderIds.get('Client Information')!;

  // 5. client.json - complete machine-readable record (source of truth).
  const clientJson = {
    clientNumber,
    folderName,
    submissionDate,
    business: {
      name: data.businessName,
      email: data.email,
      phone: data.phone,
    },
    social: {
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      tiktok: data.tiktok || null,
    },
    branding: {
      brandColors: data.brandColors || null,
      selectedPalettes: data.selectedPalettes,
      fonts: data.fonts || null,
    },
    web: {
      domain: data.domain || null,
      existingWebsite: data.existingWebsite || null,
      portfolioLink: data.portfolioLink || null,
    },
    testimonialsText: data.testimonialsText || null,
    aboutBusiness: data.aboutBusiness || null,
    additionalNotes: data.notes || null,
    uploadedFiles: uploadedManifest,
    drive: {
      clientFolderId,
      clientFolderLink: folderWebLink(clientFolderId),
      subfolders: Object.fromEntries(subfolderIds),
    },
  };
  await createJsonFile('client.json', infoFolderId, clientJson);

  // 6. Formatted Google Doc for humans.
  await createClientInformationDoc(infoFolderId, data, clientNumber, submissionDate);

  return {
    clientNumber,
    folderName,
    folderLink: folderWebLink(clientFolderId),
    uploadedFiles: uploadedManifest.length,
  };
}
