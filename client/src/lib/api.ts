import axios from 'axios';
import type { FormValues, Palette, UploadedFiles } from '../types';

/**
 * API client. In development the Vite proxy forwards /api to the Express
 * server; in production set VITE_API_URL to the deployed backend URL.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export interface SubmissionResponse {
  success: boolean;
  clientNumber: string;
  folderName: string;
  folderLink: string;
  uploadedFiles: number;
}

/** Coerces any value into a safe string for React rendering. */
export function toDisplayError(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Error) return value.message || value.name;

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    if (typeof obj.message === 'string' && obj.message) return obj.message;
    if (typeof obj.error === 'string' && obj.error) return obj.error;

    if (obj.error != null && typeof obj.error === 'object') {
      const nested = toDisplayError(obj.error);
      if (nested) return nested;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }

  return String(value);
}

/** Fetches the selectable color palettes; returns [] if unavailable. */
export async function fetchPalettes(): Promise<Palette[]> {
  try {
    const res = await axios.get<{ palettes: Palette[] }>(`${API_BASE}/api/palettes`, {
      timeout: 15000,
    });
    return res.data.palettes;
  } catch {
    // The palette picker is optional - the form still works without it.
    return [];
  }
}

export async function submitOnboarding(
  values: FormValues,
  files: UploadedFiles,
  selectedPalettes: Palette[],
  onProgress: (percent: number) => void
): Promise<SubmissionResponse> {
  const formData = new FormData();
  formData.append(
    'data',
    JSON.stringify({
      ...values,
      selectedPalettes: selectedPalettes.map((p) => ({ id: p.id, colors: p.colors })),
    })
  );

  (Object.keys(files) as Array<keyof UploadedFiles>).forEach((category) => {
    files[category].forEach((file) => formData.append(category, file, file.name));
  });

  try {
    const res = await axios.post<SubmissionResponse>(`${API_BASE}/api/submissions`, formData, {
      // Long timeout - video uploads over slow connections can take a while.
      timeout: 30 * 60 * 1000,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });

    if (res.data && res.data.success === false) {
      throw new Error(toDisplayError(res.data) || 'Submission failed');
    }

    return res.data;
  } catch (err) {
    // Re-throw with a guaranteed string message so callers never render raw objects.
    if (axios.isAxiosError(err)) throw err;
    throw new Error(extractErrorMessage(err));
  }
}

/** Extracts a human-friendly Hebrew error message from a failed request. */
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 413) {
      return 'אחד הקבצים גדול מדי (מקסימום 100MB לקובץ)';
    }

    const data = err.response?.data;

    if (data != null) {
      if (typeof data === 'string') {
        const trimmed = data.trim();
        if (trimmed.startsWith('<')) {
          return `שגיאת שרת (${err.response?.status ?? 'לא ידוע'})`;
        }
        return trimmed.slice(0, 500);
      }

      const fromBody = toDisplayError(data);
      if (fromBody) return fromBody;
    }

    if (err.code === 'ERR_NETWORK') {
      return 'בעיית תקשורת - בדקו את חיבור האינטרנט ונסו שוב';
    }

    if (err.message) return err.message;
  }

  if (err instanceof Error && err.message) return err.message;

  const fallback = toDisplayError(err);
  return fallback || 'אירעה שגיאה בשליחה. נסו שוב בעוד רגע.';
}
