import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { FormValues, UploadedFiles, UploadCategory } from '../types';
import Field from './Field';
import FileDropzone from './FileDropzone';

interface Props {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  files: UploadedFiles;
  onFilesChange: (category: UploadCategory, files: File[]) => void;
}

const icon = (path: string) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

/** Step 2 - העלאת חומרים: logo, portfolio link, testimonials, images, videos, documents. */
export default function StepUploads({ register, errors, files, onFilesChange }: Props) {
  return (
    <div className="space-y-6">
      <FileDropzone
        label="לוגו"
        hint="גררו את קובצי הלוגו לכאן (רצוי PNG/SVG באיכות גבוהה)"
        accept="image/*,.svg,.pdf,.ai,.eps"
        files={files.logo}
        onChange={(f) => onFilesChange('logo', f)}
        icon={icon('M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42')}
      />

      <Field
        label="קישור לתיק עבודות (Google Drive)"
        htmlFor="portfolioLink"
        optional
        error={errors.portfolioLink?.message}
      >
        <input
          id="portfolioLink"
          type="url"
          dir="ltr"
          placeholder="https://drive.google.com/..."
          className={`input-field text-left ${errors.portfolioLink ? 'input-field-error' : ''}`}
          {...register('portfolioLink', {
            pattern: {
              value: /^https?:\/\/.+/i,
              message: 'הקישור צריך להתחיל ב־http או https',
            },
          })}
        />
      </Field>

      <FileDropzone
        label="תמונות"
        hint="תמונות של העסק, המוצרים או השירותים"
        accept="image/*"
        files={files.images}
        onChange={(f) => onFilesChange('images', f)}
        icon={icon('M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z')}
      />

      <FileDropzone
        label="סרטונים"
        hint="סרטונים של העסק (עד 100MB לקובץ)"
        accept="video/*"
        files={files.videos}
        onChange={(f) => onFilesChange('videos', f)}
        icon={icon('M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z')}
      />

      <FileDropzone
        label="מסמכים"
        hint="קבצי PDF, תפריטים, מחירונים וכל מסמך רלוונטי"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        files={files.documents}
        onChange={(f) => onFilesChange('documents', f)}
        icon={icon('M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z')}
      />

      <FileDropzone
        label="המלצות"
        hint="צילומי מסך של המלצות מלקוחות (וואטסאפ, גוגל וכו')"
        files={files.testimonials}
        onChange={(f) => onFilesChange('testimonials', f)}
        icon={icon('M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z')}
      />

      <Field label="או כתבו המלצות כאן" htmlFor="testimonialsText" optional>
        <textarea
          id="testimonialsText"
          rows={3}
          placeholder="אפשר להדביק כאן המלצות בטקסט חופשי..."
          className="input-field resize-y"
          {...register('testimonialsText')}
        />
      </Field>
    </div>
  );
}
