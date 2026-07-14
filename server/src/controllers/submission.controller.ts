import { NextFunction, Request, Response } from 'express';
import { SelectedPalette, SubmissionData } from '../types';
import { processSubmission } from '../services/submission.service';
import { collectFiles } from '../middleware/upload.middleware';
import { HttpError } from '../middleware/error.middleware';

/**
 * Submission controller - validates input, delegates to the submission
 * service, and shapes the HTTP response.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[0-9+()\-\s]{8,20}$/;
const VALID_PAGE_TYPES = new Set(['homepage', 'about', 'contact', 'faq', 'privacy', 'landing']);
const MAX_TEXT_LENGTH = 5000;

/** Parses and validates the JSON payload sent alongside the files. */
function parseSubmissionData(raw: unknown): SubmissionData {
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new HttpError(400, 'Missing form data');
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Form data is not valid JSON');
  }

  const text = (key: string): string => {
    const v = parsed[key];
    return typeof v === 'string' ? v.trim().slice(0, MAX_TEXT_LENGTH) : '';
  };

  /** Validates the selected palettes: well-formed hex colors, max 5 palettes. */
  const palettes = (): SelectedPalette[] => {
    const raw = parsed.selectedPalettes;
    if (!Array.isArray(raw)) return [];
    const HEX = /^#[0-9a-f]{6}$/i;
    return raw
      .slice(0, 5)
      .map((p): SelectedPalette | null => {
        const id = typeof p?.id === 'string' ? p.id.slice(0, 50) : '';
        const colors = Array.isArray(p?.colors)
          ? p.colors.filter((c: unknown): c is string => typeof c === 'string' && HEX.test(c))
          : [];
        return id && colors.length > 0 ? { id, colors } : null;
      })
      .filter((p): p is SelectedPalette => p !== null);
  };

  const pageTypes = (): string[] => {
    const raw = parsed.selectedPageTypes;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((p): p is string => typeof p === 'string' && VALID_PAGE_TYPES.has(p))
      .slice(0, 20);
  };

  const data: SubmissionData = {
    businessName: text('businessName'),
    email: text('email'),
    phone: text('phone'),
    portfolioLink: text('portfolioLink'),
    instagram: text('instagram'),
    facebook: text('facebook'),
    tiktok: text('tiktok'),
    brandColors: text('brandColors'),
    fonts: text('fonts'),
    domain: text('domain'),
    existingWebsite: text('existingWebsite'),
    testimonialsText: text('testimonialsText'),
    notes: text('notes'),
    aboutBusiness: text('aboutBusiness'),
    selectedPalettes: palettes(),
    selectedPageTypes: pageTypes(),
  };

  if (data.businessName === '') throw new HttpError(400, 'Business name is required');
  if (!EMAIL_REGEX.test(data.email)) throw new HttpError(400, 'Invalid email address');
  if (!PHONE_REGEX.test(data.phone)) throw new HttpError(400, 'Invalid phone number');

  return data;
}

export async function handleSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const data = parseSubmissionData(req.body?.data);
    const files = collectFiles(req);

    console.log(
      `[submission] "${data.businessName}" - ${files.length} file(s), processing...`
    );

    const result = await processSubmission(data, files);

    console.log(`[submission] Done: ${result.folderName} (${result.uploadedFiles} files)`);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
