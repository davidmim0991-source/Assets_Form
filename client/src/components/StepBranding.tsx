import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { FormValues } from '../types';
import Field from './Field';

interface Props {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

/** Step 4 - מיתוג: socials, brand colors, fonts, domain, site, free text. */
export default function StepBranding({ register, errors }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="אינסטגרם" htmlFor="instagram" optional>
          <input
            id="instagram"
            type="text"
            dir="ltr"
            placeholder="@username או קישור"
            className="input-field text-left"
            {...register('instagram')}
          />
        </Field>

        <Field label="פייסבוק" htmlFor="facebook" optional>
          <input
            id="facebook"
            type="text"
            dir="ltr"
            placeholder="קישור לעמוד"
            className="input-field text-left"
            {...register('facebook')}
          />
        </Field>

        <Field label="טיקטוק" htmlFor="tiktok" optional>
          <input
            id="tiktok"
            type="text"
            dir="ltr"
            placeholder="@username או קישור"
            className="input-field text-left"
            {...register('tiktok')}
          />
        </Field>
      </div>

      <Field label="צבעי המותג" htmlFor="brandColors" optional>
        <input
          id="brandColors"
          type="text"
          placeholder="לדוגמה: כחול כהה, זהב (#1a2b4c, #d4af37)"
          className="input-field"
          {...register('brandColors')}
        />
      </Field>

      <Field label="פונטים" htmlFor="fonts" optional>
        <input
          id="fonts"
          type="text"
          placeholder="אם יש פונט מועדף - כתבו אותו כאן"
          className="input-field"
          {...register('fonts')}
        />
      </Field>

      <Field label="אתר קיים" htmlFor="existingWebsite" optional error={errors.existingWebsite?.message}>
        <input
          id="existingWebsite"
          type="url"
          dir="ltr"
          placeholder="https://..."
          className={`input-field text-left ${errors.existingWebsite ? 'input-field-error' : ''}`}
          {...register('existingWebsite', {
            pattern: {
              value: /^https?:\/\/.+/i,
              message: 'הקישור צריך להתחיל ב־http או https',
            },
          })}
        />
      </Field>

      <Field label="הערות נוספות" htmlFor="notes" optional>
        <textarea
          id="notes"
          rows={4}
          placeholder="כל דבר נוסף שחשוב שנדע על העסק, סגנון שאהבתם, אתרים לדוגמה..."
          className="input-field resize-y"
          {...register('notes')}
        />
      </Field>

      <Field label="ספרו לי עליכם 😊" htmlFor="aboutBusiness" optional>
        <textarea
          id="aboutBusiness"
          rows={5}
          placeholder="כאן המקום לכתוב בחופשיות - מי אתם, מה הסיפור של העסק, מה מיוחד בכם, ומה חשוב לכם שהאתר ישדר..."
          className="input-field resize-y"
          {...register('aboutBusiness')}
        />
      </Field>
    </div>
  );
}
