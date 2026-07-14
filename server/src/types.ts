/** A color palette the client selected from the palette picker. */
export interface SelectedPalette {
  id: string;
  colors: string[];
}

/** Data submitted by the client through the onboarding form. */
export interface SubmissionData {
  businessName: string;
  email: string;
  phone: string;
  portfolioLink?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  brandColors?: string;
  fonts?: string;
  domain?: string;
  existingWebsite?: string;
  testimonialsText?: string;
  notes?: string;
  /** Free-text where the client tells about themselves and their business. */
  aboutBusiness?: string;
  /** 3-5 color palettes the client liked most. */
  selectedPalettes: SelectedPalette[];
  /** Website page types the client requested. */
  selectedPageTypes: string[];
  /** Selected design style id (one of 12). */
  designStyleId?: string;
  /** Full design style text, word-for-word from the canonical list. */
  designStyleText?: string;
}

/** Upload field names accepted by the API, mapped to Drive subfolders. */
export type UploadCategory = 'logo' | 'testimonials' | 'images' | 'videos' | 'documents';

export const SUBFOLDER_NAMES = [
  'Client Information',
  'JSON Data',
  'Logos',
  'Images',
  'Videos',
  'Documents',
  'Testimonials',
  'Brand Assets',
] as const;

export type SubfolderName = (typeof SUBFOLDER_NAMES)[number];

export const CATEGORY_TO_FOLDER: Record<UploadCategory, SubfolderName> = {
  logo: 'Logos',
  testimonials: 'Testimonials',
  images: 'Images',
  videos: 'Videos',
  documents: 'Documents',
};

/** Result returned to the frontend after a successful submission. */
export interface SubmissionResult {
  clientNumber: string;
  folderName: string;
  folderLink: string;
  uploadedFiles: number;
}
