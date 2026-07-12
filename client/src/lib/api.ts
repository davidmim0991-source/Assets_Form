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

  const res = await axios.post<SubmissionResponse>(`${API_BASE}/api/submissions`, formData, {
    // Long timeout - video uploads over slow connections can take a while.
    timeout: 30 * 60 * 1000,
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return res.data;
}

/** Extracts a human-friendly Hebrew error message from a failed request. */
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const serverMessage = (err.response?.data as { error?: string } | undefined)?.error;
    if (err.response?.status === 413) {
      return 'אחד הקבצים גדול מדי (מקסימום 100MB לקובץ)';
    }
    if (serverMessage) return serverMessage;
    if (err.code === 'ERR_NETWORK') {
      return 'בעיית תקשורת - בדקו את חיבור האינטרנט ונסו שוב';
    }
  }
  return 'אירעה שגיאה בשליחה. נסו שוב בעוד רגע.';
}
