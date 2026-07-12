import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { FormValues } from '../types';
import Field from './Field';

interface Props {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

/** Step 1 - פרטי העסק: business name, email, phone. */
export default function StepBusinessDetails({ register, errors }: Props) {
  return (
    <div className="space-y-5">
      <Field label="שם העסק" htmlFor="businessName" error={errors.businessName?.message}>
        <input
          id="businessName"
          type="text"
          placeholder="לדוגמה: הפיצה של דוד"
          className={`input-field ${errors.businessName ? 'input-field-error' : ''}`}
          {...register('businessName', {
            required: 'נשמח לדעת איך קוראים לעסק שלך 😊',
            minLength: { value: 2, message: 'שם העסק קצר מדי' },
          })}
        />
      </Field>

      <Field label="אימייל" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          dir="ltr"
          placeholder="name@example.com"
          className={`input-field text-left ${errors.email ? 'input-field-error' : ''}`}
          {...register('email', {
            required: 'צריך אימייל כדי שנוכל לעדכן אותך',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
              message: 'כתובת האימייל לא נראית תקינה, שווה לבדוק שוב',
            },
          })}
        />
      </Field>

      <Field label="טלפון" htmlFor="phone" error={errors.phone?.message}>
        <input
          id="phone"
          type="tel"
          dir="ltr"
          placeholder="050-1234567"
          className={`input-field text-left ${errors.phone ? 'input-field-error' : ''}`}
          {...register('phone', {
            required: 'צריך מספר טלפון ליצירת קשר',
            pattern: {
              value: /^[0-9+()\-\s]{8,20}$/,
              message: 'מספר הטלפון לא נראה תקין, שווה לבדוק שוב',
            },
          })}
        />
      </Field>
    </div>
  );
}
