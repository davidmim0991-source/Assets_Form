/** All text fields collected by the three-step form. */
export interface FormValues {
  // Step 1 - פרטי העסק
  businessName: string;
  email: string;
  phone: string;
  // Step 2 - העלאת חומרים
  portfolioLink: string;
  testimonialsText: string;
  // Step 3 - מיתוג
  instagram: string;
  facebook: string;
  tiktok: string;
  brandColors: string;
  fonts: string;
  domain: string;
  existingWebsite: string;
  notes: string;
  aboutBusiness: string;
}

export const EMPTY_FORM: FormValues = {
  businessName: '',
  email: '',
  phone: '',
  portfolioLink: '',
  testimonialsText: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  brandColors: '',
  fonts: '',
  domain: '',
  existingWebsite: '',
  notes: '',
  aboutBusiness: '',
};

/** A color palette offered by the server (parsed from the palettes Google Doc). */
export interface Palette {
  id: string;
  colorNames: string[];
  colors: string[];
}

/** Upload categories - field names must match the backend's multer fields. */
export type UploadCategory = 'logo' | 'testimonials' | 'images' | 'videos' | 'documents';

export type UploadedFiles = Record<UploadCategory, File[]>;

export const EMPTY_FILES: UploadedFiles = {
  logo: [],
  testimonials: [],
  images: [],
  videos: [],
  documents: [],
};
