import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import type { FormValues, Palette, UploadCategory, UploadedFiles } from './types';
import { EMPTY_FILES } from './types';
import { loadDraft, clearDraft, useAutosave } from './hooks/useAutosave';
import { submitOnboarding, extractErrorMessage } from './lib/api';
import ProgressBar from './components/ProgressBar';
import StepBusinessDetails from './components/StepBusinessDetails';
import StepUploads from './components/StepUploads';
import StepPalettes from './components/StepPalettes';
import StepBranding from './components/StepBranding';
import SuccessScreen from './components/SuccessScreen';

/** Fields validated before leaving each step (the palette step has none). */
const STEP_FIELDS: Array<Array<keyof FormValues>> = [
  ['businessName', 'email', 'phone'],
  ['portfolioLink'],
  [],
  ['existingWebsite'],
];

const TOTAL_STEPS = 4;

export default function App() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [files, setFiles] = useState<UploadedFiles>(EMPTY_FILES);
  const [selectedPalettes, setSelectedPalettes] = useState<Palette[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  // Set when the user reaches the last step; used to ignore accidental
  // submissions (e.g. a double-click carried over from the "המשך" button).
  const reachedLastStepAt = useRef(0);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: loadDraft(),
    mode: 'onTouched',
  });

  const justSaved = useAutosave(watch);

  const handleFilesChange = (category: UploadCategory, updated: File[]) => {
    setFiles((prev) => ({ ...prev, [category]: updated }));
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 || (await trigger(fields));
    if (!valid) return;
    setDirection(1);
    setStep((s) => {
      const next = Math.min(s + 1, TOTAL_STEPS - 1);
      if (next === TOTAL_STEPS - 1) reachedLastStepAt.current = Date.now();
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (values: FormValues) => {
    // Safety guards: only submit from the last step, never twice at once,
    // and ignore clicks landing right after the step transition.
    if (step !== TOTAL_STEPS - 1 || submitting) return;
    if (Date.now() - reachedLastStepAt.current < 600) return;
    setSubmitting(true);
    setSubmitError(null);
    setUploadProgress(0);
    try {
      await submitOnboarding(values, files, selectedPalettes, setUploadProgress);
      clearDraft();
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const totalFiles = Object.values(files).reduce((sum, list) => sum + list.length, 0);

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <SuccessScreen />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:py-12">
      {/* Intro header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-4 text-2xl font-extrabold text-slate-800 sm:text-3xl">
          תודה על שיחת האפיון 😊
        </h1>
        <p className="mx-auto max-w-md leading-relaxed text-slate-500">
          כדי שאוכל להתחיל לבנות את האתר, אשמח אם תעלה את החומרים הבאים.
          <br />
          אם אין לך משהו מסוים פשוט דלג עליו.
          <br />
          זה לוקח בערך חמש דקות.
        </p>
      </motion.header>

      <ProgressBar currentStep={step} />

      {/*
        The native submit event is blocked entirely: pressing Enter in a field
        (or browser autofill) must never submit the form. Submission happens
        only through an explicit click on the submit button below.
      */}
      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-indigo-500/5 sm:p-9">
          {/* Autosave indicator */}
          <div className="pointer-events-none absolute top-4 left-5 h-5">
            <AnimatePresence>
              {justSaved && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-emerald-500"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  נשמר אוטומטית
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {step === 0 && <StepBusinessDetails register={register} errors={errors} />}
              {step === 1 && (
                <StepUploads
                  register={register}
                  errors={errors}
                  files={files}
                  onFilesChange={handleFilesChange}
                />
              )}
              {step === 2 && (
                <StepPalettes selected={selectedPalettes} onChange={setSelectedPalettes} />
              )}
              {step === 3 && <StepBranding register={register} errors={errors} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Submission error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600"
            >
              {submitError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress during submission */}
        {submitting && (
          <div className="mt-4 rounded-2xl bg-white p-5 shadow-md">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
              <span>
                {totalFiles > 0 ? `מעלה ${totalFiles} קבצים...` : 'שולח את הפרטים...'}
              </span>
              <span className="text-indigo-600">{uploadProgress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-violet-500"
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
            {uploadProgress === 100 && (
              <p className="mt-2 text-xs text-slate-400">
                מארגן את הקבצים בתיקיות... עוד רגע מסיימים
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={goBack} disabled={submitting} className="btn-secondary">
              <svg className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              חזרה
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <button type="button" onClick={goNext} className="btn-primary">
              המשך
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  שולח...
                </>
              ) : (
                'שליחת החומרים 🚀'
              )}
            </button>
          )}
        </div>
      </form>

      <footer className="mt-10 text-center text-xs text-slate-400">
        הטופס נשמר אוטומטית - אפשר לחזור ולהשלים מאוחר יותר
      </footer>
    </main>
  );
}
