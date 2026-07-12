import { useEffect, useRef, useState } from 'react';
import type { UseFormWatch } from 'react-hook-form';
import { EMPTY_FORM, type FormValues } from '../types';

const STORAGE_KEY = 'onboarding-form-draft';

/** Loads a previously autosaved draft (files cannot be persisted, only text). */
export function loadDraft(): FormValues {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FORM;
    return { ...EMPTY_FORM, ...JSON.parse(raw) };
  } catch {
    return EMPTY_FORM;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Autosaves the form to localStorage (debounced) whenever any value changes.
 * Returns true briefly after each save so the UI can show a "נשמר" indicator.
 */
export function useAutosave(watch: UseFormWatch<FormValues>): boolean {
  const [justSaved, setJustSaved] = useState(false);
  const debounceRef = useRef<number>();
  const indicatorRef = useRef<number>();

  useEffect(() => {
    const subscription = watch((values) => {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
          setJustSaved(true);
          window.clearTimeout(indicatorRef.current);
          indicatorRef.current = window.setTimeout(() => setJustSaved(false), 2000);
        } catch {
          // Storage full / unavailable - autosave is best-effort only.
        }
      }, 600);
    });
    return () => {
      subscription.unsubscribe();
      window.clearTimeout(debounceRef.current);
      window.clearTimeout(indicatorRef.current);
    };
  }, [watch]);

  return justSaved;
}
